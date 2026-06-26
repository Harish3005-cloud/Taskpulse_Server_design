const Project = require('./projects.model');
const Workspace = require('../workspaces/workspaces.model');
const Task = require('../tasks/tasks.model');
const AppError = require('../../shared/utils/AppError');
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy'
  }
});

const verifyWorkspaceMembership = async (workspaceId, userId) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    'members.userId': userId,
    archivedAt: null
  });

  if (!workspace) {
    throw new AppError('Workspace not found or access denied', 404);
  }
  return workspace;
};

const createProject = async (workspaceId, userId, data) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const project = await Project.create({
    workspaceId,
    name: data.name,
    summary: data.summary,
    description: data.description,
    lead: data.lead || userId,
    members: data.members || [],
    labels: data.labels || [],
    status: data.status || 'todo',
    startDate: data.startDate || null,
    targetDate: data.targetDate || null
  });

  return project;
};

const listProjects = async (workspaceId, userId) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const projects = await Project.find({ workspaceId, archivedAt: null })
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar')
    .sort('-createdAt')
    .lean();

  const projectIds = projects.map(p => p._id);
  const stats = await Task.aggregate([
    { $match: { workspaceId, archivedAt: null, projectId: { $in: projectIds } } },
    { $group: {
        _id: '$projectId',
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        pendingTasks: { $sum: { $cond: [{ $ne: ['$status', 'done'] }, 1, 0] } },
        overdueTasks: { $sum: { $cond: [
          { $and: [
              { $ne: ['$status', 'done'] },
              { $ne: ['$dueDate', null] },
              { $lt: ['$dueDate', new Date()] }
          ]}, 1, 0
        ]}}
    }}
  ]);

  const statsMap = stats.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr;
    return acc;
  }, {});

  return projects.map(p => {
    const s = statsMap[p._id.toString()] || { totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 };
    const progress = s.totalTasks > 0 ? Math.round((s.completedTasks / s.totalTasks) * 100) : 0;
    
    // Auto-update project status based on progress
    let derivedStatus = p.status;
    if (progress === 100 && s.totalTasks > 0) derivedStatus = 'done';
    else if (progress > 0 && p.status === 'todo') derivedStatus = 'in-progress';
    
    return { ...p, ...s, progress, status: derivedStatus };
  });
};

const getProject = async (projectId, workspaceId, userId) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const project = await Project.findOne({ _id: projectId, workspaceId, archivedAt: null })
    .populate('lead', 'name email avatar')
    .populate('members', 'name email avatar')
    .lean();

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const stats = await Task.aggregate([
    { $match: { workspaceId, archivedAt: null, projectId: project._id } },
    { $group: {
        _id: '$projectId',
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
        pendingTasks: { $sum: { $cond: [{ $ne: ['$status', 'done'] }, 1, 0] } },
        overdueTasks: { $sum: { $cond: [
          { $and: [
              { $ne: ['$status', 'done'] },
              { $ne: ['$dueDate', null] },
              { $lt: ['$dueDate', new Date()] }
          ]}, 1, 0
        ]}}
    }}
  ]);

  const s = stats.length > 0 ? stats[0] : { totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 };
  const progress = s.totalTasks > 0 ? Math.round((s.completedTasks / s.totalTasks) * 100) : 0;

  let derivedStatus = project.status;
  if (progress === 100 && s.totalTasks > 0) derivedStatus = 'done';
  else if (progress > 0 && project.status === 'todo') derivedStatus = 'in-progress';

  return { ...project, ...s, progress, status: derivedStatus };
};

const updateProject = async (projectId, workspaceId, userId, data) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const project = await Project.findOne({ _id: projectId, workspaceId, archivedAt: null });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const allowedFields = ['name', 'summary', 'description', 'lead', 'members', 'labels', 'status', 'startDate', 'targetDate'];
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      project[field] = data[field];
    }
  });

  await project.save();
  return project;
};

const archiveProject = async (projectId, workspaceId, userId) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const project = await Project.findOne({ _id: projectId, workspaceId, archivedAt: null });

  if (!project) {
    throw new AppError('Project not found', 404);
  }

  project.archivedAt = new Date();
  await project.save();
  return true;
};

const getPresignedUrl = async (projectId, workspaceId, userId, fileDetails) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const project = await Project.findOne({ _id: projectId, workspaceId, archivedAt: null });
  if (!project) {
    throw new AppError('Project not found', 404);
  }

  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new AppError('S3 Bucket name is not configured', 500);
  }

  const fileExtension = fileDetails.fileName.split('.').pop();
  const randomString = crypto.randomBytes(8).toString('hex');
  const objectKey = `workspaces/${workspaceId}/projects/${projectId}/attachments/${randomString}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: fileDetails.mimeType,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${objectKey}`;

  project.attachments.push({
    fileName: fileDetails.fileName,
    fileUrl: fileUrl,
    fileSize: fileDetails.fileSize,
    mimeType: fileDetails.mimeType,
    uploadedAt: new Date()
  });

  await project.save();

  return { presignedUrl, fileUrl, attachment: project.attachments[project.attachments.length - 1] };
};

module.exports = {
  createProject,
  listProjects,
  getProject,
  updateProject,
  archiveProject,
  getPresignedUrl
};

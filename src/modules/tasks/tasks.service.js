const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const Task = require('./tasks.model');
const Workspace = require('../workspaces/workspaces.model');
const Project = require('../projects/projects.model');
const AppError = require('../../shared/utils/AppError');
const crypto = require('crypto');
const notificationService = require('../notifications/notifications.service');

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

const verifyProjectAccess = async (projectId, workspaceId) => {
  if (!projectId) return null;
  const project = await Project.findOne({ _id: projectId, workspaceId, archivedAt: null });
  if (!project) throw new AppError('Project not found in this workspace', 404);
  return project;
};

// Export full task record to S3
const exportTaskToS3 = async (task) => {
  try {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) return; // Skip if S3 not configured

    const objectKey = `workspaces/${task.workspaceId}/projects/${task.projectId || 'unassigned'}/tasks/${task._id}/record.json`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: 'application/json',
      Body: JSON.stringify(task.toObject ? task.toObject() : task, null, 2)
    });

    await s3Client.send(command);
  } catch (error) {
    console.error(`Failed to export task ${task._id} to S3:`, error);
  }
};

const listTasks = async (workspaceId, userId, query = {}) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const filter = { workspaceId, archivedAt: null };

  if (query.projectId) filter.projectId = query.projectId;
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = Number(query.priority);
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.createdBy) filter.createdBy = query.createdBy;
  if (query.category) filter['ai.category'] = query.category;

  if (query.from || query.to) {
    filter.dueDate = {};
    if (query.from) filter.dueDate.$gte = new Date(query.from);
    if (query.to) filter.dueDate.$lte = new Date(query.to);
  }

  if (query.search) {
    const searchRegex = { $regex: query.search, $options: 'i' };
    filter.$or = [
      { title: searchRegex },
      { summary: searchRegex },
      { description: searchRegex },
      { userLabels: searchRegex }
    ];
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const sortStr = query.sort || '-createdAt';
  const sortObj = {};
  if (sortStr.startsWith('-')) {
    sortObj[sortStr.substring(1)] = -1;
  } else {
    sortObj[sortStr] = 1;
  }

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('projectId', 'name')
    .sort(sortObj)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Task.countDocuments(filter);

  return {
    tasks,
    total,
    page,
    pages: Math.ceil(total / limit)
  };
};

const getTask = async (taskId, workspaceId, userId) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const task = await Task.findOne({ _id: taskId, workspaceId, archivedAt: null })
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('projectId', 'name')
    .lean();

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  return task;
};

const aiService = require('./ai.service');

const createTask = async (workspaceId, userId, data) => {
  await verifyWorkspaceMembership(workspaceId, userId);
  await verifyProjectAccess(data.projectId, workspaceId);

  // Call OpenRouter AI to score the task
  const aiScore = await aiService.scoreTask(data.title, data.description);

  const task = await Task.create({
    workspaceId,
    projectId: data.projectId,
    title: data.title,
    summary: data.summary || '',
    description: data.description || '',
    status: data.status || 'todo',
    priority: data.priority || 3,
    createdBy: userId,
    assignedTo: data.assignedTo || null,
    dueDate: data.dueDate || null,
    userLabels: data.userLabels || [],
    ai: aiScore
  });

  await exportTaskToS3(task);

  // Trigger Notifications
  if (task.assignedTo && task.assignedTo.toString() !== userId.toString()) {
    await notificationService.createNotification({
      userId: task.assignedTo,
      workspaceId,
      type: 'task_assigned',
      title: 'Task Assigned',
      preview: `You were assigned to: ${task.title}`,
      taskId: task._id,
      projectId: task.projectId,
      actorId: userId
    });
  }

  // Parse mentions in description
  await notificationService.parseMentionsAndNotify(
    task.description,
    workspaceId,
    userId,
    'task_mention',
    'Mentioned in Task',
    `You were mentioned in task: ${task.title}`,
    { taskId: task._id, projectId: task.projectId }
  );

  return task;
};

const updateTask = async (taskId, workspaceId, userId, data) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const task = await Task.findOne({ _id: taskId, workspaceId, archivedAt: null });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  if (data.projectId && String(data.projectId) !== String(task.projectId)) {
    await verifyProjectAccess(data.projectId, workspaceId);
  }

  // Capture old state for notification logic
  const oldAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;
  const oldStatus = task.status;

  const allowedFields = ['title', 'summary', 'description', 'status', 'priority', 'assignedTo', 'dueDate', 'userLabels', 'projectId'];
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      task[field] = data[field];
    }
  });

  if (data.status === 'done' && !task.completedAt) {
    task.completedAt = new Date();
  } else if (data.status && data.status !== 'done') {
    task.completedAt = null;
  }

  await task.save();
  await exportTaskToS3(task);
  
  // Trigger Notifications
  const newAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;
  if (newAssignedTo && newAssignedTo !== oldAssignedTo && newAssignedTo !== userId.toString()) {
    await notificationService.createNotification({
      userId: task.assignedTo,
      workspaceId,
      type: 'task_assigned',
      title: 'Task Assigned',
      preview: `You were assigned to: ${task.title}`,
      taskId: task._id,
      projectId: task.projectId,
      actorId: userId
    });
  } else if (task.status !== oldStatus && newAssignedTo && newAssignedTo !== userId.toString()) {
    // Notify assignee of status change
    await notificationService.createNotification({
      userId: task.assignedTo,
      workspaceId,
      type: 'task_updated',
      title: 'Task Updated',
      preview: `Status changed to ${task.status} for: ${task.title}`,
      taskId: task._id,
      projectId: task.projectId,
      actorId: userId
    });
  }

  if (data.description !== undefined) {
    await notificationService.parseMentionsAndNotify(
      task.description,
      workspaceId,
      userId,
      'task_mention',
      'Mentioned in Task',
      `You were mentioned in an update to: ${task.title}`,
      { taskId: task._id, projectId: task.projectId }
    );
  }

  return task;
};

const deleteTask = async (taskId, workspaceId, userId) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const task = await Task.findOne({ _id: taskId, workspaceId, archivedAt: null });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  task.archivedAt = new Date();
  await task.save();
  
  await exportTaskToS3(task);
  
  return true;
};

const getPresignedUrl = async (taskId, workspaceId, userId, fileDetails) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const task = await Task.findOne({ _id: taskId, workspaceId, archivedAt: null });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new AppError('S3 Bucket name is not configured', 500);
  }

  const fileExtension = fileDetails.fileName.split('.').pop();
  const randomString = crypto.randomBytes(8).toString('hex');
  const objectKey = `workspaces/${workspaceId}/projects/${task.projectId || 'unassigned'}/tasks/${taskId}/attachments/${randomString}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ContentType: fileDetails.mimeType,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'eu-north-1'}.amazonaws.com/${objectKey}`;

  task.attachments.push({
    fileName: fileDetails.fileName,
    fileUrl: fileUrl,
    fileSize: fileDetails.fileSize,
    mimeType: fileDetails.mimeType,
    uploadedAt: new Date()
  });

  await task.save();

  return { presignedUrl, fileUrl, attachment: task.attachments[task.attachments.length - 1] };
};

module.exports = {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getPresignedUrl
};

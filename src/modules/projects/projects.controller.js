const projectService = require('./projects.service');
const AppError = require('../../shared/utils/AppError');
const mongoose = require('mongoose');

const createProject = async (req, res, next) => {
  try {
    const { workspaceId, ...data } = req.body;
    if (!workspaceId) throw new AppError('workspaceId is required', 400);
    if (!data.name) throw new AppError('Project name is required', 400);

    const project = await projectService.createProject(workspaceId, req.user.id, data);
    res.status(201).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

const listProjects = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) throw new AppError('workspaceId query parameter is required', 400);

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      throw new AppError('Invalid workspaceId', 400);
    }
    const safeWorkspaceId = new mongoose.Types.ObjectId(workspaceId).toString();

    const projects = await projectService.listProjects(safeWorkspaceId, req.user.id);
    res.status(200).json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

const listSharedProjects = async (req, res, next) => {
  try {
    const projects = await projectService.listSharedProjects(req.user.id);
    res.status(200).json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) throw new AppError('workspaceId query parameter is required', 400);

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      throw new AppError('Invalid workspaceId', 400);
    }
    const safeWorkspaceId = new mongoose.Types.ObjectId(workspaceId).toString();

    const project = await projectService.getProject(req.params.id, safeWorkspaceId, req.user.id);
    res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { workspaceId, ...data } = req.body;
    if (!workspaceId) throw new AppError('workspaceId is required in body', 400);

    const project = await projectService.updateProject(req.params.id, workspaceId, req.user.id, data);
    res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

const archiveProject = async (req, res, next) => {
  try {
    const { workspaceId } = req.body;
    if (!workspaceId) throw new AppError('workspaceId is required in body', 400);

    await projectService.archiveProject(req.params.id, workspaceId, req.user.id);
    res.status(200).json({ success: true, message: 'Project successfully archived' });
  } catch (error) {
    next(error);
  }
};

const getPresignedUrl = async (req, res, next) => {
  try {
    const { workspaceId, fileName, fileSize, mimeType } = req.body;
    if (!workspaceId || !fileName || !fileSize || !mimeType) {
      throw new AppError('workspaceId, fileName, fileSize, and mimeType are required', 400);
    }

    const result = await projectService.getPresignedUrl(req.params.id, workspaceId, req.user.id, {
      fileName,
      fileSize,
      mimeType
    });

    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    const { workspaceId, email, role } = req.body;
    if (!workspaceId || !email) throw new AppError('workspaceId and email are required', 400);

    const invite = await projectService.inviteMember(req.params.id, workspaceId, req.user.id, email, role, req.user.name);
    res.status(201).json({ success: true, invite });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { workspaceId } = req.body;
    if (!workspaceId) throw new AppError('workspaceId is required', 400);

    const project = await projectService.removeMember(req.params.id, workspaceId, req.user.id, req.params.userId);
    res.status(200).json({ success: true, project });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  listProjects,
  listSharedProjects,
  getProject,
  updateProject,
  archiveProject,
  getPresignedUrl,
  inviteMember,
  removeMember
};

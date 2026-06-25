const projectService = require('./projects.service');
const AppError = require('../../shared/utils/AppError');

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

    const projects = await projectService.listProjects(workspaceId, req.user.id);
    res.status(200).json({ success: true, projects });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) throw new AppError('workspaceId query parameter is required', 400);

    const project = await projectService.getProject(req.params.id, workspaceId, req.user.id);
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

module.exports = {
  createProject,
  listProjects,
  getProject,
  updateProject,
  archiveProject
};

const AppError = require('../../shared/utils/AppError');
const analyticsService = require('./analytics.service');

const getSummary = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) throw new AppError('workspaceId query parameter is required', 400);

    const summary = await analyticsService.getWorkspaceSummary(workspaceId, req.user.id);
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) throw new AppError('workspaceId query parameter is required', 400);

    const projects = await analyticsService.getProjectProgress(workspaceId, req.user.id);
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) throw new AppError('workspaceId query parameter is required', 400);

    const statusDist = await analyticsService.getTaskStatusDistribution(workspaceId, req.user.id);
    res.status(200).json(statusDist);
  } catch (error) {
    next(error);
  }
};

const getPriorities = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) throw new AppError('workspaceId query parameter is required', 400);

    const priorities = await analyticsService.getPriorityDistribution(workspaceId, req.user.id);
    res.status(200).json(priorities);
  } catch (error) {
    next(error);
  }
};

const getTeam = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) throw new AppError('workspaceId query parameter is required', 400);

    const team = await analyticsService.getTeamPerformance(workspaceId, req.user.id);
    res.status(200).json(team);
  } catch (error) {
    next(error);
  }
};

const getDeadlines = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) throw new AppError('workspaceId query parameter is required', 400);

    const deadlines = await analyticsService.getUpcomingDeadlines(workspaceId, req.user.id);
    res.status(200).json(deadlines);
  } catch (error) {
    next(error);
  }
};

const getTrends = async (req, res, next) => {
  try {
    const { workspaceId, range } = req.query;
    if (!workspaceId) throw new AppError('workspaceId query parameter is required', 400);

    const trends = await analyticsService.getCompletionTrends(workspaceId, req.user.id, range);
    res.status(200).json(trends);
  } catch (error) {
    next(error);
  }
};

const getWorkspaceHealth = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) throw new AppError('workspaceId query parameter is required', 400);

    const health = await analyticsService.getWorkspaceHealth(workspaceId, req.user.id);
    res.status(200).json(health);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getProjects,
  getStatus,
  getPriorities,
  getTeam,
  getDeadlines,
  getTrends,
  getWorkspaceHealth
};

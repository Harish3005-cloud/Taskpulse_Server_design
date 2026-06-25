const viewsService = require('./views.service');
const AppError = require('../../shared/utils/AppError');

const createView = async (req, res, next) => {
  try {
    const { workspaceId, ...data } = req.body;
    if (!workspaceId) throw new AppError('workspaceId is required', 400);
    if (!data.name) throw new AppError('View name is required', 400);

    const view = await viewsService.createView(workspaceId, req.user.id, data);
    res.status(201).json({ success: true, view });
  } catch (error) {
    next(error);
  }
};

const listViews = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) throw new AppError('workspaceId query parameter is required', 400);

    const views = await viewsService.listViews(workspaceId, req.user.id);
    res.status(200).json({ success: true, views });
  } catch (error) {
    next(error);
  }
};

const deleteView = async (req, res, next) => {
  try {
    const { workspaceId } = req.body;
    if (!workspaceId) throw new AppError('workspaceId is required in body', 400);

    await viewsService.deleteView(req.params.id, workspaceId, req.user.id);
    res.status(200).json({ success: true, message: 'View successfully deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createView,
  listViews,
  deleteView
};

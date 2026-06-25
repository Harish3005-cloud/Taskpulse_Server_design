const View = require('./views.model');
const Workspace = require('../workspaces/workspaces.model');
const AppError = require('../../shared/utils/AppError');

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

const createView = async (workspaceId, userId, data) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const view = await View.create({
    workspaceId,
    name: data.name,
    createdBy: userId,
    filters: data.filters || {}
  });

  return view;
};

const listViews = async (workspaceId, userId) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  // Users can see views they created, or potentially workspace views in the future.
  const views = await View.find({ workspaceId, createdBy: userId }).lean();
  return views;
};

const deleteView = async (viewId, workspaceId, userId) => {
  await verifyWorkspaceMembership(workspaceId, userId);

  const view = await View.findOneAndDelete({ _id: viewId, workspaceId, createdBy: userId });

  if (!view) {
    throw new AppError('View not found or access denied', 404);
  }

  return true;
};

module.exports = {
  createView,
  listViews,
  deleteView
};

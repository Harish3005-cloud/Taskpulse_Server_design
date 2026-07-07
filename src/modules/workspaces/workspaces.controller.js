const workspaceService = require('./workspaces.service');
const AppError = require('../../shared/utils/AppError');

/**
 * GET /api/v1/workspaces
 * List all workspaces the authenticated user belongs to.
 */
const listWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await workspaceService.listWorkspaces(req.user.id);

    res.status(200).json({
      success: true,
      count: workspaces.length,
      workspaces
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/workspaces/:id
 * Get a specific workspace by ID.
 */
const getWorkspace = async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspaceById(
      req.params.id, 
      req.user.id
    );

    res.status(200).json({
      success: true,
      workspace
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/workspaces/:id/members
 * Get members of a specific workspace.
 */
const getWorkspaceMembers = async (req, res, next) => {
  try {
    const workspace = await workspaceService.getWorkspaceById(
      req.params.id, 
      req.user.id
    );

    const members = workspace.members.map(m => ({
      _id: m.userId._id,
      name: m.userId.name,
      email: m.userId.email,
      avatar: m.userId.avatar,
      role: m.role,
      joinedAt: m.joinedAt
    }));

    res.status(200).json({
      success: true,
      members
    });
  } catch (error) {
    next(error);
  }
};


/**
 * PATCH /api/v1/workspaces/:id
 * Update a workspace (owner/admin only).
 */
const updateWorkspace = async (req, res, next) => {
  try {
    const workspace = await workspaceService.updateWorkspace(
      req.params.id,
      req.body,
      req.user.id
    );

    res.status(200).json({
      success: true,
      workspace
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listWorkspaces,
  getWorkspace,
  getWorkspaceMembers,
  updateWorkspace
};

const Workspace = require('./workspaces.model');
const AppError = require('../../shared/utils/AppError');

/**
 * List all workspaces where the user is a member
 */
const listWorkspaces = async (userId) => {
  const workspaces = await Workspace.find({
    'members.userId': userId,
    archivedAt: null
  })
    .select('name timezone plan members settings createdAt')
    .sort({ createdAt: -1 })
    .lean();

  // Add the user's role to each workspace
  return workspaces.map(ws => {
    const member = ws.members.find(m => m.userId.toString() === userId.toString());
    return {
      ...ws,
      currentUserRole: member?.role || 'member',
      memberCount: ws.members.length
    };
  });
};

/**
 * Get a single workspace by ID (verify membership)
 */
const getWorkspaceById = async (workspaceId, userId) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    'members.userId': userId,
    archivedAt: null
  })
    .populate('members.userId', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .lean();

  if (!workspace) {
    throw new AppError('Workspace not found or access denied', 404);
  }

  return workspace;
};

/**
 * Create a new workspace (creator becomes owner)
 */
const createWorkspace = async (data, userId) => {
  const workspace = await Workspace.create({
    name: data.name,
    timezone: data.timezone || 'UTC',
    createdBy: userId,
    members: [{ userId, role: 'owner' }],
    settings: data.settings || {}
  });

  return workspace;
};

/**
 * Update workspace (owner/admin only)
 */
const updateWorkspace = async (workspaceId, data, userId) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    archivedAt: null
  });

  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  // Check if user is owner or admin
  const member = workspace.members.find(
    m => m.userId.toString() === userId.toString()
  );

  if (!member || !['owner', 'admin'].includes(member.role)) {
    throw new AppError('Only owners and admins can update workspaces', 403);
  }

  // Apply allowed updates
  const allowedFields = ['name', 'timezone', 'settings'];
  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      workspace[field] = data[field];
    }
  });

  await workspace.save();
  return workspace;
};

const crypto = require('crypto');
const Invite = require('./invites.model');

/**
 * Create an invite link for a workspace
 */
const createInvite = async (workspaceId, userId, expiresInDays = 7) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    archivedAt: null
  });

  if (!workspace) {
    throw new AppError('Workspace not found', 404);
  }

  // Check if user is owner or admin
  const member = workspace.members.find(
    m => m.userId.toString() === userId.toString()
  );

  if (!member || !['owner', 'admin'].includes(member.role)) {
    throw new AppError('Only owners and admins can create invites', 403);
  }

  // Generate a secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const invite = await Invite.create({
    workspaceId,
    token,
    createdBy: userId,
    expiresAt
  });

  return invite;
};

module.exports = {
  listWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  createInvite
};

const workspaceService = require('./workspaces.service');
const AppError = require('../../shared/utils/AppError');
const { sendWorkspaceInviteEmail } = require('../../shared/services/email.service');

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

/**
 * POST /api/v1/workspaces/:id/invites
 * Create an invite token/link (owner/admin only).
 */
const createInvite = async (req, res, next) => {
  try {
    const { expiresInDays, emails } = req.body;
    
    // Get the workspace name for the email
    const workspace = await workspaceService.getWorkspaceById(req.params.id, req.user.id);

    // If emails array is provided, create a token for each and send emails
    if (emails && Array.isArray(emails) && emails.length > 0) {
      const invites = [];
      
      for (const email of emails) {
        const invite = await workspaceService.createInvite(
          req.params.id,
          req.user.id,
          expiresInDays
        );
        
        const inviteUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/invite/${invite.token}`;
        
        // Send email in background
        sendWorkspaceInviteEmail(email, inviteUrl, workspace.name, req.user.name || 'Your Team');
        
        invites.push({
          email,
          token: invite.token,
          url: inviteUrl
        });
      }

      return res.status(201).json({
        success: true,
        message: `Invites sent to ${emails.length} users`,
        invites
      });
    }

    // Default behavior: create a single shareable link
    const invite = await workspaceService.createInvite(
      req.params.id,
      req.user.id,
      expiresInDays
    );

    const inviteUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}/invite/${invite.token}`;

    res.status(201).json({
      success: true,
      invite: {
        token: invite.token,
        url: inviteUrl,
        expiresAt: invite.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listWorkspaces,
  getWorkspace,
  getWorkspaceMembers,
  updateWorkspace,
  createInvite
};

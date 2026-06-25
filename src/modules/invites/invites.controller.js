const Invite = require('../workspaces/invites.model');
const Workspace = require('../workspaces/workspaces.model');
const AppError = require('../../shared/utils/AppError');

/**
 * GET /api/v1/invites/:token
 * Validate invite token (public)
 */
const validateInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    const invite = await Invite.findOne({ token }).populate('workspaceId', 'name');

    if (!invite) {
      throw new AppError('Invite not found or invalid', 404);
    }

    if (new Date() > invite.expiresAt) {
      throw new AppError('Invite has expired', 400);
    }

    if (invite.claimedBy) {
      throw new AppError('Invite has already been claimed', 400);
    }

    res.status(200).json({
      success: true,
      invite: {
        id: invite._id,
        workspaceName: invite.workspaceId ? invite.workspaceId.name : 'Unknown Workspace',
        expiresAt: invite.expiresAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/invites/:token/claim
 * Claim an invite and join workspace (authenticated)
 */
const claimInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;

    const invite = await Invite.findOne({ token });

    if (!invite) {
      throw new AppError('Invite not found or invalid', 404);
    }

    if (new Date() > invite.expiresAt) {
      throw new AppError('Invite has expired', 400);
    }

    if (invite.claimedBy) {
      throw new AppError('Invite has already been claimed', 400);
    }

    const workspace = await Workspace.findById(invite.workspaceId);
    if (!workspace) {
      throw new AppError('Workspace no longer exists', 404);
    }

    // Check if user is already a member
    const isMember = workspace.members.some(member => member.userId.toString() === userId);
    if (isMember) {
      throw new AppError('User is already a member of this workspace', 400);
    }

    // Add user to workspace members
    workspace.members.push({ userId, role: 'member' });
    await workspace.save();

    // Mark invite as claimed
    invite.claimedBy = userId;
    invite.claimedAt = new Date();
    await invite.save();

    res.status(200).json({
      success: true,
      message: 'Successfully joined workspace',
      workspaceId: workspace._id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateInvite,
  claimInvite
};

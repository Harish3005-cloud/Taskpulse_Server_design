const Invitation = require('./invites.model');
const Project = require('../projects/projects.model');
const AppError = require('../../shared/utils/AppError');

const validateInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    const invite = await Invitation.findOne({ token }).populate('projectId', 'name').populate('invitedBy', 'name email');
    
    if (!invite) {
      throw new AppError('Invalid or expired invitation', 404);
    }
    
    if (invite.status !== 'pending') {
      throw new AppError(`This invitation has already been ${invite.status}`, 400);
    }
    
    if (new Date() > invite.expiresAt) {
      invite.status = 'expired';
      await invite.save();
      throw new AppError('This invitation has expired', 400);
    }
    
    res.status(200).json({
      success: true,
      invite: {
        email: invite.email,
        role: invite.role,
        project: invite.projectId,
        invitedBy: invite.invitedBy
      }
    });
  } catch (error) {
    next(error);
  }
};

const claimInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    console.log(`[claimInvite] User ${userId} (${userEmail}) attempting to claim invite token: ${token.substring(0, 8)}...`);
    
    const invite = await Invitation.findOne({ token, status: 'pending' });
    
    if (!invite) {
      console.log(`[claimInvite] No pending invite found for token: ${token.substring(0, 8)}...`);
      throw new AppError('Invalid or expired invitation', 404);
    }
    
    console.log(`[claimInvite] Found invite for email: ${invite.email}, projectId: ${invite.projectId}`);
    
    if (new Date() > invite.expiresAt) {
      invite.status = 'expired';
      await invite.save();
      throw new AppError('This invitation has expired', 400);
    }

    if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
      console.log(`[claimInvite] Email mismatch: invite=${invite.email}, user=${userEmail}`);
      throw new AppError('This invitation is for a different email address', 403);
    }
    
    const project = await Project.findById(invite.projectId);
    if (!project) {
      throw new AppError('The project this invitation belongs to no longer exists', 404);
    }
    
    // Check if user is already a member
    const isMember = project.members.some(m => m.user && m.user.toString() === userId.toString());
    
    if (!isMember) {
      project.members.push({
        user: userId,
        role: invite.role,
        joinedAt: new Date()
      });
      await project.save();
      console.log(`[claimInvite] Added user ${userId} to project ${project.name} (${project._id})`);
    } else {
      console.log(`[claimInvite] User ${userId} is already a member of project ${project._id}`);
    }
    
    // Mark invite as accepted
    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    await invite.save();
    
    console.log(`[claimInvite] Invite accepted successfully. Project workspaceId: ${project.workspaceId}`);
    
    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      project
    });
  } catch (error) {
    console.error(`[claimInvite] Error:`, error.message);
    next(error);
  }
};

module.exports = {
  validateInvite,
  claimInvite
};

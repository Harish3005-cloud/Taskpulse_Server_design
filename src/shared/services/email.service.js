const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Send a workspace invite email using Resend.
 * @param {string} email - The recipient email address.
 * @param {string} inviteUrl - The URL with the invite token.
 * @param {string} workspaceName - The name of the workspace.
 * @param {string} inviterName - The name of the person inviting (optional).
 */
const sendWorkspaceInviteEmail = async (email, inviteUrl, workspaceName, inviterName = 'Someone') => {
  try {
    if (!resend) {
      console.warn('Email service not configured (missing RESEND_API_KEY). Skipping invite email.');
      return null;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px;">
        <h2 style="color: #1a1a1a; margin-top: 0;">You've been invited to TaskPulse!</h2>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
          <strong>${inviterName}</strong> has invited you to join their workspace <strong>${workspaceName}</strong> on TaskPulse.
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
          TaskPulse is an AI-powered collaborative workspace and task management platform. Click the button below to accept the invitation and join the team.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Join Workspace
          </a>
        </div>
        <p style="color: #888; font-size: 14px; margin-top: 30px;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${inviteUrl}" style="color: #6366f1;">${inviteUrl}</a>
        </p>
      </div>
    `;

    const data = await resend.emails.send({
      from: 'TaskPulse <onboarding@resend.dev>', // Update with your verified Resend domain in production
      to: email,
      subject: `You're invited to join ${workspaceName} on TaskPulse`,
      html: html,
    });

    console.log(`Invite email sent successfully to ${email} (ID: ${data.id})`);
    return data;
  } catch (error) {
    console.error(`Failed to send invite email to ${email}:`, error);
    // Don't throw the error, we still want to return the token even if email fails in dev
    return null;
  }
};

module.exports = {
  sendWorkspaceInviteEmail
};

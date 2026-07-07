const { Resend } = require('resend');

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/**
 * Send a project invite email using Resend.
 * @param {string} email - The recipient email address.
 * @param {string} inviteUrl - The URL with the invite token.
 * @param {string} projectName - The name of the project.
 * @param {string} inviterName - The name of the person inviting.
 */
const sendProjectInviteEmail = async (email, inviteUrl, projectName, inviterName = 'Someone') => {
  try {
    if (!resend) {
      console.warn('Email service not configured (missing RESEND_API_KEY). Skipping invite email.');
      return null;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaec; border-radius: 8px;">
        <h2 style="color: #1a1a1a; margin-top: 0;">You're invited to collaborate on TaskPulse</h2>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
          Hello,
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
          <strong>${inviterName}</strong> has invited you to collaborate on <strong>${projectName}</strong> inside TaskPulse.
        </p>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
          TaskPulse is an AI-powered collaborative project management platform. Click the button below to accept your invitation.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
          If you already have a TaskPulse account, you can immediately access the project. If you don't, you will be guided through registration first.
        </p>
        <p style="color: #888; font-size: 14px; margin-top: 30px;">
          If you weren't expecting this invitation, you can safely ignore this email.
        </p>
        <p style="color: #888; font-size: 14px; margin-top: 10px;">
          Regards,<br/>
          TaskPulse Team
        </p>
      </div>
    `;

    const data = await resend.emails.send({
      from: 'TaskPulse <onboarding@resend.dev>', // Update with your verified Resend domain in production
      to: email,
      subject: `You're invited to collaborate on TaskPulse`,
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
  sendProjectInviteEmail
};

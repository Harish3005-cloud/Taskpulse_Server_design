const https = require('https');

/**
 * Send an email using the EmailJS REST API.
 * Requires EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PUBLIC_KEY in env.
 */
const sendEmailJS = (templateParams) => {
  return new Promise((resolve, reject) => {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn('EmailJS not configured (missing EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, or EMAILJS_PUBLIC_KEY). Skipping email.');
      return resolve(null);
    }

    const payload = JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: templateParams
    });

    const options = {
      hostname: 'api.emailjs.com',
      port: 443,
      path: '/api/v1.0/email/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ success: true, response: body });
        } else {
          reject(new Error(`EmailJS responded with status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
};

/**
 * Send a project invite email using EmailJS.
 * @param {string} email - The recipient email address.
 * @param {string} inviteUrl - The URL with the invite token.
 * @param {string} projectName - The name of the project.
 * @param {string} inviterName - The name of the person inviting.
 */
const sendProjectInviteEmail = async (email, inviteUrl, projectName, inviterName = 'Someone') => {
  try {
    const result = await sendEmailJS({
      to_email: email,
      inviter_name: inviterName,
      project_name: projectName,
      invite_url: inviteUrl
    });

    if (result) {
      console.log(`Invite email sent successfully to ${email} via EmailJS`);
    }
    return result;
  } catch (error) {
    console.error(`Failed to send invite email to ${email}:`, error.message);
    // Don't throw — we still want the invite token created even if email fails
    return null;
  }
};

module.exports = {
  sendProjectInviteEmail
};

const { config } = require("../../../config");

exports.forgetPasswordTemplate = async (url, name) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>You recently requested to reset your password for your <strong>${config.projectName}</strong> account. Use the button below to reset it:</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <a href="${url}" style="display: inline-block; background-color: #22BC66; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Your Password
        </a>
      </div>

      <p style="color: #777;">Please note that this password reset link is valid for only 24 hours.</p>
      
      <p>Thanks,<br>The ${config.projectName} Team</p>
      <footer style="margin-top: 30px; font-size: 12px; color: #777;">
        <p>If you didn’t request a password reset, please ignore this email.</p>
      </footer>
    </div>
  `;
};


const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

if (process.env.NODE_ENV === 'production' || process.env.VERIFY_EMAIL === 'true') {
  transporter.verify((error, success) => {
    if (error) {
      logger.error('Email transporter verification failed:', error.message);
    } else {
      logger.info('Email transporter ready');
    }
  });
}

const baseStyles = `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0d9488 0%, #059669 100%); padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); margin: 5px 0 0; font-size: 13px; }
    .content { padding: 30px; }
    .content h2 { color: #0f172a; font-size: 20px; margin: 0 0 15px; }
    .content p { color: #475569; font-size: 14px; margin: 10px 0; }
    .button { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #0d9488 0%, #059669 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 15px 0; }
    .info-box { background: #f0fdfa; border-left: 4px solid #0d9488; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .info-box p { margin: 5px 0; font-size: 13px; }
    .info-box strong { color: #0f172a; }
    .credentials { background: #f8fafc; border: 1px dashed #cbd5e1; padding: 20px; border-radius: 8px; margin: 15px 0; }
    .credentials p { margin: 8px 0; font-family: 'Courier New', monospace; font-size: 14px; }
    .credentials strong { color: #0f172a; font-family: inherit; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #94a3b8; font-size: 12px; margin: 5px 0; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 15px 0; }
    .warning p { color: #92400e; margin: 0; font-size: 13px; }
    a { color: #0d9488; }
  </style>
`;


const buildTemplate = (template, data) => {
  const greeting = `<p>Hello <strong>${data.name || 'User'}</strong>,</p>`;
  const footer = `
    <div class="footer">
      <p>© ${new Date().getFullYear()} AI-ECLT Pro. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  `;


  if (template === 'welcome') {
    const hasCredentials = data.password;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to AI-ECLT</h1>
            <p>Exam Center Locator & Tracker</p>
          </div>
          <div class="content">
            <h2>Account Created Successfully 🎉</h2>
            ${greeting}
            <p>Your account has been created successfully. ${
              hasCredentials
                ? 'Please use the credentials below to login.'
                : 'You can now login to your account.'
            }</p>

            ${
              hasCredentials
                ? `
                <div class="credentials">
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p><strong>Password:</strong> ${data.password}</p>
                  ${data.centerName ? `<p><strong>Center:</strong> ${data.centerName}</p>` : ''}
                  <p><strong>Role:</strong> ${data.role}</p>
                </div>
                <div class="warning">
                  <p><strong>Security Notice:</strong> Please change your password after first login.</p>
                </div>
              `
                : `
                <div class="info-box">
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p><strong>Role:</strong> ${data.role}</p>
                  ${data.centerName ? `<p><strong>Center:</strong> ${data.centerName}</p>` : ''}
                </div>
              `
            }

            <p style="text-align: center;">
              <a href="${data.loginUrl}" class="button">Login to Your Account</a>
            </p>

            <p>If you have any questions, contact your administrator.</p>
          </div>
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  if (template === 'password-reset') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password </h2>
            ${greeting}
            <p>We received a request to reset your password. Click the button below to create a new password:</p>

            <p style="text-align: center;">
              <a href="${data.resetUrl}" class="button">Reset Password</a>
            </p>

            <div class="warning">
              <p>This link will expire in <strong>${data.expiresIn}</strong>.</p>
            </div>

            <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>

            <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">
              Or copy this link: <br>${data.resetUrl}
            </p>
          </div>
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  if (template === 'verify-email') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <h2>Confirm Your Email Address ✉️</h2>
            ${greeting}
            <p>Thank you for registering with AI-ECLT. Please verify your email address by clicking the button below:</p>

            <p style="text-align: center;">
              <a href="${data.verifyUrl}" class="button">Verify Email</a>
            </p>

            <div class="warning">
              <p> This link will expire in <strong>24 hours</strong>.</p>
            </div>

            <p>If you didn't create an account, please ignore this email.</p>

            <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">
              Or copy this link: <br>${data.verifyUrl}
            </p>
          </div>
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  if (template === 'credentials') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Account Credentials</h1>
          </div>
          <div class="content">
            <h2>Login Details</h2>
            ${greeting}
            <p>Your account has been created by the administrator. Use the credentials below to access your account:</p>

            <div class="credentials">
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Password:</strong> ${data.password}</p>
              ${data.centerName ? `<p><strong>Center:</strong> ${data.centerName}</p>` : ''}
              <p><strong>Role:</strong> ${data.role}</p>
            </div>

            <div class="warning">
              <p><strong>Important:</strong> Please change your password after first login for security.</p>
            </div>

            <p style="text-align: center;">
              <a href="${data.loginUrl}" class="button">Login Now</a>
            </p>
          </div>
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  if (template === 'notification') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyles}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.title || 'Notification'}</h1>
          </div>
          <div class="content">
            ${greeting}
            <p>${data.message || ''}</p>
            ${
              data.link
                ? `
              <p style="text-align: center;">
                <a href="${data.link}" class="button">View Details</a>
              </p>
            `
                : ''
            }
          </div>
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.subject || 'AI-ECLT'}</h1>
        </div>
        <div class="content">
          ${greeting}
          <p>${data.message || 'You have a new notification.'}</p>
        </div>
        ${footer}
      </div>
    </body>
    </html>
  `;
};


const sendEmail = async ({ email, subject, template = 'default', data = {} }) => {
  try {
    if (process.env.NODE_ENV === 'test') {
      logger.info(`[TEST] Email skipped: ${subject} → ${email}`);
      return { success: true, skipped: true };
    }

    if (process.env.NODE_ENV === 'development' && process.env.EMAIL_DEV_LOG === 'true') {
      logger.info(` [DEV] Email would be sent:
        To: ${email}
        Subject: ${subject}
        Template: ${template}
        Data: ${JSON.stringify(data, null, 2)}
      `);

      if (process.env.EMAIL_DEV_BLOCK === 'true') {
        return { success: true, blocked: true, devMode: true };
      }
    }

    if (!email || !subject) {
      throw new Error('Email and subject are required');
    }

    const html = buildTemplate(template, data);
    const text = `${subject}\n\nHello ${data.name || 'User'},\n\n${
      data.message || 'Please view this email in an HTML-capable client.'
    }\n\nRegards,\nAI-ECLT Team`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'AI-ECLT <noreply@ai-eclt.com>',
      to: email,
      subject,
      html,
      text,
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'AI-ECLT-Mailer',
      },
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent: ${subject} → ${email} (ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    logger.error(`Email failed: ${subject} → ${email}`, error.message);
    if (process.env.NODE_ENV !== 'production') {
      return { success: false, error: error.message };
    }

    throw error;
  }
};


const sendBulkEmails = async (emails, { subject, template, data }) => {
  const results = await Promise.allSettled(
    emails.map((email) =>
      sendEmail({ email, subject, template, data: { ...data } })
    )
  );

  const successful = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  logger.info(`Bulk email: ${successful} sent, ${failed} failed`);

  return { successful, failed, total: emails.length };
};


module.exports = {
  sendEmail,
  sendBulkEmails,
  transporter,
};
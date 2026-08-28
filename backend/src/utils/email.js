// src/utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ email, subject, template, data }) => {
  try {
    // Simple HTML template
    let html = `
      <h1>${subject}</h1>
      <p>Hello ${data.name || 'User'},</p>
    `;

    if (template === 'welcome') {
      html += `
        <p>Welcome to AI-ECLT! Your account has been created successfully.</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Role:</strong> ${data.role}</p>
        <p><a href="${data.loginUrl}">Click here to login</a></p>
      `;
    } else if (template === 'password-reset') {
      html += `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${data.resetUrl}">Reset Password</a></p>
        <p>This link will expire in ${data.expiresIn}.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;
    } else if (template === 'verify-email') {
      html += `
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${data.verifyUrl}">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>
      `;
    }

    html += `
      <br>
      <p>Regards,<br>AI-ECLT Team</p>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'AI-ECLT <noreply@ai-eclt.com>',
      to: email,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = { sendEmail };
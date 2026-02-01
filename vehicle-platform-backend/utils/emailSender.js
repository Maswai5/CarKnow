const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendPaymentEmail = async ({ to, subject, text, html }) => {
  const from = process.env.EMAIL_FROM || 'no-reply@example.com';
  try {
    await transporter.sendMail({ from, to, subject, text, html });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};
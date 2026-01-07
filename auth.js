// routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { scorePassword, classifyScore } = require('../utils/passwordStrength');
const { sendSMS } = require('../utils/smsSender');
const { sendPaymentEmail } = require('../utils/emailSender');

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set in environment variables');
}

const JWT_SECRET = process.env.JWT_SECRET;

// Signup (email unique, username friendly check, default role = buyer)
router.post('/signup', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  const strengthScore = scorePassword(password);
  const strengthLevel = classifyScore(strengthScore);

  console.log(`Signup password strength: ${strengthLevel} (score: ${strengthScore})`);

  try {
    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (!password || !confirmPassword) return res.status(400).json({ error: 'Password and confirmPassword are required' });
    if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
    if (strengthLevel === 'weak') {
     return res.status(400).json({ error: 'Password is too weak. Use more characters and symbols.' });
  }

    const normEmail = email.toLowerCase();
    const normUsername = (username || '').toLowerCase();

    // Unique email
    const emailCheck = await pool.query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [normEmail]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Friendly username duplication check (optional policy: block or warn)
    const usernameCheck = await pool.query(`SELECT id FROM users WHERE LOWER(username) = LOWER($1)`, [normUsername]);
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already in use, please choose another' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4)`,
      [normUsername, normEmail, hashedPassword, 'buyer']
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during signup:', err.message);
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login (JWT includes role for RBAC)
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  try {
    const lookup = (emailOrUsername || '').toLowerCase();
    const result = await pool.query(
      `SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1`,
      [lookup]
    );

    console.log("DB result:", result.rows);

    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    //await sendPaymentEmail({
      //to: user.email,
      //subject: 'Your login token',
      //text: `Here is your login token: ${token}`,
     // html: `<p>Your login token:</p><pre>${token}</pre>`
    // });
     
     //if (user.phone) {
      //await sendSMS(user.phone, `Your login token: ${token}`);
     //}

     if (!user.email && !user.phone) {
       return res.status(400).json({ error: 'No delivery method available for token' });
    }

    res.status(200).json({
      message: 'Login successful',
      token, // <-- include the JWT in the response
      role: user.role // optional: makes RBAC easier on frontend
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Login (JWT includes role for RBAC)
router.post("/login", async (req, res) => {
  const { emailOrUsername, password } = req.body;
  try {
    const lookup = (emailOrUsername || "").toLowerCase();
    const result = await pool.query(
      `SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1`,
      [lookup]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET, // 👈 load from .env
      { expiresIn: "1h" }
    );

    // optional notifications
    if (user.email) {
      await sendPaymentEmail({
        to: user.email,
        subject: "Your login token",
        text: `Here is your login token: ${token}`,
        html: `<p>Your login token:</p><pre>${token}</pre>`,
      });
    }
    if (user.phone) {
      await sendSMS(user.phone, `Your login token: ${token}`);
    }

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Forgot password (issue reset token)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  try {
    const result = await pool.query(
      `UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE LOWER(email) = LOWER($3)`,
      [token, expiry, email]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Email not found' });

    await sendPaymentEmail({
      to: email,
      subject: 'Password reset link',
      text: `Use this token to reset your password: ${token}. It expires in 1 hour.`,
      html: `<p>Use this token to reset your password:</p><pre>${token}</pre>`
    });

    const user = await pool.query(`SELECT phone FROM users WHERE LOWER(email) = LOWER($1)`, [email]);
    if (user.rows[0]?.phone) {
      await sendSMS(user.rows[0].phone, `Reset token: ${token}`);
    }

    console.log(`[${new Date().toISOString()}] Reset token sent to ${email}${user.rows[0]?.phone ? ' and ' + user.rows[0].phone : ''}`);

    res.status(200).json({ message: 'Reset link sent via email/SMS.' });
  } catch (err) {
    console.error('Error generating reset token:', err.message);
    res.status(500).json({ error: 'Error processing request' });
  }
});

// Reset password (validate token and update)
router.post('/reset-password', async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;
  const strengthScore = scorePassword(newPassword);
  const strengthLevel = classifyScore(strengthScore);

  console.log(`Reset password strength: ${strengthLevel} (score: ${strengthScore})`);

  if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
  if (strengthLevel === 'weak') {
    return res.status(400).json({ error: 'New password is too weak. Use more characters and symbols.' });
  }

  try {
    const result = await pool.query(
      `SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );

    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired token' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2`,
      [hashedPassword, result.rows[0].id]
    );

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Error resetting password:', err.message);
    res.status(500).json({ error: 'Error resetting password' });
  }
});

// Request OTP for sensitive actions
const { generateOTP } = require('../utils/otpGenerator');

router.post('/request-otp', async (req, res) => {
  const { emailOrUsername } = req.body;
  const lookup = (emailOrUsername || '').toLowerCase();

  try {
    const result = await pool.query(
      `SELECT id, email, phone FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1`,
      [lookup]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await pool.query(
      `UPDATE users SET otp_code = $1, otp_expiry = $2 WHERE id = $3`,
      [otp, expiry, user.id]
    );

    if (user.phone) {
      await sendSMS(user.phone, `Your OTP is ${otp}. It expires in 5 minutes.`);
    }

    await sendPaymentEmail({
      to: user.email,
      subject: 'Your OTP code',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
    });

    console.log(`OTP sent to ${user.email}${user.phone ? ' and ' + user.phone : ''}`);
    res.status(200).json({ message: 'OTP sent via email/SMS.' });
  } catch (err) {
    console.error('Error sending OTP:', err.message);
    res.status(500).json({ error: 'Error sending OTP' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { emailOrUsername, otp } = req.body;
  const lookup = (emailOrUsername || '').toLowerCase();

  try {
    const result = await pool.query(
      `SELECT id, otp_code, otp_expiry FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1`,
      [lookup]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];

    if (!user.otp_code || !user.otp_expiry || new Date() > user.otp_expiry || user.otp_code !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await pool.query(
      `UPDATE users SET otp_code = NULL, otp_expiry = NULL WHERE id = $1`,
      [user.id]
    );

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error('Error verifying OTP:', err.message);
    res.status(500).json({ error: 'Error verifying OTP' });
  }
});
module.exports = router;
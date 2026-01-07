// routes/users.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Create admin (super_admin only, email unique, username friendly check)
router.post('/create-admin', verifyToken, requireSuperAdmin, async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (!password) return res.status(400).json({ error: 'Password is required' });
    if (!role) return res.status(400).json({ error: 'Role is required' });

    const normEmail = email.toLowerCase();
    const normUsername = (username || '').toLowerCase();

    const emailCheck = await pool.query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1)`, [normEmail]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const usernameCheck = await pool.query(`SELECT id FROM users WHERE LOWER(username) = LOWER($1)`, [normUsername]);
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Username already in use, please choose another' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [normUsername, normEmail, hashedPassword, role]
    );

    await pool.query(
      `INSERT INTO admin_audit (actor_id, target_id, action, timestamp)
       VALUES ($1, $2, $3, NOW())`,
      [req.user.id, result.rows[0].id, 'create_admin']
    );

    res.status(201).json({ message: `${role} created successfully` });
  } catch (err) {
    console.error('Error creating admin:', err.message);
    if (err.code === '23505') return res.status(400).json({ error: 'Email already in use' });
    res.status(500).json({ error: 'Error creating admin' });
  }
});

// Remove admin (super_admin only)
router.delete('/remove-admin/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 AND role IN ('admin','super_admin') RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Admin not found or cannot be removed' });
    }

    await pool.query(
      `INSERT INTO admin_audit (actor_id, target_id, action, timestamp)
       VALUES ($1, $2, $3, NOW())`,
      [req.user.id, id, 'remove_admin']
    );

    res.status(200).json({ message: 'Admin removed successfully' });
  } catch (err) {
    console.error('Error removing admin:', err.message);
    res.status(500).json({ error: 'Error removing admin' });
  }
});

// List users (super_admin only)
router.get('/list', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, username, email, role FROM users ORDER BY id ASC`);
    res.json({ users: result.rows });
  } catch (err) {
    console.error('Error listing users:', err.message);
    res.status(500).json({ error: 'Error listing users' });
  }
});

// Impersonation: request (super_admin initiates, status=pending)
router.post('/impersonate-request/:id', verifyToken, requireSuperAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const userCheck = await pool.query(`SELECT id FROM users WHERE id = $1`, [id]);
    if (userCheck.rows.length === 0) return res.status(404).json({ error: 'Target user not found' });

    const insert = await pool.query(
      `INSERT INTO impersonation_requests (super_admin_id, target_user_id, reason, status, created_at)
       VALUES ($1, $2, $3, 'pending', NOW()) RETURNING id`,
      [req.user.id, id, reason || null]
    );

    await pool.query(
      `INSERT INTO admin_audit (actor_id, target_id, action, reason, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [req.user.id, id, 'impersonation_requested', reason || null]
    );

    res.status(201).json({ message: 'Impersonation requested', requestId: insert.rows[0].id });
  } catch (err) {
    console.error('Error creating impersonation request:', err.message);
    res.status(500).json({ error: 'Error creating impersonation request' });
  }
});

// Impersonation: respond (target user approves/rejects)
router.post('/impersonate-respond/:requestId', verifyToken, async (req, res) => {
  const { requestId } = req.params;
  const { decision } = req.body; // 'approve' or 'reject'

  try {
    const result = await pool.query(
      `SELECT * FROM impersonation_requests WHERE id = $1`,
      [requestId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Request not found' });

    const request = result.rows[0];

    // Only the account owner can respond
    if (req.user.id !== request.target_user_id) {
      return res.status(403).json({ error: 'Only the account owner can respond' });
    }

    if (decision === 'approve') {
      await pool.query(
        `UPDATE impersonation_requests SET status = 'approved', approved_at = NOW() WHERE id = $1`,
        [requestId]
      );

      await pool.query(
        `INSERT INTO admin_audit (actor_id, target_id, action, timestamp)
         VALUES ($1, $2, $3, NOW())`,
        [request.super_admin_id, request.target_user_id, 'impersonation_approved']
      );

      res.json({ message: 'Impersonation approved' });
    } else {
      await pool.query(
        `UPDATE impersonation_requests SET status = 'rejected' WHERE id = $1`,
        [requestId]
      );

      await pool.query(
        `INSERT INTO admin_audit (actor_id, target_id, action, timestamp)
         VALUES ($1, $2, $3, NOW())`,
        [request.super_admin_id, request.target_user_id, 'impersonation_rejected']
      );

      res.json({ message: 'Impersonation rejected' });
    }
  } catch (err) {
    console.error('Error responding to impersonation:', err.message);
    res.status(500).json({ error: 'Error processing response' });
  }
});

// Impersonation: issue short-lived token (super_admin only, approved requests)
router.post('/impersonate/:requestId', verifyToken, requireSuperAdmin, async (req, res) => {
  const { requestId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM impersonation_requests WHERE id = $1 AND status = 'approved'`,
      [requestId]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Impersonation not approved or invalid request' });
    }

    const request = result.rows[0];
    const target = await pool.query(`SELECT * FROM users WHERE id = $1`, [request.target_user_id]);
    if (target.rows.length === 0) return res.status(404).json({ error: 'Target user not found' });

    const targetUser = target.rows[0];

    const tempToken = jwt.sign(
      { id: targetUser.id, email: targetUser.email, role: targetUser.role, impersonatedBy: req.user.id },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    await pool.query(
      `INSERT INTO admin_audit (actor_id, target_id, action, timestamp)
       VALUES ($1, $2, $3, NOW())`,
      [req.user.id, targetUser.id, 'impersonation_token_issued']
    );

    res.json({ message: `Impersonation token created for ${targetUser.username}`, token: tempToken, expiresIn: '15m' });
  } catch (err) {
    console.error('Error creating impersonation token:', err.message);
    res.status(500).json({ error: 'Error creating impersonation token' });
  }
});

router.post('/update-phone', verifyToken, async (req, res) => {
  const { phone } = req.body;
  const email = req.user.email;

  try {
    await pool.query(
      `UPDATE users SET phone = $1 WHERE LOWER(email) = LOWER($2)`,
      [phone, email]
    );
    await pool.query(
      `INSERT INTO phone_history (email, phone) VALUES ($1, $2)`,
      [email, phone]
    );
    res.json({ message: 'Phone number updated' });
  } catch (err) {
    console.error('Phone update error:', err.message);
    res.status(500).json({ error: 'Failed to update phone number' });
  }
});

module.exports = router;
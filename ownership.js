const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const pool = require('../db');

// OWNERSHIP TRANSFER (admin only)
router.post('/transfer', verifyToken, async (req, res) => {
  const { car_id, new_owner_id, transfer_date, mileage } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: only admins can transfer ownership' });
  }

  try {
    // Insert new ownership
    await pool.query(
      `INSERT INTO ownerships (car_id, owner_id, transfer_date, mileage)
       VALUES ($1, $2, $3, $4)`,
      [car_id, new_owner_id, transfer_date, mileage]
    );

    // Log transfer in ownership_history
    await pool.query(
      `INSERT INTO ownership_history (car_id, owner_id, transfer_date, mileage)
       VALUES ($1, $2, $3, $4)`,
      [car_id, new_owner_id, transfer_date, mileage]
    );

    // Update car mileage
    await pool.query(
      `UPDATE cars SET mileage = $1 WHERE id = $2`,
      [mileage, car_id]
    );

    // 🔹 Audit log
    await pool.query(
      `INSERT INTO report_views (car_id, user_id, role, action)
       VALUES ($1, $2, $3, $4)`,
      [car_id, req.user.id, req.user.role, 'transfer_ownership']
    );

    res.status(200).json({
      message: 'Ownership transferred successfully',
      car_id,
      new_owner_id,
      mileage
    });
  } catch (err) {
    console.error('Error transferring ownership:', err.message);
    res.status(500).json({ error: 'Error transferring ownership' });
  }
});

// UPDATE INSURANCE STATUS (admin only)
router.post('/update-insurance', verifyToken, async (req, res) => {
  const { car_id, insurance_status } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: only admins can update insurance' });
  }

  try {
    await pool.query(
      `UPDATE cars SET insurance_status = $1 WHERE id = $2`,
      [insurance_status, car_id]
    );

    // 🔹 Audit log
    await pool.query(
      `INSERT INTO report_views (car_id, user_id, role, action)
       VALUES ($1, $2, $3, $4)`,
      [car_id, req.user.id, req.user.role, 'update_insurance']
    );

    res.status(200).json({
      message: 'Insurance status updated successfully',
      car_id,
      insurance_status
    });
  } catch (err) {
    console.error('Error updating insurance status:', err.message);
    res.status(500).json({ error: 'Error updating insurance status' });
  }
});

// GET AUDIT LOGS FOR A CAR (admin only)
router.get('/audit/:car_id', verifyToken, async (req, res) => {
  const { car_id } = req.params;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: only admins can view audit logs' });
  }

  try {
    const result = await pool.query(
      `SELECT rv.id, rv.car_id, rv.user_id, u.username, rv.role, rv.action, rv.viewed_at
       FROM report_views rv
       LEFT JOIN users u ON rv.user_id = u.id
       WHERE rv.car_id = $1
       ORDER BY rv.viewed_at DESC`,
      [car_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No audit logs found for this car' });
    }

    res.json({ car_id, audit_logs: result.rows });
  } catch (err) {
    console.error('Error fetching audit logs:', err.message);
    res.status(500).json({ error: 'Error fetching audit logs' });
  }
});

// GET USER'S OWNED CARS
router.get('/user-cars', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.vin, c.make, c.model, c.year, c.mileage, c.status, o.transfer_date
       FROM cars c
       JOIN ownerships o ON c.id = o.car_id
       WHERE o.owner_id = $1
       ORDER BY o.transfer_date DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user cars:', err.message);
    res.status(500).json({ error: 'Error fetching user cars' });
  }
});

module.exports = router;

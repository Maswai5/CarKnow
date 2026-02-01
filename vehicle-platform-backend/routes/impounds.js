const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Add impound record
router.post('/', verifyToken, async (req, res) => {
  const { car_id, impound_date, reason, released, release_date } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO impounds (car_id, impound_date, reason, released, release_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [car_id, impound_date, reason, released, release_date]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'Failed to add impound record' });
    }

    // 🔹 Audit log
    await pool.query(
      `INSERT INTO impound_audit (car_id, user_id, action, reason)
       VALUES ($1, $2, $3, $4)`,
      [car_id, req.user.id, 'impound_added', reason]
    );

    res.status(201).json({ message: 'Impound record added successfully' });
  } catch (err) {
    console.error('Error adding impound record:', err.message);
    res.status(500).json({ error: 'Error adding impound record' });
  }
});

// Update impound record
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { released, release_date, reason } = req.body;

  try {
    const result = await pool.query(
      `UPDATE impounds 
       SET released = $1, release_date = $2, reason = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING car_id`,
      [released, release_date, reason, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Impound record not found' });
    }

    const carId = result.rows[0].car_id;
    const action = released ? 'impound_released' : 'impound_updated';

    // 🔹 Audit log
    await pool.query(
      `INSERT INTO impound_audit (car_id, user_id, action, reason)
       VALUES ($1, $2, $3, $4)`,
      [carId, req.user.id, action, reason]
    );

    res.status(200).json({ message: 'Impound record updated successfully' });
  } catch (err) {
    console.error('Error updating impound record:', err.message);
    res.status(500).json({ error: 'Error updating impound record' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const pool = require('../db');

// ADD SERVICE RECORD (garage only and also admin incase of garage error)
router.post('/add-service', verifyToken, async (req, res) => {
  const { car_id, service_date, description, service_type, service_center, notes, mileage } = req.body;
  const role = req.user.role;

  if (role !== 'garage' ) {
    return res.status(403).json({ error: 'Access denied: only garages can add services' });
  }

  try {
    await pool.query(
      `INSERT INTO services (car_id, service_date, description, service_type, service_center, notes, mileage)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [car_id, service_date, description, service_type, service_center, notes, mileage]
    );

    await pool.query(
      `UPDATE cars SET mileage = $1 WHERE id = $2`,
      [mileage, car_id]
    );

    res.status(200).json({
      message: 'Service record added successfully',
      car_id,
      mileage
    });
  } catch (err) {
    console.error('Error adding service record:', err.message);
    res.status(500).json({ error: 'Error adding service record' });
  }
});

// GET SERVICE RECORDS (garage + admin)
router.get('/services/:car_id', verifyToken, async (req, res) => {
  const { car_id } = req.params;
  const role = req.user.role;

  if (role !== 'garage' && role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: only garages or admins can view services' });
  }

  try {
    const result = await pool.query(
      `SELECT id, car_id, service_date, description, service_type, service_center, notes, mileage
       FROM services
       WHERE car_id = $1
       ORDER BY service_date DESC`,
      [car_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No service records found for this car' });
    }

    res.json({ car_id, service_records: result.rows });
  } catch (err) {
    console.error('Error fetching service records:', err.message); 
    res.status(500).json({ error: 'Error fetching service records' });
  }
});

module.exports = router;
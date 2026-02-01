const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Add accident record with damage classification
router.post('/', verifyToken, async (req, res) => {
  const { car_id, accident_date, description, severity, repaired, damage_classification } = req.body;

  try {
    await pool.query(
      `INSERT INTO accidents (car_id, accident_date, description, severity, repaired, damage_classification)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [car_id, accident_date, description, severity, repaired, damage_classification]
    );

    res.status(201).json({ message: 'Accident recorded successfully' });
  } catch (err) {
    console.error('Error recording accident:', err.message);
    res.status(500).json({ error: 'Error recording accident' });
  }
});

module.exports = router;
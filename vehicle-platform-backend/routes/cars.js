// routes/cars.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// CREATE
router.post('/', async (req, res) => {
  const { vin, make, model, year, mileage, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO cars (vin, make, model, year, mileage, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [vin, make, model, year, mileage, status || 'available']
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// READ ALL
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// READ ONE
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cars WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('Car not found');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// UPDATE
router.put('/:id', async (req, res) => {
  const { vin, make, model, year, mileage, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE cars SET vin=$1, make=$2, model=$3, year=$4, mileage=$5, status=$6 WHERE id=$7 RETURNING *',
      [vin, make, model, year, mileage, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).send('Car not found');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM cars WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).send('Car not found');
    res.json({ message: 'Car deleted successfully', car: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

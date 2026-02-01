require('dotenv').config();
console.log('DB_PASS:', process.env.DB_PASS);
const pool = require('./db');

async function insertCar() {
  try {
    // Insert car
    const carResult = await pool.query(
      `INSERT INTO cars (vin, make, model, year, mileage, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['1HGCM82633A123456', 'Toyota', 'Camry', 2020, 50000, 'available']
    );
    const carId = carResult.rows[0].id;
    console.log('Car inserted with id:', carId);

    // Get auctioneer id
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', ['auctioneer@example.com']);
    const userId = userResult.rows[0].id;

    // Insert ownership
    await pool.query(
      `INSERT INTO ownerships (car_id, owner_id, transfer_date, mileage)
       VALUES ($1, $2, NOW(), $3)`,
      [carId, userId, 50000]
    );
    console.log('Ownership inserted');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

insertCar();
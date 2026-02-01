const pool = require('./db');

async function alterTable() {
  try {
    await pool.query('ALTER TABLE ownerships ADD COLUMN transfer_date TIMESTAMP DEFAULT NOW()');
    await pool.query('ALTER TABLE ownerships ADD COLUMN mileage INTEGER');
    console.log('Columns added');
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

alterTable();
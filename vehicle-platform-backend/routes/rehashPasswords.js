const bcrypt = require("bcryptjs");

const { pool } = new Pool({
  user: "youruser",
  host: "localhost",
  database: "vehicle_platform",
  password: "sikuambi",
  port: 5432,
});

async function rehashPasswords() {
  const res = await pool.query("SELECT id, email, password FROM users");

  for (let row of res.rows) {
    // Only rehash if not already bcrypt
    if (!row.password.startsWith("$2")) {
      const hashed = await bcrypt.hash(row.password, 10);
      await pool.query("UPDATE users SET password=$1 WHERE id=$2", [hashed, row.id]);
      console.log(`Updated password for ${row.email}`);
    }
  }

  console.log("✅ All plain text passwords rehashed");
  process.exit();
}

rehashPasswords();
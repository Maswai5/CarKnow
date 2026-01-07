const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

// Create a single pool connection
const pool = new Pool({
  user: "postgres",          // 👈 replace with your actual Postgres username
  host: "localhost",         // or "127.0.0.1"
  database: "vehicle_platform", // 👈 make sure this DB exists
  password: "sikuambi",      // 👈 your actual Postgres password
  port: 5432,
});

async function seedUsers() {
  const users = [
    { username: "admin", email: "admin@vhp.ke", password: "admin123", role: "admin" },
    { username: "buyer", email: "buyer@vhp.ke", password: "buyer123", role: "buyer" },
    { username: "garage", email: "garage@vhp.ke", password: "garage123", role: "garage" },
    { username: "user1", email: "user@example.com", password: "password123", role: "user" },
    { username: "admin1", email: "admin@example.com", password: "password123", role: "admin" },
    { username: "superadmin1", email: "superadmin@example.com", password: "password123", role: "superadmin" },
  ];

  for (const user of users) {
    // Hash the plain password before inserting
    const hashed = await bcrypt.hash(user.password, 10);

    await pool.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [user.username, user.email, hashed, user.role]
    );

    console.log(`Seeded: ${user.email}`);
  }

  console.log("✅ All users seeded with hashed passwords");
  await pool.end(); // 👈 close connection cleanly
  process.exit();
}

seedUsers();
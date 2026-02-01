require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();

app.use(express.json());
app.use(cors());

//Routers
const carsRouter = require('./routes/cars');
const usersRouter = require('./routes/users');
const reportsRouter = require('./routes/reports');
const authRoutes = require('./routes/auth');
const ownershipRoutes = require('./routes/ownership');
const servicesRouter = require('./routes/services');
const accidentsRouter = require('./routes/accidents');
const impoundsRouter = require('./routes/impounds');
const paymentsRouter = require('./routes/payments');
const adminRouter = require('./routes/admin');
const auctionsRouter = require('./routes/auctions');

app.use('/api/services', servicesRouter);
app.use('/api/cars', carsRouter);
app.use('/api/users', usersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/auth', authRoutes);
app.use('/api/ownership', ownershipRoutes);
app.use('/api/accidents', accidentsRouter);
app.use('/api/impounds', impoundsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auctions', auctionsRouter);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

app.get('/db-check', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.json({ connected: true, time: rows[0].now });
  } catch (err) {
    console.error("DB check failed", err);
    res.status(500).json({ connected: false, error: err.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
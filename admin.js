// routes/admin.js
const express = require('express');
const router = express.Router();
const { listAllPayments } = require('../controllers/paymentController');
const  verifyToken  = require('../middleware/verifyToken');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');

// 🔹 Super admin: list all payments
router.get('/payments', verifyToken, requireSuperAdmin, listAllPayments);

module.exports = router;
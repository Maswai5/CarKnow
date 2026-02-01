const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');
const { listAllPayments } = require('../controllers/paymentController');
const {
  createPaymentLink,
  handleWebhook,
  getReceiptByReference,
  getPaymentStatus
} = require('../controllers/paymentController');

// Public route to initiate payment (no auth required)
router.post('/initiate-payment', createPaymentLink);

// 🔹 Authenticated users can initiate payments
router.post('/create', verifyToken, createPaymentLink);

// 🔹 Webhook (called by SeerBit, no auth required)
router.post('/webhook', handleWebhook);

// 🔹 Check payment status by reference
router.get('/status/:reference', verifyToken, getPaymentStatus);

// 🔹 View receipt by reference
router.get('/receipts/:reference', verifyToken, getReceiptByReference);

// 🔐 Superadmin-only: list all payments
router.get('/admin/payments', verifyToken, requireSuperAdmin, listAllPayments);

// 🔹 Get user's payments
router.get('/user', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

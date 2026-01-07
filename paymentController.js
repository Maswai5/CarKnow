const pool = require('../db');
const crypto = require('crypto');
const { sendSMS } = require('../utils/smsSender');
const { sendPaymentEmail } = require('../utils/emailSender');

// 🔹 SeerBit webhook handler
const handleWebhook = async (req, res) => {
  const signatureHeader = req.headers['x-seerbit-signature'];
  const expectedSignature = crypto
    .createHmac('sha256', process.env.SEERBIT_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signatureHeader !== expectedSignature) {
    console.error('Invalid webhook signature');
    return res.status(403).json({ error: 'Invalid signature' });
  }

  const { reference: paymentReference, email, amount, status } = req.body;

  // 🔹 Log payment (idempotent)
  await pool.query(
    `INSERT INTO payment_logs (reference, email, amount, status, timestamp)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (reference) DO UPDATE
     SET status = EXCLUDED.status, timestamp = EXCLUDED.timestamp`,
    [paymentReference, email, amount, status]
  );

  if (status === 'APPROVED') {
    // 🔹 Unlock gate access
    await pool.query(
      `UPDATE users SET private_gate_access = TRUE WHERE LOWER(email) = LOWER($1)`,
      [email]
    );

    // 🔹 Create receipt (skip if already exists)
    await pool.query(
      `INSERT INTO receipts (reference, email, amount, status, issued_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (reference) DO NOTHING`,
      [paymentReference, email, amount, status]
    );

    // 🔹 Get phone number from webhook or users table
    let phoneNumber = req.body.phoneNumber;

    if (!phoneNumber) {
      const user = await pool.query(
        `SELECT phone FROM users WHERE LOWER(email) = LOWER($1)`,
        [email]
      );
      phoneNumber = user.rows[0]?.phone;
    }

    // 🔹 Send SMS if phone is available
    if (phoneNumber) {
      await sendSMS(phoneNumber, `Payment of KES ${amount} received. Gate access unlocked.`);
      console.log(`SMS sent to ${phoneNumber}`);
    }

    // 🔹 Send email confirmation
    await sendPaymentEmail({
      to: email,
      subject: 'Payment received — gate access unlocked',
      text: `We’ve received your payment of KES ${amount} (Ref: ${paymentReference}). Your gate access is now unlocked.`,
      html: `
        <p>We’ve received your payment of <strong>KES ${amount}</strong>.</p>
        <p><strong>Reference:</strong> ${paymentReference}</p>
        <p>Your gate access is now unlocked.</p>
      `
    });
    console.log(`Email sent to ${email}`);
  }

  res.sendStatus(200);
};

// 🔹 Get receipt by reference
const getReceiptByReference = async (req, res) => {
  const { reference } = req.params;

  try {
    const result = await pool.query(
      `SELECT reference, email, amount, status, issued_at
       FROM receipts WHERE reference = $1`,
      [reference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    res.json({ receipt: result.rows[0] });
  } catch (err) {
    console.error('Receipt fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
};

// 🔹 Get payment status by reference
const getPaymentStatus = async (req, res) => {
  const { reference } = req.params;

  try {
    const result = await pool.query(
      `SELECT reference, email, amount, status, timestamp
       FROM payment_logs WHERE reference = $1`,
      [reference]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const accessCheck = await pool.query(
      `SELECT private_gate_access FROM users WHERE LOWER(email) = LOWER($1)`,
      [result.rows[0].email]
    );

    res.json({
      payment: result.rows[0],
      gateAccessUnlocked: accessCheck.rows[0].private_gate_access
    });
  } catch (err) {
    console.error('Error checking payment status:', err.message);
    res.status(500).json({ error: 'Error checking payment status' });
  }
};

// 🔹 Super admin: list all payments
const listAllPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT reference, email, amount, status, timestamp
       FROM payment_logs
       ORDER BY timestamp DESC`
    );
    res.json({ payments: result.rows });
  } catch (err) {
    console.error('Admin payment fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

const createPaymentLink = async (req, res) => {
  const { emailOrUsername } = req.body;
  const lookup = (emailOrUsername || '').toLowerCase();

  try {
    const result = await pool.query(
      `SELECT id, email, phone FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1`,
      [lookup]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];
    const reference = crypto.randomBytes(8).toString('hex');
    const amount = 100; // KES or USD depending on SeerBit setup

    const paymentLink = `https://checkout.seerbitapi.com/pay/${reference}`; // Replace with actual SeerBit link logic

    await pool.query(
      `INSERT INTO payment_logs (reference, email, amount, status, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [reference, user.email, amount, 'INITIATED']
    );

    await sendPaymentEmail({
      to: user.email,
      subject: 'Your payment link',
      text: `Click to pay: ${paymentLink}`,
      html: `<p>Click to pay: <a href="${paymentLink}">${paymentLink}</a></p>`
    });

    if (user.phone) {
      await sendSMS(user.phone, `Pay here: ${paymentLink}`);
    }

    console.log(`[${new Date().toISOString()}] Payment link sent to ${user.email}${user.phone ? ' and ' + user.phone : ''}`);
    res.status(200).json({ paymentLink });
  } catch (err) {
    console.error('Error creating payment link:', err.message);
    res.status(500).json({ error: 'Error creating payment link' });
  }
};


module.exports = {
  createPaymentLink,
  handleWebhook,
  getReceiptByReference,
  getPaymentStatus,
  listAllPayments
};
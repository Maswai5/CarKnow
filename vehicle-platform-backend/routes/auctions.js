// routes/auctions.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Middleware to check if user is auctioneer
const requireAuctioneer = (req, res, next) => {
  if (req.user.role !== 'auctioneer' && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied. Auctioneer role required.' });
  }
  next();
};

// Middleware to check if user is bidder
const requireBidder = (req, res, next) => {
  if (req.user.role !== 'bidder' && req.user.role !== 'user' && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied. Bidder role required.' });
  }
  next();
};

// Create auction (auctioneer only)
router.post('/create', verifyToken, requireAuctioneer, async (req, res) => {
  const { car_id, start_time, end_time, starting_bid } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO auctions (car_id, auctioneer_id, start_time, end_time, starting_bid, status)
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [car_id, req.user.id, start_time, end_time, starting_bid]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// List all active auctions
router.get('/active', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, c.make, c.model, c.year FROM auctions a
       JOIN cars c ON a.car_id = c.id
       WHERE a.status = 'active' AND a.end_time > NOW()`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Place bid (bidder only, with payment)
router.post('/bid/:auction_id', verifyToken, requireBidder, async (req, res) => {
  const { bid_amount, payment_reference } = req.body;
  const auction_id = req.params.auction_id;
  try {
    // Check if auction is active
    const auction = await pool.query('SELECT * FROM auctions WHERE id = $1 AND status = \'active\'', [auction_id]);
    if (auction.rows.length === 0) return res.status(400).json({ error: 'Auction not active' });

    // Check bid amount > current bid
    if (bid_amount <= auction.rows[0].current_bid) return res.status(400).json({ error: 'Bid too low' });

    // Insert bid
    await pool.query(
      `INSERT INTO bids (auction_id, bidder_id, bid_amount, payment_reference, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [auction_id, req.user.id, bid_amount, payment_reference]
    );

    // Update auction current_bid
    await pool.query('UPDATE auctions SET current_bid = $1 WHERE id = $2', [bid_amount, auction_id]);

    res.json({ message: 'Bid placed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get bids for an auction
router.get('/:auction_id/bids', verifyToken, async (req, res) => {
  const auction_id = req.params.auction_id;
  try {
    const result = await pool.query(
      `SELECT b.*, u.username FROM bids b
       JOIN users u ON b.bidder_id = u.id
       WHERE b.auction_id = $1 ORDER BY b.timestamp DESC`,
      [auction_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get auctioneer's auctions
router.get('/my', verifyToken, requireAuctioneer, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, c.make, c.model FROM auctions a
       JOIN cars c ON a.car_id = c.id
       WHERE a.auctioneer_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get bidder's bids
router.get('/my-bids', verifyToken, requireBidder, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, a.car_id, c.make, c.model FROM bids b
       JOIN auctions a ON b.auction_id = a.id
       JOIN cars c ON a.car_id = c.id
       WHERE b.bidder_id = $1 ORDER BY b.timestamp DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get auctioneer's auctions
router.get('/my', verifyToken, requireAuctioneer, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, c.make, c.model, c.year FROM auctions a
       JOIN cars c ON a.car_id = c.id
       WHERE a.auctioneer_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get bidder's bids
router.get('/my-bids', verifyToken, requireBidder, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, a.car_id, c.make, c.model FROM bids b
       JOIN auctions a ON b.auction_id = a.id
       JOIN cars c ON a.car_id = c.id
       WHERE b.bidder_id = $1 ORDER BY b.timestamp DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
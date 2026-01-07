const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Public report: basic info only
router.get('/public/:identifier', async (req, res) => {
  const { identifier } = req.params;
  try {
    const result = await pool.query(
      `SELECT vin, plate, make, model, year
       FROM cars
       WHERE UPPER(vin) = UPPER($1) OR UPPER(plate) = UPPER($1)`,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ report: null, message: 'Report not found' });
    }

    res.json({ report: result.rows[0] });
  } catch (err) {
    console.error(`Error fetching public report for ${identifier}:`, err.message);
    res.status(500).json({ error: 'Error fetching public report' });
  }
});

// Private report: role-based access
router.get('/private/:identifier', verifyToken, async (req, res) => {
  const identifier = req.params.identifier.trim().toUpperCase();
  const role = req.user.role;

  try {
    // ✅ Admin query
    const adminQuery = `
      SELECT
        c.id, c.vin, c.plate, c.make, c.model, c.year, c.mileage,
        c.valuation, c.insurance_status, c.owners_count, c.last_checked,
        u.username AS current_owner,
        oh.previous_owner, oh.new_owner, oh.acquired_on, oh.transferred_by,
        (
          SELECT COALESCE(json_agg(jsonb_build_object(
            'date', a.accident_date,
            'description', a.description,
            'severity', a.severity,
            'repaired', a.repaired,
            'damage_classification', a.damage_classification
          )), '[]'::json)
          FROM accidents a WHERE a.car_id = c.id
        ) AS accident_history,
        (
          SELECT COALESCE(json_agg(jsonb_build_object(
            'date', s.service_date,
            'description', s.description,
            'type', s.service_type,
            'center', s.service_center,
            'notes', s.notes
          )), '[]'::json)
          FROM services s WHERE s.car_id = c.id
        ) AS service_records,
        (
          SELECT COALESCE(json_agg(jsonb_build_object(
            'previous_owner', h.previous_owner,
            'new_owner', h.new_owner,
            'acquired_on', h.acquired_on,
            'transferred_by', h.transferred_by
          )), '[]'::json)
          FROM ownership_history h WHERE h.car_id = c.id
        ) AS ownership_history,
        (
          SELECT COALESCE(json_agg(jsonb_build_object(
            'impound_date', i.impound_date,
            'reason', i.reason,
            'released', i.released,
            'release_date', i.release_date
          )), '[]'::json)
          FROM impounds i WHERE i.car_id = c.id
        ) AS impound_history,
        (
          SELECT COALESCE(json_agg(jsonb_build_object(
            'action', ia.action,
            'reason', ia.reason,
            'user_id', ia.user_id,
            'timestamp', ia.timestamp
          )), '[]'::json)
          FROM impound_audit ia WHERE ia.car_id = c.id
        ) AS impound_audit_logs
      FROM cars c
      LEFT JOIN ownerships o ON o.car_id = c.id
      LEFT JOIN users u ON o.owner_name = u.username
      LEFT JOIN (
        SELECT DISTINCT ON (car_id) *
        FROM ownership_history
        ORDER BY car_id, acquired_on DESC
      ) oh ON c.id = oh.car_id
      WHERE UPPER(c.vin) = $1 OR UPPER(c.plate) = $1
      GROUP BY c.id, c.last_checked, u.username,
               oh.previous_owner, oh.new_owner, oh.acquired_on, oh.transferred_by;
    `;

    // ✅ Buyer query
    const buyerQuery = `
      SELECT c.id, c.vin, c.plate, c.make, c.model, c.year, c.mileage, c.last_checked,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'date', a.accident_date,
            'description', a.description,
            'severity', a.severity,
            'repaired', a.repaired
          )) FILTER (WHERE a.id IS NOT NULL), '[]'
        ) AS accident_history,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'date', s.service_date,
            'description', s.description,
            'type', s.service_type,
            'center', s.service_center,
            'notes', s.notes
          )) FILTER (WHERE s.id IS NOT NULL), '[]'
        ) AS service_records,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'impound_date', i.impound_date,
            'reason', i.reason
          )) FILTER (WHERE i.id IS NOT NULL), '[]'
        ) AS impound_history
      FROM cars c
      LEFT JOIN accidents a ON c.id = a.car_id
      LEFT JOIN services s ON c.id = s.car_id
      LEFT JOIN ownerships o ON o.car_id = c.id
      LEFT JOIN impounds i ON c.id = i.car_id
      WHERE UPPER(c.vin) = $1 OR UPPER(c.plate) = $1
      GROUP BY c.id;
    `;

    // ✅ Garage query
    const garageQuery = `
      SELECT c.id, c.vin, c.plate, c.make, c.model, c.year, c.mileage, c.last_checked,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'date', s.service_date,
            'description', s.description,
            'type', s.service_type,
            'center', s.service_center,
            'notes', s.notes
          )) FILTER (WHERE s.id IS NOT NULL), '[]'
        ) AS service_records,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object(
            'impound_date', i.impound_date,
            'released', i.released,
            'release_date', i.release_date
          )) FILTER (WHERE i.id IS NOT NULL), '[]'
        ) AS impound_history
      FROM cars c
      LEFT JOIN services s ON c.id = s.car_id
      LEFT JOIN impounds i ON c.id = i.car_id
      WHERE UPPER(c.vin) = $1 OR UPPER(c.plate) = $1
      GROUP BY c.id;
    `;

    let query;
    if (role === 'admin') {
      query = adminQuery;
    } else if (role === 'buyer') {
      query = buyerQuery;
    } else if (role === 'garage') {
      query = garageQuery;
    } else {
      return res.status(403).json({ error: 'Access denied: unknown role' });
    }

    const { rows } = await pool.query(query, [identifier]);

    if (rows.length === 0) {
      return res.status(404).json({ report: null, message: 'Report not found' });
    }

    let report = rows[0];

    // 🔹 Audit logging
    await pool.query(
      `INSERT INTO report_views (car_id, user_id, role, action)
       VALUES ($1, $2, $3, $4)`,
      [report.id, req.user.id, role, 'view_report']
    );

    // ✅ Trim sensitive fields by role
    if (role === 'buyer') {
      delete report.valuation;
      delete report.insurance_status;
      delete report.owners_count;
    }

    if (role === 'garage') {
      delete report.accident_history;
    }

    res.json({ report });
  } catch (err) {
    console.error('SQL error (full):', err);
    res.status(500).json({ error: 'Error fetching private report' });
  }
});

module.exports = router;
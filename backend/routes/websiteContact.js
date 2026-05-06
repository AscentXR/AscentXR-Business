const express = require('express');
const router = express.Router();
const pool = require('../db/connection').pool;

// POST /api/website/contact — public, no auth
router.post('/contact', async (req, res) => {
  try {
    const { name, email, role, organization, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'name, email, and message are required' });
    }

    const result = await pool.query(
      'INSERT INTO website_contacts (name, email, role, organization, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, role || null, organization || null, message]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/website/contacts — list submissions (for internal use)
router.get('/contacts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM website_contacts ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

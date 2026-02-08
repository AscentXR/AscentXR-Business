const express = require('express');
const router = express.Router();
const taxService = require('../services/taxService');

// GET /api/taxes/events - List tax events
router.get('/events', async (req, res, next) => {
  try {
    const { status, state } = req.query;
    const data = await taxService.getEvents({ status, state });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/taxes/events - Create tax event
router.post('/events', async (req, res, next) => {
  try {
    const data = await taxService.createEvent(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/taxes/events/:id - Update tax event
router.put('/events/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await taxService.updateEvent(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Tax event not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/taxes/deductions - List deductions
router.get('/deductions', async (req, res, next) => {
  try {
    const { tax_year, category } = req.query;
    const data = await taxService.getDeductions({ tax_year, category });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/taxes/deductions - Create deduction
router.post('/deductions', async (req, res, next) => {
  try {
    const data = await taxService.createDeduction(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/taxes/deductions/:id - Update deduction
router.put('/deductions/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await taxService.updateDeduction(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Deduction not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/taxes/summary - Tax summary for a year
router.get('/summary', async (req, res, next) => {
  try {
    const { tax_year } = req.query;
    const data = await taxService.getTaxSummary({ tax_year });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

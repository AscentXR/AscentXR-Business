const express = require('express');
const router = express.Router();
const marketingService = require('../services/marketingService');

// GET /api/marketing/campaigns - List campaigns
router.get('/campaigns', async (req, res, next) => {
  try {
    const { status, channel } = req.query;
    const data = await marketingService.getCampaigns({ status, channel });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/marketing/campaigns - Create campaign
router.post('/campaigns', async (req, res, next) => {
  try {
    const data = await marketingService.createCampaign(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/marketing/campaigns/:id - Update campaign
router.put('/campaigns/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await marketingService.updateCampaign(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/marketing/calendar - List content items
router.get('/calendar', async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const data = await marketingService.getCalendarItems({ start_date, end_date });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/marketing/calendar - Create content item
router.post('/calendar', async (req, res, next) => {
  try {
    const data = await marketingService.createCalendarItem(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/marketing/calendar/:id - Update content item
router.put('/calendar/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await marketingService.updateCalendarItem(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Content item not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/marketing/calendar/:id - Delete content item
router.delete('/calendar/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await marketingService.deleteCalendarItem(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Content item not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

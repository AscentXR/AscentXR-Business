const express = require('express');
const router = express.Router();
const businessActivityService = require('../services/businessActivityService');

// GET /api/business-activities - List activities
router.get('/', async (req, res, next) => {
  try {
    const data = await businessActivityService.getActivities(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/business-activities/overdue - Get overdue activities
router.get('/overdue', async (req, res, next) => {
  try {
    const data = await businessActivityService.getOverdue();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/business-activities/upcoming - Get upcoming activities
router.get('/upcoming', async (req, res, next) => {
  try {
    const data = await businessActivityService.getUpcoming({ days: parseInt(req.query.days) || 30 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/business-activities/:id - Get activity by ID
router.get('/:id', async (req, res, next) => {
  try {
    const data = await businessActivityService.getActivityById(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Activity not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/business-activities - Create activity
router.post('/', async (req, res, next) => {
  try {
    if (!req.body.title || !req.body.business_area) {
      return res.status(400).json({ error: { message: 'title and business_area are required', status: 400 } });
    }
    const data = await businessActivityService.createActivity(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

// PUT /api/business-activities/:id - Update activity
router.put('/:id', async (req, res, next) => {
  try {
    const data = await businessActivityService.updateActivity(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: { message: 'Activity not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// DELETE /api/business-activities/:id - Delete activity
router.delete('/:id', async (req, res, next) => {
  try {
    const data = await businessActivityService.deleteActivity(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Activity not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;

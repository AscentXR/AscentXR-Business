const express = require('express');
const router = express.Router();
const skillCalendarService = require('../services/skillCalendarService');

// ========================
// PLANS
// ========================

// GET /api/skill-calendar/plans - List plans
router.get('/plans', async (req, res, next) => {
  try {
    const data = await skillCalendarService.getPlans(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/skill-calendar/plans/:id - Get plan with stats
router.get('/plans/:id', async (req, res, next) => {
  try {
    const data = await skillCalendarService.getPlanById(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Plan not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/skill-calendar/plans - Create plan
router.post('/plans', async (req, res, next) => {
  try {
    const data = await skillCalendarService.createPlan(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

// PUT /api/skill-calendar/plans/:id - Update plan
router.put('/plans/:id', async (req, res, next) => {
  try {
    const data = await skillCalendarService.updatePlan(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: { message: 'Plan not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// DELETE /api/skill-calendar/plans/:id - Archive plan
router.delete('/plans/:id', async (req, res, next) => {
  try {
    const data = await skillCalendarService.deletePlan(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Plan not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/skill-calendar/plans/generate - Auto-generate from template
router.post('/plans/generate', async (req, res, next) => {
  try {
    const data = await skillCalendarService.generatePlanFromTemplate(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/skill-calendar/plans/:id/stats - Plan progress stats
router.get('/plans/:id/stats', async (req, res, next) => {
  try {
    const data = await skillCalendarService.getPlanStats(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// ========================
// ENTRIES
// ========================

// GET /api/skill-calendar/entries - List entries
router.get('/entries', async (req, res, next) => {
  try {
    const data = await skillCalendarService.getCalendarEntries(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/skill-calendar/entries/upcoming - Next 7 days
router.get('/entries/upcoming', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const data = await skillCalendarService.getUpcomingEntries(days);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/skill-calendar/entries - Create entry
router.post('/entries', async (req, res, next) => {
  try {
    const data = await skillCalendarService.createCalendarEntry(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

// PUT /api/skill-calendar/entries/:id - Update entry
router.put('/entries/:id', async (req, res, next) => {
  try {
    const data = await skillCalendarService.updateCalendarEntry(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: { message: 'Entry not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// DELETE /api/skill-calendar/entries/:id - Delete entry
router.delete('/entries/:id', async (req, res, next) => {
  try {
    const data = await skillCalendarService.deleteCalendarEntry(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Entry not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/skill-calendar/entries/:id/execute - Execute skill
router.post('/entries/:id/execute', async (req, res, next) => {
  try {
    const data = await skillCalendarService.executeCalendarEntry(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/skill-calendar/entries/:id/complete - Mark complete
router.post('/entries/:id/complete', async (req, res, next) => {
  try {
    const data = await skillCalendarService.completeCalendarEntry(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: { message: 'Entry not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/skill-calendar/entries/:id/skip - Skip entry
router.post('/entries/:id/skip', async (req, res, next) => {
  try {
    const data = await skillCalendarService.skipCalendarEntry(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Entry not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;

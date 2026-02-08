const express = require('express');
const router = express.Router();
const customerSuccessService = require('../services/customerSuccessService');

// GET /api/customer-success/health - List health scores
router.get('/health', async (req, res, next) => {
  try {
    const data = await customerSuccessService.getHealthScores();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-success/health/:id - Get health score
router.get('/health/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await customerSuccessService.getHealthScoreById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Health score not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customer-success/health/:id - Update health score
router.put('/health/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await customerSuccessService.updateHealthScore(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Health score not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/customer-success/health/calculate/:districtId - Recalculate health score
router.post('/health/calculate/:districtId', async (req, res, next) => {
  try {
    const { districtId } = req.params;
    const data = await customerSuccessService.calculateHealthForDistrict(districtId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-success/onboarding/:districtId - Get milestones for district
router.get('/onboarding/:districtId', async (req, res, next) => {
  try {
    const { districtId } = req.params;
    const data = await customerSuccessService.getOnboardingMilestones(districtId);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/customer-success/onboarding - Create milestone
router.post('/onboarding', async (req, res, next) => {
  try {
    const data = await customerSuccessService.createOnboardingMilestone(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customer-success/onboarding/:id - Update milestone
router.put('/onboarding/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await customerSuccessService.updateOnboardingMilestone(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Onboarding milestone not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-success/tickets - List tickets
router.get('/tickets', async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    const data = await customerSuccessService.getTickets({ status, priority });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/customer-success/tickets - Create ticket
router.post('/tickets', async (req, res, next) => {
  try {
    const data = await customerSuccessService.createTicket(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/customer-success/tickets/:id - Update ticket
router.put('/tickets/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await customerSuccessService.updateTicket(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/customer-success/renewals - Get upcoming renewals
router.get('/renewals', async (req, res, next) => {
  try {
    const data = await customerSuccessService.getUpcomingRenewals();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

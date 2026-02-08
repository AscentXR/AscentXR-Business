const express = require('express');
const router = express.Router();
const partnershipService = require('../services/partnershipService');

// GET /api/partnerships - List partners
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const data = await partnershipService.getPartners({ status });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/partnerships/deals - List deals
// NOTE: This must be defined before /:id to avoid matching "deals" as an id
router.get('/deals', async (req, res, next) => {
  try {
    const { partner_id, status } = req.query;
    const data = await partnershipService.getDeals({ partner_id, status });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/partnerships/deals - Create deal
router.post('/deals', async (req, res, next) => {
  try {
    const data = await partnershipService.createDeal(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/partnerships/deals/:id - Update deal
router.put('/deals/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await partnershipService.updateDeal(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Deal not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/partnerships/:id - Get partner
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await partnershipService.getPartnerById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/partnerships - Create partner
router.post('/', async (req, res, next) => {
  try {
    const data = await partnershipService.createPartner(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/partnerships/:id - Update partner
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await partnershipService.updatePartner(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Partner not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

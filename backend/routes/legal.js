const express = require('express');
const router = express.Router();
const legalService = require('../services/legalService');

// GET /api/legal/contracts - List contracts
router.get('/contracts', async (req, res, next) => {
  try {
    const { status } = req.query;
    const data = await legalService.getContracts({ status });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/legal/contracts - Create contract
router.post('/contracts', async (req, res, next) => {
  try {
    const data = await legalService.createContract(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/legal/contracts/:id - Update contract
router.put('/contracts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await legalService.updateContract(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/legal/compliance - List compliance items
router.get('/compliance', async (req, res, next) => {
  try {
    const { framework, status } = req.query;
    const data = await legalService.getComplianceItems({ framework, status });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/legal/compliance - Create compliance item
router.post('/compliance', async (req, res, next) => {
  try {
    const data = await legalService.createComplianceItem(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/legal/compliance/:id - Update compliance item
router.put('/compliance/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await legalService.updateComplianceItem(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Compliance item not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

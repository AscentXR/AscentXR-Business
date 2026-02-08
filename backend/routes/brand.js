const express = require('express');
const router = express.Router();
const brandService = require('../services/brandService');

// GET /api/brand - List brand assets
router.get('/', async (req, res, next) => {
  try {
    const { asset_type } = req.query;
    const data = await brandService.getAssets({ asset_type });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/brand - Create brand asset
router.post('/', async (req, res, next) => {
  try {
    const data = await brandService.createAsset(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/brand/:id - Update brand asset
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await brandService.updateAsset(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Brand asset not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/brand/:id - Delete brand asset
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await brandService.deleteAsset(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Brand asset not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

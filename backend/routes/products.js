const express = require('express');
const router = express.Router();
const productService = require('../services/productService');

// GET /api/products - List products
router.get('/', async (req, res, next) => {
  try {
    const { category, brand_entity } = req.query;
    const data = await productService.getProducts({ category, brand_entity });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await productService.getProductById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create product
router.post('/', async (req, res, next) => {
  try {
    const { name, category, pricing_model, base_price } = req.body;

    if (!name || !category || !pricing_model || base_price === undefined) {
      return res.status(400).json({
        success: false,
        error: 'name, category, pricing_model, and base_price are required'
      });
    }

    const data = await productService.createProduct(req.body);

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await productService.updateProduct(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await productService.deleteProduct(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id/features - List features for product
router.get('/:id/features', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await productService.getProductFeatures(id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/products/:id/features - Create feature for product
router.post('/:id/features', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await productService.createProductFeature(id, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

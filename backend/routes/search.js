const express = require('express');
const router = express.Router();
const searchService = require('../services/searchService');

// GET /api/search - Search across all sections
router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const data = await searchService.search(q);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

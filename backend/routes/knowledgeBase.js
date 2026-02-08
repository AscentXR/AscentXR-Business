const express = require('express');
const router = express.Router();
const knowledgeBaseService = require('../services/knowledgeBaseService');

// GET /api/knowledge-base - List articles
router.get('/', async (req, res, next) => {
  try {
    const data = await knowledgeBaseService.getArticles(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/knowledge-base/search - Search articles
router.get('/search', async (req, res, next) => {
  try {
    const data = await knowledgeBaseService.searchArticles(req.query.q || '');
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/knowledge-base/:id - Get article by ID
router.get('/:id', async (req, res, next) => {
  try {
    const data = await knowledgeBaseService.getArticleById(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Article not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/knowledge-base - Create article
router.post('/', async (req, res, next) => {
  try {
    if (!req.body.title || !req.body.content || !req.body.business_area) {
      return res.status(400).json({ error: { message: 'title, content, and business_area are required', status: 400 } });
    }
    const data = await knowledgeBaseService.createArticle(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

// PUT /api/knowledge-base/:id - Update article
router.put('/:id', async (req, res, next) => {
  try {
    const data = await knowledgeBaseService.updateArticle(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: { message: 'Article not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// DELETE /api/knowledge-base/:id - Delete article
router.delete('/:id', async (req, res, next) => {
  try {
    const data = await knowledgeBaseService.deleteArticle(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Article not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;

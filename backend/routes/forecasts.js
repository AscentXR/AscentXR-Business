const express = require('express');
const router = express.Router();
const forecastService = require('../services/forecastService');

// GET /api/forecasts - List forecasts
router.get('/', async (req, res, next) => {
  try {
    const data = await forecastService.getForecasts(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/forecasts/burn-rate - Get computed burn rate
router.get('/burn-rate', async (req, res, next) => {
  try {
    const data = await forecastService.getBurnRate();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/forecasts/runway - Get computed runway
router.get('/runway', async (req, res, next) => {
  try {
    const data = await forecastService.getRunway();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/forecasts/revenue-target - Get revenue target progress
router.get('/revenue-target', async (req, res, next) => {
  try {
    const data = await forecastService.getRevenueTarget();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/forecasts/:id - Get forecast by ID
router.get('/:id', async (req, res, next) => {
  try {
    const data = await forecastService.getForecastById(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Forecast not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/forecasts - Create forecast
router.post('/', async (req, res, next) => {
  try {
    if (!req.body.business_area || !req.body.forecast_type || !req.body.period) {
      return res.status(400).json({ error: { message: 'business_area, forecast_type, and period are required', status: 400 } });
    }
    const data = await forecastService.createForecast(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

// PUT /api/forecasts/:id - Update forecast
router.put('/:id', async (req, res, next) => {
  try {
    const data = await forecastService.updateForecast(req.params.id, req.body);
    if (!data) return res.status(404).json({ error: { message: 'Forecast not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// DELETE /api/forecasts/:id - Delete forecast
router.delete('/:id', async (req, res, next) => {
  try {
    const data = await forecastService.deleteForecast(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Forecast not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const metricsService = require('../services/metricsService');

// GET /api/metrics/financial - Financial KPIs
router.get('/financial', async (req, res, next) => {
  try {
    const metrics = await metricsService.getFinancialMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/metrics/sales - Sales pipeline metrics
router.get('/sales', async (req, res, next) => {
  try {
    const metrics = await metricsService.getSalesMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/metrics/engagement - Engagement and activity metrics
router.get('/engagement', async (req, res, next) => {
  try {
    const metrics = await metricsService.getEngagementMetrics();
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/metrics/forecast - Revenue forecast
router.get('/forecast', async (req, res, next) => {
  try {
    const forecast = await metricsService.getRevenueForecast();
    res.json({
      success: true,
      data: forecast,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/metrics/all - All metrics combined
router.get('/all', async (req, res, next) => {
  try {
    const [financial, sales, engagement, forecast] = await Promise.all([
      metricsService.getFinancialMetrics(),
      metricsService.getSalesMetrics(),
      metricsService.getEngagementMetrics(),
      metricsService.getRevenueForecast()
    ]);

    res.json({
      success: true,
      data: { financial, sales, engagement, forecast },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

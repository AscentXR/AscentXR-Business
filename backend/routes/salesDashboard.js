const express = require('express');
const router = express.Router();
const service = require('../services/salesDashboardService');

function dateParams(req) {
  const { start_date, end_date } = req.query;
  return start_date && end_date ? { start_date, end_date } : {};
}

function arrayToCSV(headers, rows) {
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

// GET /api/sales-dashboard/overview
router.get('/overview', async (req, res, next) => {
  try {
    const data = await service.getOverviewKPIs(dateParams(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/sales-dashboard/pipeline
router.get('/pipeline', async (req, res, next) => {
  try {
    const data = await service.getPipelineAnalytics(dateParams(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/sales-dashboard/districts
router.get('/districts', async (req, res, next) => {
  try {
    const data = await service.getDistrictPerformance();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/sales-dashboard/activity
router.get('/activity', async (req, res, next) => {
  try {
    const data = await service.getActivityAnalytics(dateParams(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/sales-dashboard/forecast
router.get('/forecast', async (req, res, next) => {
  try {
    const data = await service.getForecastData();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/sales-dashboard/export/:section
router.get('/export/:section', async (req, res, next) => {
  try {
    const { section } = req.params;
    const params = dateParams(req);
    let csv = '';
    let filename = `sales-${section}`;

    switch (section) {
      case 'overview': {
        const data = await service.getOverviewKPIs(params);
        const headers = Object.keys(data);
        csv = arrayToCSV(headers, [data]);
        break;
      }
      case 'pipeline': {
        const data = await service.getPipelineAnalytics(params);
        const headers = ['stage', 'deal_count', 'total_value', 'avg_value', 'avg_probability', 'weighted_value'];
        csv = arrayToCSV(headers, data.stages);
        break;
      }
      case 'districts': {
        const data = await service.getDistrictPerformance();
        const headers = ['name', 'state', 'total_students', 'budget_range', 'tech_readiness_score', 'opportunity_value', 'probability', 'stage', 'relationship_status', 'teacher_adoption_rate'];
        csv = arrayToCSV(headers, data.topDistricts);
        break;
      }
      case 'activity': {
        const data = await service.getActivityAnalytics(params);
        const headers = ['week', 'type', 'count'];
        csv = arrayToCSV(headers, data.weeklyActivity);
        break;
      }
      case 'forecast': {
        const data = await service.getForecastData();
        const headers = ['month', 'projected', 'optimistic', 'conservative'];
        csv = arrayToCSV(headers, data.forecast);
        break;
      }
      default:
        return res.status(400).json({ success: false, error: 'Invalid export section' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

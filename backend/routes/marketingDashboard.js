const express = require('express');
const router = express.Router();
const service = require('../services/marketingDashboardService');

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

// GET /api/marketing-dashboard/overview
router.get('/overview', async (req, res, next) => {
  try {
    const data = await service.getOverviewKPIs(dateParams(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/marketing-dashboard/campaigns
router.get('/campaigns', async (req, res, next) => {
  try {
    const data = await service.getCampaignAnalytics(dateParams(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/marketing-dashboard/content
router.get('/content', async (req, res, next) => {
  try {
    const data = await service.getContentPerformance(dateParams(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/marketing-dashboard/linkedin
router.get('/linkedin', async (req, res, next) => {
  try {
    const data = await service.getLinkedInAnalytics(dateParams(req));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/marketing-dashboard/forecast
router.get('/forecast', async (req, res, next) => {
  try {
    const data = await service.getForecastData();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/marketing-dashboard/export/:section
router.get('/export/:section', async (req, res, next) => {
  try {
    const { section } = req.params;
    const params = dateParams(req);
    let csv = '';
    let filename = `marketing-${section}`;

    switch (section) {
      case 'overview': {
        const data = await service.getOverviewKPIs(params);
        const headers = Object.keys(data).filter(k => k !== 'contentPipeline');
        csv = arrayToCSV(headers, [data]);
        break;
      }
      case 'campaigns': {
        const data = await service.getCampaignAnalytics(params);
        const headers = ['id', 'name', 'channel', 'status', 'budget', 'spent', 'leads_generated', 'conversions', 'impressions', 'clicks', 'ctr', 'cost_per_lead', 'roas'];
        csv = arrayToCSV(headers, data.campaigns);
        break;
      }
      case 'content': {
        const data = await service.getContentPerformance(params);
        const headers = ['content_type', 'status', 'count'];
        csv = arrayToCSV(headers, data.byTypeStatus);
        break;
      }
      case 'linkedin': {
        const data = await service.getLinkedInAnalytics(params);
        const headers = ['week', 'impressions', 'engagements', 'clicks', 'shares', 'engagement_rate'];
        csv = arrayToCSV(headers, data.weeklyTrend);
        break;
      }
      case 'forecast': {
        const data = await service.getForecastData();
        const headers = ['month', 'budget', 'spent'];
        csv = arrayToCSV(headers, data.budgetTrend);
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

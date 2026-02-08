const { query } = require('../db/connection');

class MetricsService {
  // Financial metrics
  async getFinancialMetrics() {
    const [pipelineData, activeContracts] = await Promise.all([
      query(`SELECT
        SUM(opportunity_value) as total_pipeline,
        SUM(opportunity_value * probability / 100) as weighted_pipeline,
        COUNT(*) as deal_count
       FROM pipeline`),
      query(`SELECT
        SUM(p.opportunity_value) as active_revenue,
        COUNT(*) as active_count
       FROM pipeline p
       JOIN relationships r ON p.school_district_id = r.school_district_id
       WHERE r.status = 'active'`)
    ]);

    const pipeline = pipelineData.rows[0];
    const active = activeContracts.rows[0];

    const mrr = parseFloat(active.active_revenue || 0) / 12;
    const arr = mrr * 12;

    // CAC: estimated based on marketing spend / new customers
    const marketingSpendMonthly = 5000; // configurable
    const newCustomersPerMonth = 1.5;
    const cac = marketingSpendMonthly / newCustomersPerMonth;

    // LTV: average contract value * expected lifetime (3 years)
    const avgContractValue = parseFloat(pipeline.total_pipeline || 0) / Math.max(parseInt(pipeline.deal_count || 1), 1);
    const expectedLifetimeYears = 3;
    const ltv = avgContractValue * expectedLifetimeYears;

    // Churn: based on relationships
    const churnData = await query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'churned') as churned,
        COUNT(*) as total
       FROM relationships`
    );
    const churn = churnData.rows[0];
    const churnRate = parseInt(churn.total) > 0
      ? (parseInt(churn.churned) / parseInt(churn.total) * 100)
      : 0;

    return {
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      cac: Math.round(cac * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
      ltvCacRatio: cac > 0 ? Math.round(ltv / cac * 10) / 10 : 0,
      churnRate: Math.round(churnRate * 10) / 10,
      totalPipelineValue: parseFloat(pipeline.total_pipeline || 0),
      weightedPipeline: parseFloat(pipeline.weighted_pipeline || 0),
      activeRevenue: parseFloat(active.active_revenue || 0),
      dealCount: parseInt(pipeline.deal_count || 0)
    };
  }

  // Sales metrics
  async getSalesMetrics() {
    const [stages, conversions, topDeals] = await Promise.all([
      query(`SELECT
        stage,
        COUNT(*) as count,
        SUM(opportunity_value) as total_value,
        AVG(probability) as avg_probability
       FROM pipeline
       GROUP BY stage
       ORDER BY AVG(probability)`),
      query(`SELECT
        COUNT(*) FILTER (WHERE stage = 'contract_review') as closing,
        COUNT(*) FILTER (WHERE stage = 'discovery') as discovery,
        COUNT(*) as total
       FROM pipeline`),
      query(`SELECT p.*, sd.name as school_district_name
       FROM pipeline p
       LEFT JOIN school_districts sd ON p.school_district_id = sd.id
       ORDER BY p.opportunity_value DESC LIMIT 5`)
    ]);

    const conv = conversions.rows[0];
    const total = parseInt(conv.total) || 1;
    const winRate = (parseInt(conv.closing) / total * 100);

    // Pipeline coverage: weighted pipeline / target revenue
    const targetRevenue = 500000; // quarterly target
    const weightedTotal = stages.rows.reduce((sum, s) =>
      sum + (parseFloat(s.total_value) * parseFloat(s.avg_probability) / 100), 0);
    const pipelineCoverage = (weightedTotal / targetRevenue * 100);

    // Velocity: average days in pipeline (estimated)
    const avgCycleLength = 45; // days

    return {
      stages: stages.rows,
      winRate: Math.round(winRate * 10) / 10,
      pipelineCoverage: Math.round(pipelineCoverage * 10) / 10,
      avgCycleLength,
      topDeals: topDeals.rows,
      totalDeals: parseInt(conv.total),
      closingDeals: parseInt(conv.closing),
      discoveryDeals: parseInt(conv.discovery)
    };
  }

  // Engagement metrics
  async getEngagementMetrics() {
    const [linkedin, communications, agentMetrics, relationships] = await Promise.all([
      query(`SELECT
        SUM(impressions) as total_impressions,
        SUM(engagements) as total_engagements,
        SUM(clicks) as total_clicks,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
        CASE WHEN SUM(impressions) > 0
          THEN ROUND(SUM(engagements)::numeric / SUM(impressions) * 100, 2)
          ELSE 0 END as engagement_rate
       FROM linkedin_posts`),
      query(`SELECT
        COUNT(*) as total_communications,
        COUNT(*) FILTER (WHERE type = 'email') as emails,
        COUNT(*) FILTER (WHERE type = 'call') as calls,
        COUNT(*) FILTER (WHERE type = 'meeting') as meetings,
        COUNT(*) FILTER (WHERE type = 'linkedin') as linkedin_messages,
        COUNT(*) FILTER (WHERE follow_up_date IS NOT NULL AND follow_up_date <= CURRENT_DATE) as overdue_followups
       FROM communications`),
      query(`SELECT
        COUNT(*) as total_agents,
        COUNT(*) FILTER (WHERE status = 'active') as active_agents,
        AVG(progress) as avg_progress,
        SUM(tasks_completed) as tasks_done
       FROM agents`),
      query(`SELECT
        COUNT(*) FILTER (WHERE status = 'active') as active_schools,
        COUNT(*) FILTER (WHERE status = 'pilot') as pilot_schools,
        AVG(teacher_adoption_rate) FILTER (WHERE teacher_adoption_rate > 0) as avg_adoption,
        AVG(avg_session_duration) FILTER (WHERE avg_session_duration > 0) as avg_session_mins
       FROM relationships`)
    ]);

    // NPS calculation (simulated based on adoption rate)
    const avgAdoption = parseFloat(relationships.rows[0].avg_adoption || 0);
    const nps = Math.round(avgAdoption * 1.2 - 10); // Simplified NPS calculation

    return {
      linkedin: linkedin.rows[0],
      communications: communications.rows[0],
      agents: agentMetrics.rows[0],
      schools: relationships.rows[0],
      nps: Math.min(Math.max(nps, -100), 100),
      npsCategory: nps >= 50 ? 'Excellent' : nps >= 0 ? 'Good' : 'Needs Improvement'
    };
  }

  // Revenue forecast (12-month projection)
  async getRevenueForecast() {
    const pipeline = await query(
      `SELECT p.*, sd.name as school_name
       FROM pipeline p
       LEFT JOIN school_districts sd ON p.school_district_id = sd.id`
    );

    const today = new Date();
    const forecast = [];

    for (let i = 0; i < 12; i++) {
      const month = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthStr = month.toISOString().substring(0, 7);

      // Base revenue from active contracts
      let projected = 7500; // base MRR

      // Add pipeline opportunities that might close this month
      pipeline.rows.forEach(deal => {
        const probability = deal.probability / 100;
        const monthlyValue = parseFloat(deal.opportunity_value) / 12;
        // Probability decays over time
        const monthsOut = i;
        const adjustedProb = probability * Math.pow(0.9, monthsOut);
        projected += monthlyValue * adjustedProb;
      });

      forecast.push({
        month: monthStr,
        projected: Math.round(projected),
        optimistic: Math.round(projected * 1.3),
        conservative: Math.round(projected * 0.7)
      });
    }

    return forecast;
  }
}

module.exports = new MetricsService();

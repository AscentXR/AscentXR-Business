const { query } = require('../db/connection');
const metricsService = require('./metricsService');

class SalesDashboardService {
  async getOverviewKPIs({ start_date, end_date } = {}) {
    const hasRange = start_date && end_date;

    const [pipeline, winRate, districts, communications, skills] = await Promise.all([
      query(`SELECT
        COALESCE(SUM(opportunity_value), 0) as total_pipeline,
        COALESCE(SUM(opportunity_value * probability / 100), 0) as weighted_pipeline,
        COUNT(*) as total_deals,
        COALESCE(AVG(opportunity_value), 0) as avg_deal_size
       FROM pipeline`),

      query(`SELECT
        COUNT(*) FILTER (WHERE stage = 'contract_review') as wins,
        COUNT(*) as total
       FROM pipeline`),

      query(`SELECT
        COUNT(*) as active_districts,
        COALESCE(AVG(teacher_adoption_rate), 0) as avg_adoption
       FROM relationships
       WHERE status = 'active'`),

      hasRange
        ? query(`SELECT
            COUNT(*) FILTER (WHERE created_at >= $1 AND created_at < $2::date + 1) as current_count,
            COUNT(*) FILTER (WHERE created_at >= $1::date - ($2::date - $1::date) AND created_at < $1) as prev_count
           FROM communications`, [start_date, end_date])
        : query(`SELECT
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - 30) as current_count,
            COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - 60 AND created_at < CURRENT_DATE - 30) as prev_count
           FROM communications`),

      hasRange
        ? query(`SELECT
            COUNT(*) FILTER (WHERE sce.status = 'completed') as completed,
            COUNT(*) as total
           FROM skill_calendar_entries sce
           JOIN execution_plans ep ON sce.plan_id = ep.id
           WHERE ep.business_area = 'sales'
             AND sce.scheduled_date >= $1 AND sce.scheduled_date <= $2`, [start_date, end_date])
        : query(`SELECT
            COUNT(*) FILTER (WHERE sce.status = 'completed') as completed,
            COUNT(*) as total
           FROM skill_calendar_entries sce
           JOIN execution_plans ep ON sce.plan_id = ep.id
           WHERE ep.business_area = 'sales'
             AND date_trunc('month', sce.scheduled_date) = date_trunc('month', CURRENT_DATE)`),
    ]);

    const p = pipeline.rows[0];
    const w = winRate.rows[0];
    const d = districts.rows[0];
    const c = communications.rows[0];
    const s = skills.rows[0];

    const currentComms = parseInt(c.current_count) || 0;
    const prevComms = parseInt(c.prev_count) || 0;
    const commsTrend = prevComms > 0
      ? ((currentComms - prevComms) / prevComms * 100)
      : 0;

    return {
      totalPipeline: parseFloat(p.total_pipeline),
      weightedPipeline: parseFloat(p.weighted_pipeline),
      totalDeals: parseInt(p.total_deals),
      avgDealSize: parseFloat(p.avg_deal_size),
      winRate: parseInt(w.total) > 0 ? (parseInt(w.wins) / parseInt(w.total) * 100) : 0,
      activeDistricts: parseInt(d.active_districts),
      avgAdoption: parseFloat(d.avg_adoption),
      communicationsLast30: currentComms,
      communicationsTrend: Math.round(commsTrend * 10) / 10,
      completedSkills: parseInt(s.completed),
      totalSkills: parseInt(s.total),
    };
  }

  async getPipelineAnalytics({ start_date, end_date } = {}) {
    const hasRange = start_date && end_date;

    const [stages, trend, topDeals] = await Promise.all([
      query(`SELECT
        stage,
        COUNT(*) as deal_count,
        COALESCE(SUM(opportunity_value), 0) as total_value,
        COALESCE(AVG(opportunity_value), 0) as avg_value,
        COALESCE(AVG(probability), 0) as avg_probability,
        COALESCE(SUM(opportunity_value * probability / 100), 0) as weighted_value
       FROM pipeline
       GROUP BY stage
       ORDER BY AVG(probability)`),

      hasRange
        ? query(`SELECT
            to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
            COUNT(*) as new_deals,
            COALESCE(SUM(opportunity_value), 0) as new_value
           FROM pipeline
           WHERE created_at >= $1 AND created_at <= $2
           GROUP BY date_trunc('month', created_at)
           ORDER BY date_trunc('month', created_at)`, [start_date, end_date])
        : query(`SELECT
            to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
            COUNT(*) as new_deals,
            COALESCE(SUM(opportunity_value), 0) as new_value
           FROM pipeline
           GROUP BY date_trunc('month', created_at)
           ORDER BY date_trunc('month', created_at)`),

      query(`SELECT p.id, sd.name as district, p.stage, p.opportunity_value as value,
        p.probability, p.opportunity_value * p.probability / 100 as weighted,
        p.next_action_date
       FROM pipeline p
       LEFT JOIN school_districts sd ON p.school_district_id = sd.id
       ORDER BY p.opportunity_value DESC
       LIMIT 10`),
    ]);

    return {
      stages: stages.rows,
      trend: trend.rows,
      topDeals: topDeals.rows,
    };
  }

  async getDistrictPerformance() {
    const [byState, byBudget, topDistricts] = await Promise.all([
      query(`SELECT sd.state,
        COUNT(DISTINCT sd.id) as district_count,
        COALESCE(SUM(p.opportunity_value), 0) as total_value,
        COALESCE(AVG(sd.tech_readiness_score), 0) as avg_tech_score
       FROM school_districts sd
       LEFT JOIN pipeline p ON p.school_district_id = sd.id
       GROUP BY sd.state
       ORDER BY total_value DESC`),

      query(`SELECT sd.budget_range,
        COUNT(DISTINCT sd.id) as district_count,
        COALESCE(SUM(p.opportunity_value), 0) as total_value
       FROM school_districts sd
       LEFT JOIN pipeline p ON p.school_district_id = sd.id
       GROUP BY sd.budget_range
       ORDER BY total_value DESC`),

      query(`SELECT sd.name, sd.state, sd.total_students, sd.budget_range,
        sd.tech_readiness_score,
        COALESCE(p.opportunity_value, 0) as opportunity_value,
        COALESCE(p.probability, 0) as probability,
        p.stage,
        r.status as relationship_status,
        COALESCE(r.teacher_adoption_rate, 0) as teacher_adoption_rate
       FROM school_districts sd
       LEFT JOIN pipeline p ON p.school_district_id = sd.id
       LEFT JOIN relationships r ON r.school_district_id = sd.id
       ORDER BY COALESCE(p.opportunity_value, 0) DESC
       LIMIT 15`),
    ]);

    return {
      byState: byState.rows,
      byBudget: byBudget.rows,
      topDistricts: topDistricts.rows,
    };
  }

  async getActivityAnalytics({ start_date, end_date } = {}) {
    const hasRange = start_date && end_date;

    const [weeklyActivity, followUps, directionBreakdown] = await Promise.all([
      hasRange
        ? query(`SELECT
            to_char(date_trunc('week', created_at), 'YYYY-MM-DD') as week,
            type,
            COUNT(*) as count
           FROM communications
           WHERE created_at >= $1 AND created_at <= $2
           GROUP BY date_trunc('week', created_at), type
           ORDER BY date_trunc('week', created_at)`, [start_date, end_date])
        : query(`SELECT
            to_char(date_trunc('week', created_at), 'YYYY-MM-DD') as week,
            type,
            COUNT(*) as count
           FROM communications
           WHERE created_at >= CURRENT_DATE - 84
           GROUP BY date_trunc('week', created_at), type
           ORDER BY date_trunc('week', created_at)`),

      query(`SELECT
        COUNT(*) FILTER (WHERE follow_up_date IS NOT NULL AND follow_up_date < CURRENT_DATE) as overdue,
        COUNT(*) FILTER (WHERE follow_up_date IS NOT NULL AND follow_up_date >= CURRENT_DATE AND follow_up_date <= CURRENT_DATE + 7) as upcoming
       FROM communications`),

      query(`SELECT
        direction,
        COUNT(*) as count
       FROM communications
       GROUP BY direction`),
    ]);

    return {
      weeklyActivity: weeklyActivity.rows,
      followUps: followUps.rows[0],
      directionBreakdown: directionBreakdown.rows,
    };
  }

  async getForecastData() {
    const [forecast, topWeighted] = await Promise.all([
      metricsService.getRevenueForecast(),
      query(`SELECT p.id, sd.name as district, p.stage,
        p.opportunity_value as value, p.probability,
        p.opportunity_value * p.probability / 100 as weighted
       FROM pipeline p
       LEFT JOIN school_districts sd ON p.school_district_id = sd.id
       ORDER BY p.opportunity_value * p.probability / 100 DESC
       LIMIT 20`),
    ]);

    return {
      forecast,
      topWeightedDeals: topWeighted.rows,
    };
  }
}

module.exports = new SalesDashboardService();

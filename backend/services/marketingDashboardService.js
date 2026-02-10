const { query } = require('../db/connection');

class MarketingDashboardService {
  async getOverviewKPIs({ start_date, end_date } = {}) {
    const hasRange = start_date && end_date;

    const [campaigns, linkedin, content, skills] = await Promise.all([
      hasRange
        ? query(`SELECT
            COUNT(*) as total_campaigns,
            COUNT(*) FILTER (WHERE status = 'active') as active_campaigns,
            COALESCE(SUM(budget), 0) as total_budget,
            COALESCE(SUM(spent), 0) as total_spent,
            COALESCE(SUM(leads_generated), 0) as total_leads,
            COALESCE(SUM(conversions), 0) as total_conversions,
            COALESCE(SUM(impressions), 0) as total_impressions,
            COALESCE(SUM(clicks), 0) as total_clicks
           FROM campaigns
           WHERE start_date >= $1 AND start_date <= $2`, [start_date, end_date])
        : query(`SELECT
            COUNT(*) as total_campaigns,
            COUNT(*) FILTER (WHERE status = 'active') as active_campaigns,
            COALESCE(SUM(budget), 0) as total_budget,
            COALESCE(SUM(spent), 0) as total_spent,
            COALESCE(SUM(leads_generated), 0) as total_leads,
            COALESCE(SUM(conversions), 0) as total_conversions,
            COALESCE(SUM(impressions), 0) as total_impressions,
            COALESCE(SUM(clicks), 0) as total_clicks
           FROM campaigns`),

      hasRange
        ? query(`SELECT
            COALESCE(SUM(impressions), 0) as total_impressions,
            COALESCE(SUM(engagements), 0) as total_engagements,
            COALESCE(SUM(clicks), 0) as total_clicks,
            COALESCE(SUM(shares), 0) as total_shares,
            COUNT(*) FILTER (WHERE status = 'published') as published_posts,
            CASE WHEN SUM(impressions) > 0
              THEN ROUND(SUM(engagements)::numeric / SUM(impressions) * 100, 2)
              ELSE 0 END as engagement_rate
           FROM linkedin_posts
           WHERE published_time >= $1 AND published_time <= $2`, [start_date, end_date])
        : query(`SELECT
            COALESCE(SUM(impressions), 0) as total_impressions,
            COALESCE(SUM(engagements), 0) as total_engagements,
            COALESCE(SUM(clicks), 0) as total_clicks,
            COALESCE(SUM(shares), 0) as total_shares,
            COUNT(*) FILTER (WHERE status = 'published') as published_posts,
            CASE WHEN SUM(impressions) > 0
              THEN ROUND(SUM(engagements)::numeric / SUM(impressions) * 100, 2)
              ELSE 0 END as engagement_rate
           FROM linkedin_posts`),

      hasRange
        ? query(`SELECT
            status,
            COUNT(*) as count
           FROM content_calendar
           WHERE scheduled_date >= $1 AND scheduled_date <= $2
           GROUP BY status`, [start_date, end_date])
        : query(`SELECT
            status,
            COUNT(*) as count
           FROM content_calendar
           GROUP BY status`),

      hasRange
        ? query(`SELECT
            COUNT(*) FILTER (WHERE sce.status = 'completed') as completed,
            COUNT(*) as total
           FROM skill_calendar_entries sce
           JOIN execution_plans ep ON sce.plan_id = ep.id
           WHERE ep.business_area = 'marketing'
             AND sce.scheduled_date >= $1 AND sce.scheduled_date <= $2`, [start_date, end_date])
        : query(`SELECT
            COUNT(*) FILTER (WHERE sce.status = 'completed') as completed,
            COUNT(*) as total
           FROM skill_calendar_entries sce
           JOIN execution_plans ep ON sce.plan_id = ep.id
           WHERE ep.business_area = 'marketing'
             AND date_trunc('month', sce.scheduled_date) = date_trunc('month', CURRENT_DATE)`),
    ]);

    const c = campaigns.rows[0];
    const l = linkedin.rows[0];
    const s = skills.rows[0];

    const totalImpressions = parseInt(c.total_impressions) || 0;
    const totalClicks = parseInt(c.total_clicks) || 0;
    const totalLeads = parseInt(c.total_leads) || 0;
    const totalSpent = parseFloat(c.total_spent) || 0;

    const contentPipeline = {};
    content.rows.forEach(r => { contentPipeline[r.status] = parseInt(r.count); });

    return {
      totalCampaigns: parseInt(c.total_campaigns),
      activeCampaigns: parseInt(c.active_campaigns),
      totalBudget: parseFloat(c.total_budget),
      totalSpent,
      totalLeads,
      totalConversions: parseInt(c.total_conversions),
      ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0,
      costPerLead: totalLeads > 0 ? (totalSpent / totalLeads) : 0,
      linkedinImpressions: parseInt(l.total_impressions),
      linkedinEngagementRate: parseFloat(l.engagement_rate),
      publishedPosts: parseInt(l.published_posts),
      contentPipeline,
      completedSkills: parseInt(s.completed),
      totalSkills: parseInt(s.total),
    };
  }

  async getCampaignAnalytics({ start_date, end_date } = {}) {
    const hasRange = start_date && end_date;

    const [allCampaigns, byChannel] = await Promise.all([
      hasRange
        ? query(`SELECT id, name, channel, status, budget, spent,
            leads_generated, conversions, impressions, clicks,
            CASE WHEN impressions > 0 THEN ROUND(clicks::numeric / impressions * 100, 2) ELSE 0 END as ctr,
            CASE WHEN leads_generated > 0 THEN ROUND(spent::numeric / leads_generated, 2) ELSE 0 END as cost_per_lead,
            CASE WHEN spent > 0 THEN ROUND((conversions * 100.0) / spent, 2) ELSE 0 END as roas
           FROM campaigns
           WHERE start_date >= $1 AND start_date <= $2
           ORDER BY spent DESC`, [start_date, end_date])
        : query(`SELECT id, name, channel, status, budget, spent,
            leads_generated, conversions, impressions, clicks,
            CASE WHEN impressions > 0 THEN ROUND(clicks::numeric / impressions * 100, 2) ELSE 0 END as ctr,
            CASE WHEN leads_generated > 0 THEN ROUND(spent::numeric / leads_generated, 2) ELSE 0 END as cost_per_lead,
            CASE WHEN spent > 0 THEN ROUND((conversions * 100.0) / spent, 2) ELSE 0 END as roas
           FROM campaigns
           ORDER BY spent DESC`),

      hasRange
        ? query(`SELECT channel,
            COALESCE(SUM(budget), 0) as budget,
            COALESCE(SUM(spent), 0) as spent,
            COALESCE(SUM(leads_generated), 0) as leads,
            COALESCE(SUM(conversions), 0) as conversions
           FROM campaigns
           WHERE start_date >= $1 AND start_date <= $2
           GROUP BY channel
           ORDER BY SUM(spent) DESC`, [start_date, end_date])
        : query(`SELECT channel,
            COALESCE(SUM(budget), 0) as budget,
            COALESCE(SUM(spent), 0) as spent,
            COALESCE(SUM(leads_generated), 0) as leads,
            COALESCE(SUM(conversions), 0) as conversions
           FROM campaigns
           GROUP BY channel
           ORDER BY SUM(spent) DESC`),
    ]);

    return {
      campaigns: allCampaigns.rows,
      byChannel: byChannel.rows,
    };
  }

  async getContentPerformance({ start_date, end_date } = {}) {
    const hasRange = start_date && end_date;

    const [byTypeStatus, cadence, byPillar] = await Promise.all([
      hasRange
        ? query(`SELECT content_type, status, COUNT(*) as count
           FROM content_calendar
           WHERE scheduled_date >= $1 AND scheduled_date <= $2
           GROUP BY content_type, status
           ORDER BY content_type, status`, [start_date, end_date])
        : query(`SELECT content_type, status, COUNT(*) as count
           FROM content_calendar
           GROUP BY content_type, status
           ORDER BY content_type, status`),

      hasRange
        ? query(`SELECT
            to_char(date_trunc('week', scheduled_date), 'YYYY-MM-DD') as week,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'published') as published
           FROM content_calendar
           WHERE scheduled_date >= $1 AND scheduled_date <= $2
           GROUP BY date_trunc('week', scheduled_date)
           ORDER BY date_trunc('week', scheduled_date)`, [start_date, end_date])
        : query(`SELECT
            to_char(date_trunc('week', scheduled_date), 'YYYY-MM-DD') as week,
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status = 'published') as published
           FROM content_calendar
           WHERE scheduled_date >= CURRENT_DATE - 84
           GROUP BY date_trunc('week', scheduled_date)
           ORDER BY date_trunc('week', scheduled_date)`),

      hasRange
        ? query(`SELECT COALESCE(content_pillar, 'Unassigned') as pillar, COUNT(*) as count
           FROM content_calendar
           WHERE scheduled_date >= $1 AND scheduled_date <= $2
           GROUP BY content_pillar
           ORDER BY count DESC`, [start_date, end_date])
        : query(`SELECT COALESCE(content_pillar, 'Unassigned') as pillar, COUNT(*) as count
           FROM content_calendar
           GROUP BY content_pillar
           ORDER BY count DESC`),
    ]);

    return {
      byTypeStatus: byTypeStatus.rows,
      cadence: cadence.rows,
      byPillar: byPillar.rows,
    };
  }

  async getLinkedInAnalytics({ start_date, end_date } = {}) {
    const hasRange = start_date && end_date;

    const [weeklyTrend, topPosts] = await Promise.all([
      hasRange
        ? query(`SELECT
            to_char(date_trunc('week', published_time), 'YYYY-MM-DD') as week,
            COALESCE(SUM(impressions), 0) as impressions,
            COALESCE(SUM(engagements), 0) as engagements,
            COALESCE(SUM(clicks), 0) as clicks,
            COALESCE(SUM(shares), 0) as shares,
            CASE WHEN SUM(impressions) > 0
              THEN ROUND(SUM(engagements)::numeric / SUM(impressions) * 100, 2)
              ELSE 0 END as engagement_rate
           FROM linkedin_posts
           WHERE published_time >= $1 AND published_time <= $2
           GROUP BY date_trunc('week', published_time)
           ORDER BY date_trunc('week', published_time)`, [start_date, end_date])
        : query(`SELECT
            to_char(date_trunc('week', published_time), 'YYYY-MM-DD') as week,
            COALESCE(SUM(impressions), 0) as impressions,
            COALESCE(SUM(engagements), 0) as engagements,
            COALESCE(SUM(clicks), 0) as clicks,
            COALESCE(SUM(shares), 0) as shares,
            CASE WHEN SUM(impressions) > 0
              THEN ROUND(SUM(engagements)::numeric / SUM(impressions) * 100, 2)
              ELSE 0 END as engagement_rate
           FROM linkedin_posts
           WHERE published_time >= CURRENT_DATE - 84
           GROUP BY date_trunc('week', published_time)
           ORDER BY date_trunc('week', published_time)`),

      hasRange
        ? query(`SELECT id, LEFT(text, 100) as excerpt, published_time,
            impressions, engagements, clicks, shares,
            CASE WHEN impressions > 0
              THEN ROUND(engagements::numeric / impressions * 100, 2)
              ELSE 0 END as engagement_rate
           FROM linkedin_posts
           WHERE published_time >= $1 AND published_time <= $2
           ORDER BY engagements DESC
           LIMIT 10`, [start_date, end_date])
        : query(`SELECT id, LEFT(text, 100) as excerpt, published_time,
            impressions, engagements, clicks, shares,
            CASE WHEN impressions > 0
              THEN ROUND(engagements::numeric / impressions * 100, 2)
              ELSE 0 END as engagement_rate
           FROM linkedin_posts
           ORDER BY engagements DESC
           LIMIT 10`),
    ]);

    return {
      weeklyTrend: weeklyTrend.rows,
      topPosts: topPosts.rows,
    };
  }

  async getForecastData() {
    const [forecasts, budgetTrend] = await Promise.all([
      query(`SELECT * FROM forecasts
        WHERE business_area = 'marketing'
        ORDER BY period, scenario`),
      query(`SELECT
        to_char(date_trunc('month', start_date), 'YYYY-MM') as month,
        COALESCE(SUM(budget), 0) as budget,
        COALESCE(SUM(spent), 0) as spent
       FROM campaigns
       WHERE start_date IS NOT NULL
       GROUP BY date_trunc('month', start_date)
       ORDER BY date_trunc('month', start_date)`),
    ]);

    return {
      forecasts: forecasts.rows,
      budgetTrend: budgetTrend.rows,
    };
  }
}

module.exports = new MarketingDashboardService();

const { query } = require('../db/connection');

class MarketingService {
  // ========================
  // CAMPAIGNS
  // ========================

  async getCampaigns({ page = 1, limit = 50, search = '', status = '', channel = '' } = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM campaigns';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    if (channel) {
      conditions.push(`channel = $${paramIndex}`);
      params.push(channel);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY start_date DESC NULLS LAST, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Count
    let countSql = 'SELECT COUNT(*) FROM campaigns';
    const countParams = [];
    const countConditions = [];
    let cIdx = 1;
    if (search) {
      countConditions.push(`(name ILIKE $${cIdx} OR description ILIKE $${cIdx})`);
      countParams.push(`%${search}%`);
      cIdx++;
    }
    if (status) {
      countConditions.push(`status = $${cIdx}`);
      countParams.push(status);
      cIdx++;
    }
    if (channel) {
      countConditions.push(`channel = $${cIdx}`);
      countParams.push(channel);
      cIdx++;
    }
    if (countConditions.length > 0) {
      countSql += ` WHERE ${countConditions.join(' AND ')}`;
    }
    const countResult = await query(countSql, countParams);

    return {
      campaigns: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getCampaignById(id) {
    const [campaign, content] = await Promise.all([
      query('SELECT * FROM campaigns WHERE id = $1', [id]),
      query('SELECT * FROM content_calendar WHERE campaign_id = $1 ORDER BY scheduled_date ASC', [id])
    ]);
    if (!campaign.rows[0]) return null;
    return { ...campaign.rows[0], content_items: content.rows };
  }

  async createCampaign(data) {
    const { name, description, channel, status, start_date, end_date, budget, spent, leads_generated, conversions, impressions, clicks, target_audience, notes } = data;
    const result = await query(
      `INSERT INTO campaigns (name, description, channel, status, start_date, end_date, budget, spent, leads_generated, conversions, impressions, clicks, target_audience, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [name, description || null, channel, status || 'draft', start_date || null, end_date || null, budget || 0, spent || 0, leads_generated || 0, conversions || 0, impressions || 0, clicks || 0, target_audience || null, notes || null]
    );
    return result.rows[0];
  }

  async updateCampaign(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['name', 'description', 'channel', 'status', 'start_date', 'end_date', 'budget', 'spent', 'leads_generated', 'conversions', 'impressions', 'clicks', 'target_audience', 'notes'];
    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE campaigns SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteCampaign(id) {
    const result = await query('DELETE FROM campaigns WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // CONTENT CALENDAR
  // ========================

  async getContentCalendar({ page = 1, limit = 50, status = '', content_type = '', start_date = '', end_date = '' } = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT cc.*, c.name as campaign_name
      FROM content_calendar cc
      LEFT JOIN campaigns c ON cc.campaign_id = c.id
    `;
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`cc.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    if (content_type) {
      conditions.push(`cc.content_type = $${paramIndex}`);
      params.push(content_type);
      paramIndex++;
    }
    if (start_date) {
      conditions.push(`cc.scheduled_date >= $${paramIndex}`);
      params.push(start_date);
      paramIndex++;
    }
    if (end_date) {
      conditions.push(`cc.scheduled_date <= $${paramIndex}`);
      params.push(end_date);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY cc.scheduled_date ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Count
    let countSql = 'SELECT COUNT(*) FROM content_calendar cc';
    const countParams = [];
    const countConditions = [];
    let cIdx = 1;
    if (status) {
      countConditions.push(`cc.status = $${cIdx}`);
      countParams.push(status);
      cIdx++;
    }
    if (content_type) {
      countConditions.push(`cc.content_type = $${cIdx}`);
      countParams.push(content_type);
      cIdx++;
    }
    if (start_date) {
      countConditions.push(`cc.scheduled_date >= $${cIdx}`);
      countParams.push(start_date);
      cIdx++;
    }
    if (end_date) {
      countConditions.push(`cc.scheduled_date <= $${cIdx}`);
      countParams.push(end_date);
      cIdx++;
    }
    if (countConditions.length > 0) {
      countSql += ` WHERE ${countConditions.join(' AND ')}`;
    }
    const countResult = await query(countSql, countParams);

    return {
      items: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getContentItemById(id) {
    const result = await query(
      `SELECT cc.*, c.name as campaign_name
       FROM content_calendar cc
       LEFT JOIN campaigns c ON cc.campaign_id = c.id
       WHERE cc.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createContentItem(data) {
    const { title, content_type, content_pillar, scheduled_date, status, linkedin_post_id, campaign_id, author, content, notes } = data;
    const result = await query(
      `INSERT INTO content_calendar (title, content_type, content_pillar, scheduled_date, status, linkedin_post_id, campaign_id, author, content, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, content_type, content_pillar || null, scheduled_date, status || 'planned', linkedin_post_id || null, campaign_id || null, author || null, content || null, notes || null]
    );
    return result.rows[0];
  }

  async updateContentItem(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['title', 'content_type', 'content_pillar', 'scheduled_date', 'status', 'linkedin_post_id', 'campaign_id', 'author', 'content', 'notes'];
    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE content_calendar SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteContentItem(id) {
    const result = await query('DELETE FROM content_calendar WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // ANALYTICS
  // ========================

  async getAnalytics() {
    const [campaignStats, channelBreakdown, contentStats] = await Promise.all([
      query(`SELECT
        COUNT(*) as total_campaigns,
        COUNT(*) FILTER (WHERE status = 'active') as active_campaigns,
        COALESCE(SUM(budget), 0) as total_budget,
        COALESCE(SUM(spent), 0) as total_spent,
        COALESCE(SUM(leads_generated), 0) as total_leads,
        COALESCE(SUM(conversions), 0) as total_conversions,
        COALESCE(SUM(impressions), 0) as total_impressions,
        COALESCE(SUM(clicks), 0) as total_clicks
       FROM campaigns`),
      query(`SELECT channel, COUNT(*) as count,
        COALESCE(SUM(leads_generated), 0) as leads,
        COALESCE(SUM(conversions), 0) as conversions,
        COALESCE(SUM(spent), 0) as spent
       FROM campaigns
       GROUP BY channel
       ORDER BY leads DESC`),
      query(`SELECT
        COUNT(*) as total_content,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'planned') as planned,
        COUNT(*) FILTER (WHERE status = 'draft') as drafts
       FROM content_calendar`)
    ]);

    const stats = campaignStats.rows[0];
    const totalSpent = parseFloat(stats.total_spent);
    const totalLeads = parseInt(stats.total_leads);

    return {
      campaigns: stats,
      channels: channelBreakdown.rows,
      content: contentStats.rows[0],
      cost_per_lead: totalLeads > 0 ? Math.round((totalSpent / totalLeads) * 100) / 100 : 0,
      conversion_rate: parseInt(stats.total_impressions) > 0
        ? Math.round((parseInt(stats.total_clicks) / parseInt(stats.total_impressions)) * 10000) / 100
        : 0
    };
  }
}

// Route-compatible aliases
const instance = new MarketingService();
instance.getCalendarItems = instance.getContentCalendar.bind(instance);
instance.createCalendarItem = instance.createContentItem.bind(instance);
instance.updateCalendarItem = instance.updateContentItem.bind(instance);
instance.deleteCalendarItem = instance.deleteContentItem.bind(instance);
module.exports = instance;

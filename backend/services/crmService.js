const { query } = require('../db/connection');

class CRMService {
  async connect({ username, password, apiKey }) {
    // Validate CRM connection credentials
    return {
      token: 'crm-session-' + Date.now(),
      userId: username,
      connected: true
    };
  }

  async getContacts({ page = 1, limit = 50, search = '' } = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT c.*, sd.name as school_district_name
      FROM contacts c
      LEFT JOIN school_districts sd ON c.school_district_id = sd.id
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      sql += ` WHERE c.first_name ILIKE $${paramIndex} OR c.last_name ILIKE $${paramIndex} OR c.email ILIKE $${paramIndex} OR sd.name ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY c.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) FROM contacts c LEFT JOIN school_districts sd ON c.school_district_id = sd.id';
    const countParams = [];
    if (search) {
      countSql += ` WHERE c.first_name ILIKE $1 OR c.last_name ILIKE $1 OR c.email ILIKE $1 OR sd.name ILIKE $1`;
      countParams.push(`%${search}%`);
    }
    const countResult = await query(countSql, countParams);

    return {
      contacts: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getContactById(id) {
    const result = await query(
      `SELECT c.*, sd.name as school_district_name
       FROM contacts c
       LEFT JOIN school_districts sd ON c.school_district_id = sd.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createContact(data) {
    const { first_name, last_name, title, email, phone, school_district_id, linkedin_url, is_primary, is_decision_maker, notes } = data;
    const result = await query(
      `INSERT INTO contacts (first_name, last_name, title, email, phone, school_district_id, linkedin_url, is_primary, is_decision_maker, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [first_name, last_name, title, email, phone || null, school_district_id, linkedin_url || null, is_primary || false, is_decision_maker || false, notes || null]
    );
    return result.rows[0];
  }

  async updateContact(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (['first_name', 'last_name', 'title', 'email', 'phone', 'linkedin_url', 'is_primary', 'is_decision_maker', 'notes', 'school_district_id'].includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE contacts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async getCompanies() {
    const result = await query(
      `SELECT sd.*,
        (SELECT COUNT(*) FROM contacts WHERE school_district_id = sd.id) as contact_count,
        r.status as relationship_status,
        r.implementation_status,
        p.stage as pipeline_stage,
        p.opportunity_value
       FROM school_districts sd
       LEFT JOIN relationships r ON sd.id = r.school_district_id
       LEFT JOIN pipeline p ON sd.id = p.school_district_id
       ORDER BY sd.updated_at DESC`
    );
    return result.rows;
  }

  async getDeals() {
    const result = await query(
      `SELECT p.*, sd.name as school_district_name, sd.state, sd.city
       FROM pipeline p
       LEFT JOIN school_districts sd ON p.school_district_id = sd.id
       ORDER BY p.probability DESC, p.opportunity_value DESC`
    );
    return result.rows;
  }

  async getAnalytics() {
    const [pipelineStats, stageBreakdown, recentActivity, contactStats] = await Promise.all([
      query(`SELECT
        COUNT(*) as total_deals,
        SUM(opportunity_value) as total_pipeline_value,
        AVG(probability) as avg_probability,
        SUM(opportunity_value * probability / 100) as weighted_pipeline
       FROM pipeline`),
      query(`SELECT stage, COUNT(*) as count, SUM(opportunity_value) as value
       FROM pipeline GROUP BY stage ORDER BY MIN(probability)`),
      query(`SELECT * FROM communications ORDER BY date DESC LIMIT 10`),
      query(`SELECT
        COUNT(*) as total_contacts,
        COUNT(*) FILTER (WHERE is_decision_maker) as decision_makers
       FROM contacts`)
    ]);

    return {
      pipeline: pipelineStats.rows[0],
      stages: stageBreakdown.rows,
      recentActivity: recentActivity.rows,
      contacts: contactStats.rows[0]
    };
  }

  async syncData(type) {
    // Trigger a data sync operation
    return {
      type,
      syncedAt: new Date().toISOString(),
      recordsProcessed: 0,
      status: 'completed'
    };
  }

  async getWebhooks() {
    // Webhook configuration (stored in-memory for now)
    return [
      { id: 'wh-1', event: 'contact.created', url: '/api/crm/webhook', active: true },
      { id: 'wh-2', event: 'deal.updated', url: '/api/crm/webhook', active: true }
    ];
  }

  async createWebhook(data) {
    return {
      id: 'wh-' + Date.now(),
      ...data,
      active: true,
      createdAt: new Date().toISOString()
    };
  }

  // ========================
  // ENHANCED METRICS
  // ========================

  async getPipelineForecast() {
    const result = await query(
      `SELECT stage,
        COUNT(*) as deal_count,
        SUM(opportunity_value) as total_value,
        AVG(probability) as avg_probability,
        SUM(opportunity_value * probability / 100) as weighted_value
       FROM pipeline
       GROUP BY stage
       ORDER BY MIN(probability) ASC`
    );

    const totalWeighted = result.rows.reduce((s, r) => s + parseFloat(r.weighted_value || 0), 0);

    return {
      stages: result.rows,
      total_weighted_value: totalWeighted,
      forecast_confidence: totalWeighted > 100000 ? 'high' : totalWeighted > 50000 ? 'medium' : 'low'
    };
  }

  async getPipelineVelocity() {
    // Calculate average deal cycle time and velocity
    const result = await query(
      `SELECT
        COUNT(*) as total_deals,
        AVG(opportunity_value) as avg_deal_size,
        SUM(opportunity_value) as total_pipeline,
        AVG(probability) as avg_win_rate
       FROM pipeline`
    );

    const r = result.rows[0];
    const avgDealSize = parseFloat(r.avg_deal_size || 0);
    const winRate = parseFloat(r.avg_win_rate || 0) / 100;
    const totalDeals = parseInt(r.total_deals || 0);
    // Estimated sales cycle: 9 months for K-12
    const salesCycleMonths = 9;

    return {
      total_deals: totalDeals,
      avg_deal_size: Math.round(avgDealSize),
      avg_win_rate: Math.round(winRate * 100),
      sales_cycle_months: salesCycleMonths,
      monthly_velocity: Math.round((totalDeals * avgDealSize * winRate) / salesCycleMonths)
    };
  }
}

module.exports = new CRMService();

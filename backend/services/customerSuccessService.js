const { query } = require('../db/connection');

class CustomerSuccessService {
  // ========================
  // CUSTOMER HEALTH
  // ========================

  async getCustomerHealth({ risk_level = '', page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT ch.*, sd.name as school_district_name, sd.state, sd.city, sd.total_students
      FROM customer_health ch
      LEFT JOIN school_districts sd ON ch.school_district_id = sd.id
    `;
    const params = [];
    let paramIndex = 1;

    if (risk_level) {
      sql += ` WHERE ch.risk_level = $${paramIndex}`;
      params.push(risk_level);
      paramIndex++;
    }

    sql += ` ORDER BY ch.overall_score ASC NULLS LAST LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    let countSql = 'SELECT COUNT(*) FROM customer_health ch';
    const countParams = [];
    if (risk_level) {
      countSql += ' WHERE ch.risk_level = $1';
      countParams.push(risk_level);
    }
    const countResult = await query(countSql, countParams);

    return {
      customers: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getCustomerHealthById(id) {
    const result = await query(
      `SELECT ch.*, sd.name as school_district_name, sd.state, sd.city, sd.total_students
       FROM customer_health ch
       LEFT JOIN school_districts sd ON ch.school_district_id = sd.id
       WHERE ch.id = $1`,
      [id]
    );
    if (!result.rows[0]) return null;

    // Also fetch onboarding milestones and recent tickets
    const health = result.rows[0];
    const [milestones, tickets] = await Promise.all([
      query(
        'SELECT * FROM onboarding_milestones WHERE school_district_id = $1 ORDER BY milestone_order ASC',
        [health.school_district_id]
      ),
      query(
        'SELECT * FROM support_tickets WHERE school_district_id = $1 ORDER BY created_at DESC LIMIT 10',
        [health.school_district_id]
      )
    ]);

    health.onboarding_milestones = milestones.rows;
    health.recent_tickets = tickets.rows;
    return health;
  }

  async getCustomerHealthByDistrict(schoolDistrictId) {
    const result = await query(
      `SELECT ch.*, sd.name as school_district_name
       FROM customer_health ch
       LEFT JOIN school_districts sd ON ch.school_district_id = sd.id
       WHERE ch.school_district_id = $1`,
      [schoolDistrictId]
    );
    return result.rows[0] || null;
  }

  async createCustomerHealth(data) {
    const { school_district_id, usage_score, engagement_score, support_score, adoption_score, renewal_date, contract_value, expansion_opportunity, expansion_notes } = data;

    // Calculate overall score and risk level
    const overall = this.calculateHealthScore(usage_score, engagement_score, support_score, adoption_score);

    const result = await query(
      `INSERT INTO customer_health (school_district_id, overall_score, usage_score, engagement_score, support_score, adoption_score, risk_level, renewal_date, contract_value, expansion_opportunity, expansion_notes, last_calculated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       RETURNING *`,
      [school_district_id, overall.score, usage_score || 0, engagement_score || 0, support_score || 0, adoption_score || 0, overall.risk_level, renewal_date || null, contract_value || null, expansion_opportunity || false, expansion_notes || null]
    );
    return result.rows[0];
  }

  async updateCustomerHealth(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['school_district_id', 'usage_score', 'engagement_score', 'support_score', 'adoption_score', 'renewal_date', 'contract_value', 'expansion_opportunity', 'expansion_notes'];
    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    // Recalculate overall score if any sub-score changed
    const scoreFields = ['usage_score', 'engagement_score', 'support_score', 'adoption_score'];
    const hasScoreChange = scoreFields.some(f => data[f] !== undefined);

    if (hasScoreChange) {
      // Fetch current scores to merge with updates
      const current = await query('SELECT usage_score, engagement_score, support_score, adoption_score FROM customer_health WHERE id = $1', [id]);
      if (current.rows[0]) {
        const scores = { ...current.rows[0], ...data };
        const overall = this.calculateHealthScore(scores.usage_score, scores.engagement_score, scores.support_score, scores.adoption_score);

        fields.push(`overall_score = $${paramIndex}`);
        values.push(overall.score);
        paramIndex++;

        fields.push(`risk_level = $${paramIndex}`);
        values.push(overall.risk_level);
        paramIndex++;

        fields.push(`last_calculated_at = NOW()`);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE customer_health SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteCustomerHealth(id) {
    const result = await query('DELETE FROM customer_health WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  /**
   * Calculate health score using weighted average:
   * usage(25%) + engagement(30%) + support(20%) + adoption(25%)
   *
   * Risk levels:
   *   0-40  = critical
   *   41-60 = at_risk
   *   61-80 = watch
   *   81-100 = healthy
   */
  calculateHealthScore(usage = 0, engagement = 0, support = 0, adoption = 0) {
    const score = Math.round(
      (usage * 0.25) + (engagement * 0.30) + (support * 0.20) + (adoption * 0.25)
    );

    let risk_level;
    if (score <= 40) {
      risk_level = 'critical';
    } else if (score <= 60) {
      risk_level = 'at_risk';
    } else if (score <= 80) {
      risk_level = 'watch';
    } else {
      risk_level = 'healthy';
    }

    return { score, risk_level };
  }

  /**
   * Recalculate health score for a specific customer from fresh data.
   */
  async recalculateHealth(id) {
    const current = await query('SELECT * FROM customer_health WHERE id = $1', [id]);
    if (!current.rows[0]) return null;

    const c = current.rows[0];
    const overall = this.calculateHealthScore(c.usage_score, c.engagement_score, c.support_score, c.adoption_score);

    const result = await query(
      `UPDATE customer_health SET overall_score = $1, risk_level = $2, last_calculated_at = NOW() WHERE id = $3 RETURNING *`,
      [overall.score, overall.risk_level, id]
    );
    return result.rows[0];
  }

  // ========================
  // RENEWALS
  // ========================

  /**
   * Returns customers with renewal_date within the next 90 days.
   */
  async getRenewals({ days = 90 } = {}) {
    const result = await query(
      `SELECT ch.*, sd.name as school_district_name, sd.state, sd.city, sd.total_students
       FROM customer_health ch
       LEFT JOIN school_districts sd ON ch.school_district_id = sd.id
       WHERE ch.renewal_date IS NOT NULL
         AND ch.renewal_date >= CURRENT_DATE
         AND ch.renewal_date <= CURRENT_DATE + ($1 || ' days')::interval
       ORDER BY ch.renewal_date ASC`,
      [days]
    );

    return result.rows.map(row => ({
      ...row,
      days_until_renewal: Math.ceil((new Date(row.renewal_date) - new Date()) / (1000 * 60 * 60 * 24)),
      urgency: (() => {
        const daysLeft = Math.ceil((new Date(row.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 30) return 'urgent';
        if (daysLeft <= 60) return 'soon';
        return 'upcoming';
      })()
    }));
  }

  // ========================
  // ONBOARDING MILESTONES
  // ========================

  async getOnboardingMilestones(schoolDistrictId) {
    const result = await query(
      'SELECT * FROM onboarding_milestones WHERE school_district_id = $1 ORDER BY milestone_order ASC',
      [schoolDistrictId]
    );
    return result.rows;
  }

  async createOnboardingMilestone(data) {
    const { school_district_id, milestone_name, milestone_order, description, due_date, status, notes } = data;
    const result = await query(
      `INSERT INTO onboarding_milestones (school_district_id, milestone_name, milestone_order, description, due_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [school_district_id, milestone_name, milestone_order, description || null, due_date || null, status || 'pending', notes || null]
    );
    return result.rows[0];
  }

  async updateOnboardingMilestone(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['milestone_name', 'milestone_order', 'description', 'due_date', 'completed_at', 'status', 'notes'];
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
      `UPDATE onboarding_milestones SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteOnboardingMilestone(id) {
    const result = await query('DELETE FROM onboarding_milestones WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // SUPPORT TICKETS
  // ========================

  async getSupportTickets({ page = 1, limit = 50, status = '', priority = '', school_district_id = '' } = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT st.*, sd.name as school_district_name, c.first_name as contact_first_name, c.last_name as contact_last_name
      FROM support_tickets st
      LEFT JOIN school_districts sd ON st.school_district_id = sd.id
      LEFT JOIN contacts c ON st.contact_id = c.id
    `;
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`st.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    if (priority) {
      conditions.push(`st.priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }
    if (school_district_id) {
      conditions.push(`st.school_district_id = $${paramIndex}`);
      params.push(school_district_id);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY CASE st.priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END ASC, st.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    let countSql = 'SELECT COUNT(*) FROM support_tickets st';
    const countParams = [];
    const countConditions = [];
    let cIdx = 1;
    if (status) {
      countConditions.push(`st.status = $${cIdx}`);
      countParams.push(status);
      cIdx++;
    }
    if (priority) {
      countConditions.push(`st.priority = $${cIdx}`);
      countParams.push(priority);
      cIdx++;
    }
    if (school_district_id) {
      countConditions.push(`st.school_district_id = $${cIdx}`);
      countParams.push(school_district_id);
      cIdx++;
    }
    if (countConditions.length > 0) {
      countSql += ` WHERE ${countConditions.join(' AND ')}`;
    }
    const countResult = await query(countSql, countParams);

    return {
      tickets: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getSupportTicketById(id) {
    const result = await query(
      `SELECT st.*, sd.name as school_district_name, c.first_name as contact_first_name, c.last_name as contact_last_name, c.email as contact_email
       FROM support_tickets st
       LEFT JOIN school_districts sd ON st.school_district_id = sd.id
       LEFT JOIN contacts c ON st.contact_id = c.id
       WHERE st.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createSupportTicket(data) {
    const { school_district_id, contact_id, subject, description, priority, status, tier, sla_response_due, sla_resolution_due, assigned_to, tags } = data;
    const result = await query(
      `INSERT INTO support_tickets (school_district_id, contact_id, subject, description, priority, status, tier, sla_response_due, sla_resolution_due, assigned_to, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [school_district_id || null, contact_id || null, subject, description || null, priority || 'medium', status || 'open', tier || 'L1', sla_response_due || null, sla_resolution_due || null, assigned_to || null, tags || []]
    );
    return result.rows[0];
  }

  async updateSupportTicket(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['school_district_id', 'contact_id', 'subject', 'description', 'priority', 'status', 'tier', 'sla_response_due', 'sla_resolution_due', 'first_response_at', 'resolved_at', 'assigned_to', 'resolution', 'tags'];
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
      `UPDATE support_tickets SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteSupportTicket(id) {
    const result = await query('DELETE FROM support_tickets WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // DASHBOARD SUMMARY
  // ========================

  async getSummary() {
    const [healthStats, ticketStats, renewals, onboardingStats] = await Promise.all([
      query(`SELECT
        COUNT(*) as total_customers,
        AVG(overall_score) as avg_health_score,
        COUNT(*) FILTER (WHERE risk_level = 'healthy') as healthy,
        COUNT(*) FILTER (WHERE risk_level = 'watch') as watch,
        COUNT(*) FILTER (WHERE risk_level = 'at_risk') as at_risk,
        COUNT(*) FILTER (WHERE risk_level = 'critical') as critical,
        COALESCE(SUM(contract_value), 0) as total_contract_value,
        COUNT(*) FILTER (WHERE expansion_opportunity = true) as expansion_opportunities
       FROM customer_health`),
      query(`SELECT
        COUNT(*) as total_tickets,
        COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tickets,
        COUNT(*) FILTER (WHERE priority IN ('high', 'urgent')) as high_priority,
        COUNT(*) FILTER (WHERE sla_resolution_due < NOW() AND status NOT IN ('resolved', 'closed')) as sla_breaches
       FROM support_tickets`),
      query(`SELECT COUNT(*) as upcoming_renewals, COALESCE(SUM(contract_value), 0) as renewal_value
       FROM customer_health
       WHERE renewal_date >= CURRENT_DATE AND renewal_date <= CURRENT_DATE + INTERVAL '90 days'`),
      query(`SELECT
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) as total
       FROM onboarding_milestones`)
    ]);

    return {
      health: healthStats.rows[0],
      tickets: ticketStats.rows[0],
      renewals: renewals.rows[0],
      onboarding: onboardingStats.rows[0]
    };
  }

  // ========================
  // ENHANCED METRICS
  // ========================

  async getChurnPrediction() {
    const result = await query(
      `SELECT ch.*, sd.name as school_district_name, sd.state
       FROM customer_health ch
       LEFT JOIN school_districts sd ON ch.school_district_id = sd.id
       WHERE ch.risk_level IN ('at_risk', 'critical')
       ORDER BY ch.overall_score ASC`
    );

    const atRiskValue = result.rows.reduce((s, r) => s + parseFloat(r.contract_value || 0), 0);

    return {
      at_risk_customers: result.rows,
      at_risk_count: result.rows.length,
      at_risk_revenue: atRiskValue,
      churn_probability: result.rows.length > 0 ? Math.round((result.rows.filter(r => r.risk_level === 'critical').length / result.rows.length) * 100) : 0
    };
  }

  async getNPSSummary() {
    const result = await query(
      `SELECT
        COUNT(*) FILTER (WHERE nps_score >= 9) as promoters,
        COUNT(*) FILTER (WHERE nps_score >= 7 AND nps_score <= 8) as passives,
        COUNT(*) FILTER (WHERE nps_score <= 6) as detractors,
        COUNT(*) FILTER (WHERE nps_score IS NOT NULL) as total_responses,
        AVG(nps_score) as avg_score
       FROM customer_health WHERE nps_score IS NOT NULL`
    );

    const r = result.rows[0];
    const total = parseInt(r.total_responses) || 1;
    const promoterPct = parseInt(r.promoters) / total * 100;
    const detractorPct = parseInt(r.detractors) / total * 100;

    return {
      nps_score: Math.round(promoterPct - detractorPct),
      promoters: parseInt(r.promoters),
      passives: parseInt(r.passives),
      detractors: parseInt(r.detractors),
      total_responses: parseInt(r.total_responses),
      avg_score: r.avg_score ? parseFloat(r.avg_score).toFixed(1) : null
    };
  }

  async getCustomerJourney(districtId) {
    const [health, milestones, tickets, communications] = await Promise.all([
      query('SELECT * FROM customer_health WHERE school_district_id = $1', [districtId]),
      query('SELECT * FROM onboarding_milestones WHERE school_district_id = $1 ORDER BY milestone_order ASC', [districtId]),
      query('SELECT * FROM support_tickets WHERE school_district_id = $1 ORDER BY created_at DESC LIMIT 20', [districtId]),
      query('SELECT * FROM communications WHERE school_district_id = $1 ORDER BY date DESC LIMIT 20', [districtId])
    ]);

    return {
      health: health.rows[0] || null,
      milestones: milestones.rows,
      tickets: tickets.rows,
      communications: communications.rows
    };
  }
}

// Route-compatible aliases
const instance = new CustomerSuccessService();
instance.getHealthScores = instance.getCustomerHealth.bind(instance);
instance.getHealthScoreById = instance.getCustomerHealthById.bind(instance);
instance.updateHealthScore = instance.updateCustomerHealth.bind(instance);
instance.calculateHealthForDistrict = async function(districtId) {
  // Look up health record by district, then recalculate
  const health = await instance.getCustomerHealthByDistrict(districtId);
  if (!health) return null;
  return instance.recalculateHealth(health.id);
};
instance.getTickets = instance.getSupportTickets.bind(instance);
instance.createTicket = instance.createSupportTicket.bind(instance);
instance.updateTicket = instance.updateSupportTicket.bind(instance);
instance.getUpcomingRenewals = instance.getRenewals.bind(instance);
module.exports = instance;

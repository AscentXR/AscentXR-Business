const { query } = require('../db/connection');

class PartnershipService {
  // ========================
  // PARTNERS
  // ========================

  async getPartners({ page = 1, limit = 50, search = '', status = '', type = '' } = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT p.*,
        (SELECT COUNT(*) FROM partner_deals pd WHERE pd.partner_id = p.id) as deal_count,
        (SELECT COALESCE(SUM(pd.deal_value), 0) FROM partner_deals pd WHERE pd.partner_id = p.id AND pd.status = 'won') as total_deal_value,
        (SELECT COALESCE(SUM(pd.commission_amount), 0) FROM partner_deals pd WHERE pd.partner_id = p.id) as total_commission
      FROM partners p
    `;
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.contact_name ILIKE $${paramIndex} OR p.contact_email ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (status) {
      conditions.push(`p.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    if (type) {
      conditions.push(`p.type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY p.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    let countSql = 'SELECT COUNT(*) FROM partners p';
    const countParams = [];
    const countConditions = [];
    let cIdx = 1;
    if (search) {
      countConditions.push(`(p.name ILIKE $${cIdx} OR p.contact_name ILIKE $${cIdx} OR p.contact_email ILIKE $${cIdx})`);
      countParams.push(`%${search}%`);
      cIdx++;
    }
    if (status) {
      countConditions.push(`p.status = $${cIdx}`);
      countParams.push(status);
      cIdx++;
    }
    if (type) {
      countConditions.push(`p.type = $${cIdx}`);
      countParams.push(type);
      cIdx++;
    }
    if (countConditions.length > 0) {
      countSql += ` WHERE ${countConditions.join(' AND ')}`;
    }
    const countResult = await query(countSql, countParams);

    return {
      partners: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getPartnerById(id) {
    const [partner, deals] = await Promise.all([
      query(
        `SELECT p.*,
          (SELECT COUNT(*) FROM partner_deals pd WHERE pd.partner_id = p.id) as deal_count,
          (SELECT COALESCE(SUM(pd.deal_value), 0) FROM partner_deals pd WHERE pd.partner_id = p.id AND pd.status = 'won') as total_deal_value,
          (SELECT COALESCE(SUM(pd.commission_amount), 0) FROM partner_deals pd WHERE pd.partner_id = p.id) as total_commission
         FROM partners p WHERE p.id = $1`,
        [id]
      ),
      query(
        `SELECT pd.*, sd.name as school_district_name
         FROM partner_deals pd
         LEFT JOIN school_districts sd ON pd.school_district_id = sd.id
         WHERE pd.partner_id = $1
         ORDER BY pd.created_at DESC`,
        [id]
      )
    ]);
    if (!partner.rows[0]) return null;
    return { ...partner.rows[0], deals: deals.rows };
  }

  async createPartner(data) {
    const { name, type, contact_name, contact_email, contact_phone, company_url, status, commission_rate, commission_type, agreement_start, agreement_end, notes } = data;
    const result = await query(
      `INSERT INTO partners (name, type, contact_name, contact_email, contact_phone, company_url, status, commission_rate, commission_type, agreement_start, agreement_end, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [name, type, contact_name || null, contact_email || null, contact_phone || null, company_url || null, status || 'prospect', commission_rate || 0, commission_type || 'percentage', agreement_start || null, agreement_end || null, notes || null]
    );
    return result.rows[0];
  }

  async updatePartner(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['name', 'type', 'contact_name', 'contact_email', 'contact_phone', 'company_url', 'status', 'commission_rate', 'commission_type', 'agreement_start', 'agreement_end', 'notes'];
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
      `UPDATE partners SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deletePartner(id) {
    const result = await query('DELETE FROM partners WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // PARTNER DEALS
  // ========================

  async getDeals({ partner_id = '', status = '', page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT pd.*, p.name as partner_name, sd.name as school_district_name
      FROM partner_deals pd
      LEFT JOIN partners p ON pd.partner_id = p.id
      LEFT JOIN school_districts sd ON pd.school_district_id = sd.id
    `;
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (partner_id) {
      conditions.push(`pd.partner_id = $${paramIndex}`);
      params.push(partner_id);
      paramIndex++;
    }
    if (status) {
      conditions.push(`pd.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY pd.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return result.rows;
  }

  async getDealById(id) {
    const result = await query(
      `SELECT pd.*, p.name as partner_name, p.commission_rate as partner_commission_rate, p.commission_type as partner_commission_type, sd.name as school_district_name
       FROM partner_deals pd
       LEFT JOIN partners p ON pd.partner_id = p.id
       LEFT JOIN school_districts sd ON pd.school_district_id = sd.id
       WHERE pd.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createDeal(data) {
    const { partner_id, school_district_id, pipeline_id, deal_value, status, referred_at, closed_at, notes } = data;

    // Calculate commission based on partner's commission configuration
    let commission_amount = data.commission_amount || 0;
    if (!data.commission_amount && partner_id && deal_value) {
      commission_amount = await this.calculateCommission(partner_id, deal_value);
    }

    const result = await query(
      `INSERT INTO partner_deals (partner_id, school_district_id, pipeline_id, deal_value, commission_amount, status, referred_at, closed_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [partner_id, school_district_id || null, pipeline_id || null, deal_value || 0, commission_amount, status || 'pending', referred_at || new Date().toISOString().split('T')[0], closed_at || null, notes || null]
    );
    return result.rows[0];
  }

  async updateDeal(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['partner_id', 'school_district_id', 'pipeline_id', 'deal_value', 'commission_amount', 'status', 'referred_at', 'closed_at', 'paid_at', 'notes'];
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
      `UPDATE partner_deals SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteDeal(id) {
    const result = await query('DELETE FROM partner_deals WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // COMMISSION CALCULATION
  // ========================

  /**
   * Calculate commission for a deal based on the partner's commission settings.
   * commission_type 'percentage' => deal_value * (commission_rate / 100)
   * commission_type 'flat' => commission_rate (used as a flat amount)
   */
  async calculateCommission(partnerId, dealValue) {
    const partner = await query('SELECT commission_rate, commission_type FROM partners WHERE id = $1', [partnerId]);
    if (!partner.rows[0]) return 0;

    const { commission_rate, commission_type } = partner.rows[0];
    const rate = parseFloat(commission_rate) || 0;

    if (commission_type === 'flat') {
      return rate;
    }

    // Default: percentage
    return Math.round((parseFloat(dealValue) * rate / 100) * 100) / 100;
  }

  /**
   * Recalculate commission for an existing deal.
   */
  async recalculateCommission(dealId) {
    const deal = await query('SELECT partner_id, deal_value FROM partner_deals WHERE id = $1', [dealId]);
    if (!deal.rows[0]) return null;

    const commission_amount = await this.calculateCommission(deal.rows[0].partner_id, deal.rows[0].deal_value);
    const result = await query(
      'UPDATE partner_deals SET commission_amount = $1 WHERE id = $2 RETURNING *',
      [commission_amount, dealId]
    );
    return result.rows[0];
  }

  // ========================
  // SUMMARY
  // ========================

  async getSummary() {
    const [partnerStats, dealStats, topPartners] = await Promise.all([
      query(`SELECT
        COUNT(*) as total_partners,
        COUNT(*) FILTER (WHERE status = 'active') as active_partners,
        COUNT(*) FILTER (WHERE status = 'prospect') as prospect_partners
       FROM partners`),
      query(`SELECT
        COUNT(*) as total_deals,
        COUNT(*) FILTER (WHERE status = 'won') as won_deals,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_deals,
        COALESCE(SUM(deal_value) FILTER (WHERE status = 'won'), 0) as total_revenue,
        COALESCE(SUM(commission_amount), 0) as total_commissions,
        COALESCE(SUM(commission_amount) FILTER (WHERE status IN ('won', 'paid')), 0) as earned_commissions,
        COALESCE(SUM(commission_amount) FILTER (WHERE status = 'paid'), 0) as paid_commissions
       FROM partner_deals`),
      query(`SELECT p.name, p.type, COUNT(pd.id) as deals, COALESCE(SUM(pd.deal_value), 0) as revenue
       FROM partners p
       LEFT JOIN partner_deals pd ON p.id = pd.partner_id AND pd.status = 'won'
       WHERE p.status = 'active'
       GROUP BY p.id, p.name, p.type
       ORDER BY revenue DESC
       LIMIT 5`)
    ]);

    return {
      partners: partnerStats.rows[0],
      deals: dealStats.rows[0],
      top_partners: topPartners.rows
    };
  }
}

module.exports = new PartnershipService();

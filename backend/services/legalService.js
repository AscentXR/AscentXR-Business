const { query } = require('../db/connection');

class LegalService {
  // ========================
  // CONTRACTS
  // ========================

  async getContracts({ page = 1, limit = 50, search = '', status = '', contract_type = '' } = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT ct.*, sd.name as school_district_name, p.name as partner_name
      FROM contracts ct
      LEFT JOIN school_districts sd ON ct.school_district_id = sd.id
      LEFT JOIN partners p ON ct.partner_id = p.id
    `;
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(ct.title ILIKE $${paramIndex} OR sd.name ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (status) {
      conditions.push(`ct.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    if (contract_type) {
      conditions.push(`ct.contract_type = $${paramIndex}`);
      params.push(contract_type);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY ct.end_date ASC NULLS LAST, ct.updated_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Count
    let countSql = `SELECT COUNT(*) FROM contracts ct LEFT JOIN school_districts sd ON ct.school_district_id = sd.id LEFT JOIN partners p ON ct.partner_id = p.id`;
    const countParams = [];
    const countConditions = [];
    let cIdx = 1;
    if (search) {
      countConditions.push(`(ct.title ILIKE $${cIdx} OR sd.name ILIKE $${cIdx} OR p.name ILIKE $${cIdx})`);
      countParams.push(`%${search}%`);
      cIdx++;
    }
    if (status) {
      countConditions.push(`ct.status = $${cIdx}`);
      countParams.push(status);
      cIdx++;
    }
    if (contract_type) {
      countConditions.push(`ct.contract_type = $${cIdx}`);
      countParams.push(contract_type);
      cIdx++;
    }
    if (countConditions.length > 0) {
      countSql += ` WHERE ${countConditions.join(' AND ')}`;
    }
    const countResult = await query(countSql, countParams);

    return {
      contracts: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getContractById(id) {
    const result = await query(
      `SELECT ct.*, sd.name as school_district_name, p.name as partner_name
       FROM contracts ct
       LEFT JOIN school_districts sd ON ct.school_district_id = sd.id
       LEFT JOIN partners p ON ct.partner_id = p.id
       WHERE ct.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createContract(data) {
    const { title, school_district_id, partner_id, contract_type, status, start_date, end_date, value, auto_renew, renewal_notice_days, document_url, signed_by, signed_at, notes } = data;
    const result = await query(
      `INSERT INTO contracts (title, school_district_id, partner_id, contract_type, status, start_date, end_date, value, auto_renew, renewal_notice_days, document_url, signed_by, signed_at, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [title, school_district_id || null, partner_id || null, contract_type, status || 'draft', start_date || null, end_date || null, value || null, auto_renew || false, renewal_notice_days || 30, document_url || null, signed_by || null, signed_at || null, notes || null]
    );
    return result.rows[0];
  }

  async updateContract(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['title', 'school_district_id', 'partner_id', 'contract_type', 'status', 'start_date', 'end_date', 'value', 'auto_renew', 'renewal_notice_days', 'document_url', 'signed_by', 'signed_at', 'notes'];
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
      `UPDATE contracts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteContract(id) {
    const result = await query('DELETE FROM contracts WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // COMPLIANCE ITEMS
  // ========================

  async getComplianceItems({ framework = '', status = '', priority = '' } = {}) {
    let sql = 'SELECT * FROM compliance_items';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (framework) {
      conditions.push(`framework = $${paramIndex}`);
      params.push(framework);
      paramIndex++;
    }
    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    if (priority) {
      conditions.push(`priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY CASE priority WHEN \'critical\' THEN 1 WHEN \'high\' THEN 2 WHEN \'medium\' THEN 3 WHEN \'low\' THEN 4 END ASC, updated_at DESC';
    const result = await query(sql, params);
    return result.rows;
  }

  async getComplianceItemById(id) {
    const result = await query('SELECT * FROM compliance_items WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createComplianceItem(data) {
    const { framework, requirement, description, status, priority, evidence_url, evidence_notes, last_reviewed_at, next_review_date, assigned_to } = data;
    const result = await query(
      `INSERT INTO compliance_items (framework, requirement, description, status, priority, evidence_url, evidence_notes, last_reviewed_at, next_review_date, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [framework, requirement, description || null, status || 'not_started', priority || 'medium', evidence_url || null, evidence_notes || null, last_reviewed_at || null, next_review_date || null, assigned_to || null]
    );
    return result.rows[0];
  }

  async updateComplianceItem(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['framework', 'requirement', 'description', 'status', 'priority', 'evidence_url', 'evidence_notes', 'last_reviewed_at', 'next_review_date', 'assigned_to'];
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
      `UPDATE compliance_items SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteComplianceItem(id) {
    const result = await query('DELETE FROM compliance_items WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // SUMMARY
  // ========================

  async getSummary() {
    const [contractStats, complianceStats, expiringContracts] = await Promise.all([
      query(`SELECT
        COUNT(*) as total_contracts,
        COUNT(*) FILTER (WHERE status = 'active') as active_contracts,
        COUNT(*) FILTER (WHERE status = 'signed') as signed_contracts,
        COALESCE(SUM(value) FILTER (WHERE status IN ('active', 'signed')), 0) as total_value,
        COUNT(*) FILTER (WHERE end_date <= CURRENT_DATE + INTERVAL '30 days' AND end_date >= CURRENT_DATE AND status IN ('active', 'signed')) as expiring_soon
       FROM contracts`),
      query(`SELECT
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE status = 'compliant') as compliant,
        COUNT(*) FILTER (WHERE status = 'non_compliant') as non_compliant,
        COUNT(*) FILTER (WHERE status = 'needs_review') as needs_review,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'not_started') as not_started
       FROM compliance_items`),
      query(`SELECT ct.*, sd.name as school_district_name
       FROM contracts ct
       LEFT JOIN school_districts sd ON ct.school_district_id = sd.id
       WHERE ct.end_date <= CURRENT_DATE + INTERVAL '90 days' AND ct.end_date >= CURRENT_DATE AND ct.status IN ('active', 'signed')
       ORDER BY ct.end_date ASC`)
    ]);

    const compliance = complianceStats.rows[0];
    const total = parseInt(compliance.total_items) || 1;
    const compliantCount = parseInt(compliance.compliant);

    return {
      contracts: contractStats.rows[0],
      compliance: compliance,
      compliance_rate: Math.round((compliantCount / total) * 10000) / 100,
      expiring_contracts: expiringContracts.rows
    };
  }

  // ========================
  // ENHANCED METRICS
  // ========================

  async getRiskAssessment() {
    const [compliance, contracts, overdue] = await Promise.all([
      query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'non_compliant') as non_compliant,
        COUNT(*) FILTER (WHERE status = 'needs_review') as needs_review,
        COUNT(*) FILTER (WHERE priority IN ('critical', 'high') AND status != 'compliant') as high_priority_gaps
       FROM compliance_items`),
      query(`SELECT
        COUNT(*) FILTER (WHERE end_date < CURRENT_DATE AND status IN ('active', 'signed')) as expired,
        COUNT(*) FILTER (WHERE end_date <= CURRENT_DATE + INTERVAL '30 days' AND end_date >= CURRENT_DATE AND status IN ('active', 'signed')) as expiring_soon
       FROM contracts`),
      query(`SELECT COUNT(*) as count FROM compliance_items WHERE next_review_date < CURRENT_DATE AND status != 'compliant'`)
    ]);

    const c = compliance.rows[0];
    const ct = contracts.rows[0];
    const totalIssues = parseInt(c.non_compliant) + parseInt(c.needs_review) + parseInt(ct.expired) + parseInt(overdue.rows[0].count);
    const riskScore = Math.max(0, 100 - (totalIssues * 10));

    return {
      risk_score: riskScore,
      risk_level: riskScore >= 80 ? 'low' : riskScore >= 50 ? 'medium' : 'high',
      non_compliant_items: parseInt(c.non_compliant),
      needs_review: parseInt(c.needs_review),
      high_priority_gaps: parseInt(c.high_priority_gaps),
      expired_contracts: parseInt(ct.expired),
      expiring_contracts: parseInt(ct.expiring_soon),
      overdue_reviews: parseInt(overdue.rows[0].count)
    };
  }

  async getComplianceByFramework() {
    const result = await query(
      `SELECT framework,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'compliant') as compliant,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'non_compliant') as non_compliant,
        COUNT(*) FILTER (WHERE status = 'not_started') as not_started,
        COUNT(*) FILTER (WHERE status = 'needs_review') as needs_review
       FROM compliance_items
       GROUP BY framework
       ORDER BY framework`
    );

    return result.rows.map(r => ({
      ...r,
      compliance_rate: parseInt(r.total) > 0 ? Math.round((parseInt(r.compliant) / parseInt(r.total)) * 100) : 0
    }));
  }
}

module.exports = new LegalService();

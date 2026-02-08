const { query } = require('../db/connection');

class TaxService {
  // ========================
  // TAX EVENTS
  // ========================

  async getTaxEvents({ status = '', event_type = '', state = '' } = {}) {
    let sql = 'SELECT * FROM tax_events';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    if (event_type) {
      conditions.push(`event_type = $${paramIndex}`);
      params.push(event_type);
      paramIndex++;
    }
    if (state) {
      conditions.push(`state = $${paramIndex}`);
      params.push(state);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY due_date ASC';
    const result = await query(sql, params);
    return result.rows;
  }

  async getTaxEventById(id) {
    const result = await query('SELECT * FROM tax_events WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createTaxEvent(data) {
    const { title, event_type, due_date, amount, status, entity_type, state, notes } = data;
    const result = await query(
      `INSERT INTO tax_events (title, event_type, due_date, amount, status, entity_type, state, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, event_type, due_date, amount || null, status || 'upcoming', entity_type || null, state || null, notes || null]
    );
    return result.rows[0];
  }

  async updateTaxEvent(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['title', 'event_type', 'due_date', 'amount', 'status', 'entity_type', 'state', 'notes', 'completed_at'];
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
      `UPDATE tax_events SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteTaxEvent(id) {
    const result = await query('DELETE FROM tax_events WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // TAX DEDUCTIONS
  // ========================

  async getDeductions({ tax_year = '', category = '' } = {}) {
    let sql = 'SELECT td.*, e.description as expense_description, e.vendor as expense_vendor FROM tax_deductions td LEFT JOIN expenses e ON td.expense_id = e.id';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (tax_year) {
      conditions.push(`td.tax_year = $${paramIndex}`);
      params.push(parseInt(tax_year));
      paramIndex++;
    }
    if (category) {
      conditions.push(`td.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY td.created_at DESC';
    const result = await query(sql, params);
    return result.rows;
  }

  async getDeductionById(id) {
    const result = await query(
      `SELECT td.*, e.description as expense_description, e.vendor as expense_vendor
       FROM tax_deductions td
       LEFT JOIN expenses e ON td.expense_id = e.id
       WHERE td.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createDeduction(data) {
    const { expense_id, category, description, amount, tax_year, is_r_and_d, r_and_d_notes, documentation_url, status } = data;
    const result = await query(
      `INSERT INTO tax_deductions (expense_id, category, description, amount, tax_year, is_r_and_d, r_and_d_notes, documentation_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [expense_id || null, category, description, amount, tax_year || new Date().getFullYear(), is_r_and_d || false, r_and_d_notes || null, documentation_url || null, status || 'pending']
    );
    return result.rows[0];
  }

  async updateDeduction(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['expense_id', 'category', 'description', 'amount', 'tax_year', 'is_r_and_d', 'r_and_d_notes', 'documentation_url', 'status'];
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
      `UPDATE tax_deductions SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteDeduction(id) {
    const result = await query('DELETE FROM tax_deductions WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // TAX SUMMARY
  // ========================

  async getSummary({ tax_year = '' } = {}) {
    const year = tax_year || new Date().getFullYear();

    const [events, deductions, rdDeductions, expenseSummary] = await Promise.all([
      // Upcoming events
      query(
        `SELECT * FROM tax_events WHERE status != 'completed' ORDER BY due_date ASC LIMIT 10`
      ),
      // Deductions by category
      query(
        `SELECT category, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
         FROM tax_deductions WHERE tax_year = $1
         GROUP BY category ORDER BY total DESC`,
        [year]
      ),
      // R&D deductions total
      query(
        `SELECT COALESCE(SUM(amount), 0) as r_and_d_total, COUNT(*) as r_and_d_count
         FROM tax_deductions WHERE tax_year = $1 AND is_r_and_d = true`,
        [year]
      ),
      // Tax-deductible expenses total
      query(
        `SELECT COALESCE(SUM(amount), 0) as deductible_expenses
         FROM expenses WHERE is_tax_deductible = true AND EXTRACT(YEAR FROM expense_date) = $1`,
        [year]
      )
    ]);

    const totalDeductions = deductions.rows.reduce((sum, d) => sum + parseFloat(d.total), 0);

    return {
      tax_year: year,
      upcoming_events: events.rows,
      deductions_by_category: deductions.rows,
      total_deductions: totalDeductions,
      r_and_d_total: parseFloat(rdDeductions.rows[0].r_and_d_total),
      r_and_d_count: parseInt(rdDeductions.rows[0].r_and_d_count),
      deductible_expenses: parseFloat(expenseSummary.rows[0].deductible_expenses),
      estimated_savings: Math.round(totalDeductions * 0.25 * 100) / 100 // approximate 25% tax rate
    };
  }

  // ========================
  // ENHANCED DASHBOARD
  // ========================

  async getDashboardMetrics() {
    const [upcoming, deductions, rdCredits] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM tax_events WHERE status != 'completed' AND due_date >= CURRENT_DATE`),
      query(`SELECT COALESCE(SUM(amount), 0) as total FROM tax_deductions WHERE tax_year = EXTRACT(YEAR FROM CURRENT_DATE)`),
      query(`SELECT COALESCE(SUM(amount), 0) as total FROM tax_deductions WHERE tax_year = EXTRACT(YEAR FROM CURRENT_DATE) AND is_r_and_d = true`)
    ]);

    const totalDeductions = parseFloat(deductions.rows[0].total);
    const rdTotal = parseFloat(rdCredits.rows[0].total);

    return {
      upcoming_deadlines: parseInt(upcoming.rows[0].count),
      total_deductions: totalDeductions,
      r_and_d_credits: Math.round(rdTotal * 0.20),
      estimated_liability: Math.round(totalDeductions * 0.25),
      estimated_savings: Math.round(totalDeductions * 0.25)
    };
  }

  async getStateObligations() {
    return [
      { state: 'Indiana', corporate_rate: 4.9, individual_rate: 3.05, sales_tax: 7.0, filing_required: true, nexus: true },
      { state: 'Ohio', corporate_rate: 0, individual_rate: 0, sales_tax: 5.75, filing_required: false, nexus: false, notes: 'No income tax on pass-through, CAT applies at $150K+ revenue' },
      { state: 'Illinois', corporate_rate: 9.5, individual_rate: 4.95, sales_tax: 6.25, filing_required: false, nexus: false },
      { state: 'Michigan', corporate_rate: 6.0, individual_rate: 4.25, sales_tax: 6.0, filing_required: false, nexus: false }
    ];
  }

  async getEntityComparison() {
    return [
      { entity_type: 'LLC (Current)', tax_treatment: 'Pass-through', self_employment_tax: '15.3% on all profit', liability_protection: 'Yes', complexity: 'Low', annual_cost: '$31 biennial', recommended_when: 'Revenue under $60K' },
      { entity_type: 'S-Corporation', tax_treatment: 'Pass-through', self_employment_tax: '15.3% on salary only', liability_protection: 'Yes', complexity: 'Medium', annual_cost: '$1,500-3,000/yr accounting', recommended_when: 'Revenue $60K-$500K' },
      { entity_type: 'C-Corporation', tax_treatment: 'Double taxation (21% + dividends)', self_employment_tax: 'None (salary taxed)', liability_protection: 'Yes', complexity: 'High', annual_cost: '$3,000-5,000/yr accounting', recommended_when: 'VC funding or revenue $500K+' }
    ];
  }
}

// Route-compatible aliases
const instance = new TaxService();
instance.getEvents = instance.getTaxEvents.bind(instance);
instance.createEvent = instance.createTaxEvent.bind(instance);
instance.updateEvent = instance.updateTaxEvent.bind(instance);
instance.getTaxSummary = instance.getSummary.bind(instance);
module.exports = instance;

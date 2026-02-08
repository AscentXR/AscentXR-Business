const { query } = require('../db/connection');

class FinanceService {
  // ========================
  // INVOICES
  // ========================

  async getInvoices({ page = 1, limit = 50, search = '', status = '' } = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT i.*, sd.name as school_district_name
      FROM invoices i
      LEFT JOIN school_districts sd ON i.school_district_id = sd.id
    `;
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(i.invoice_number ILIKE $${paramIndex} OR sd.name ILIKE $${paramIndex} OR i.notes ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (status) {
      conditions.push(`i.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY i.issue_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    // Count
    let countSql = 'SELECT COUNT(*) FROM invoices i LEFT JOIN school_districts sd ON i.school_district_id = sd.id';
    const countParams = [];
    const countConditions = [];
    let cIdx = 1;
    if (search) {
      countConditions.push(`(i.invoice_number ILIKE $${cIdx} OR sd.name ILIKE $${cIdx} OR i.notes ILIKE $${cIdx})`);
      countParams.push(`%${search}%`);
      cIdx++;
    }
    if (status) {
      countConditions.push(`i.status = $${cIdx}`);
      countParams.push(status);
      cIdx++;
    }
    if (countConditions.length > 0) {
      countSql += ` WHERE ${countConditions.join(' AND ')}`;
    }
    const countResult = await query(countSql, countParams);

    return {
      invoices: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getInvoiceById(id) {
    const result = await query(
      `SELECT i.*, sd.name as school_district_name, c.first_name as contact_first_name, c.last_name as contact_last_name, c.email as contact_email
       FROM invoices i
       LEFT JOIN school_districts sd ON i.school_district_id = sd.id
       LEFT JOIN contacts c ON i.contact_id = c.id
       WHERE i.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async generateInvoiceNumber() {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prefix = `INV-${yearMonth}-`;
    const result = await query(
      `SELECT invoice_number FROM invoices
       WHERE invoice_number LIKE $1
       ORDER BY invoice_number DESC LIMIT 1`,
      [`${prefix}%`]
    );
    let nextNum = 1;
    if (result.rows.length > 0) {
      const lastNum = parseInt(result.rows[0].invoice_number.split('-').pop(), 10);
      nextNum = lastNum + 1;
    }
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  }

  async createInvoice(data) {
    const invoiceNumber = data.invoice_number || await this.generateInvoiceNumber();
    const { school_district_id, contact_id, pipeline_id, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, paid_amount, paid_date, payment_method, notes, line_items, created_by } = data;
    const result = await query(
      `INSERT INTO invoices (invoice_number, school_district_id, contact_id, pipeline_id, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total, paid_amount, paid_date, payment_method, notes, line_items, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [invoiceNumber, school_district_id || null, contact_id || null, pipeline_id || null, status || 'draft', issue_date || new Date().toISOString().split('T')[0], due_date, subtotal || 0, tax_rate || 0, tax_amount || 0, total || 0, paid_amount || 0, paid_date || null, payment_method || null, notes || null, JSON.stringify(line_items || []), created_by || null]
    );
    return result.rows[0];
  }

  async updateInvoice(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['invoice_number', 'school_district_id', 'contact_id', 'pipeline_id', 'status', 'issue_date', 'due_date', 'subtotal', 'tax_rate', 'tax_amount', 'total', 'paid_amount', 'paid_date', 'payment_method', 'notes', 'line_items'];
    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(key === 'line_items' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await query(
      `UPDATE invoices SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteInvoice(id) {
    const result = await query('DELETE FROM invoices WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // EXPENSES
  // ========================

  async getExpenses({ page = 1, limit = 50, search = '', category = '' } = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM expenses';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(description ILIKE $${paramIndex} OR vendor ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY expense_date DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    let countSql = 'SELECT COUNT(*) FROM expenses';
    const countParams = [];
    const countConditions = [];
    let cIdx = 1;
    if (search) {
      countConditions.push(`(description ILIKE $${cIdx} OR vendor ILIKE $${cIdx})`);
      countParams.push(`%${search}%`);
      cIdx++;
    }
    if (category) {
      countConditions.push(`category = $${cIdx}`);
      countParams.push(category);
      cIdx++;
    }
    if (countConditions.length > 0) {
      countSql += ` WHERE ${countConditions.join(' AND ')}`;
    }
    const countResult = await query(countSql, countParams);

    return {
      expenses: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getExpenseById(id) {
    const result = await query('SELECT * FROM expenses WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createExpense(data) {
    const { description, amount, category, subcategory, vendor, expense_date, receipt_url, is_tax_deductible, tax_category, payment_method, status, notes, created_by } = data;
    const result = await query(
      `INSERT INTO expenses (description, amount, category, subcategory, vendor, expense_date, receipt_url, is_tax_deductible, tax_category, payment_method, status, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [description, amount, category, subcategory || null, vendor || null, expense_date || new Date().toISOString().split('T')[0], receipt_url || null, is_tax_deductible || false, tax_category || null, payment_method || null, status || 'pending', notes || null, created_by || null]
    );
    return result.rows[0];
  }

  async updateExpense(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['description', 'amount', 'category', 'subcategory', 'vendor', 'expense_date', 'receipt_url', 'is_tax_deductible', 'tax_category', 'payment_method', 'status', 'notes'];
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
      `UPDATE expenses SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteExpense(id) {
    const result = await query('DELETE FROM expenses WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // BUDGETS
  // ========================

  async getBudgets({ period = '' } = {}) {
    let sql = 'SELECT * FROM budgets';
    const params = [];

    if (period) {
      sql += ' WHERE period = $1';
      params.push(period);
    }

    sql += ' ORDER BY period DESC, category ASC';
    const result = await query(sql, params);
    return result.rows;
  }

  async getBudgetById(id) {
    const result = await query('SELECT * FROM budgets WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createBudget(data) {
    const { category, period, allocated, spent, notes } = data;
    const result = await query(
      `INSERT INTO budgets (category, period, allocated, spent, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [category, period, allocated || 0, spent || 0, notes || null]
    );
    return result.rows[0];
  }

  async updateBudget(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['category', 'period', 'allocated', 'spent', 'notes'];
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
      `UPDATE budgets SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteBudget(id) {
    const result = await query('DELETE FROM budgets WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  // ========================
  // SUMMARY & CASH FLOW
  // ========================

  async getSummary({ period = '' } = {}) {
    // Total revenue from paid invoices
    let revenueSql = `SELECT COALESCE(SUM(total), 0) as total_revenue, COUNT(*) as paid_count FROM invoices WHERE status = 'paid'`;
    const revenueParams = [];
    if (period) {
      revenueSql += ` AND to_char(paid_date, 'YYYY') = $1`;
      revenueParams.push(period);
    }

    // Total expenses
    let expenseSql = `SELECT COALESCE(SUM(amount), 0) as total_expenses, COUNT(*) as expense_count FROM expenses`;
    const expenseParams = [];
    if (period) {
      expenseSql += ` WHERE to_char(expense_date, 'YYYY') = $1`;
      expenseParams.push(period);
    }

    // Budget utilization
    let budgetSql = `SELECT COALESCE(SUM(allocated), 0) as total_allocated, COALESCE(SUM(spent), 0) as total_spent FROM budgets`;
    const budgetParams = [];
    if (period) {
      budgetSql += ` WHERE period LIKE $1`;
      budgetParams.push(`%${period}%`);
    }

    // Outstanding invoices
    const outstandingSql = `SELECT COALESCE(SUM(total - paid_amount), 0) as outstanding FROM invoices WHERE status NOT IN ('paid', 'cancelled')`;

    const [revenueResult, expenseResult, budgetResult, outstandingResult] = await Promise.all([
      query(revenueSql, revenueParams),
      query(expenseSql, expenseParams),
      query(budgetSql, budgetParams),
      query(outstandingSql)
    ]);

    const revenue = parseFloat(revenueResult.rows[0].total_revenue);
    const expenses = parseFloat(expenseResult.rows[0].total_expenses);
    const allocated = parseFloat(budgetResult.rows[0].total_allocated);
    const spent = parseFloat(budgetResult.rows[0].total_spent);

    return {
      total_revenue: revenue,
      paid_invoice_count: parseInt(revenueResult.rows[0].paid_count),
      total_expenses: expenses,
      expense_count: parseInt(expenseResult.rows[0].expense_count),
      net_income: revenue - expenses,
      outstanding_amount: parseFloat(outstandingResult.rows[0].outstanding),
      budget_allocated: allocated,
      budget_spent: spent,
      budget_utilization: allocated > 0 ? Math.round((spent / allocated) * 10000) / 100 : 0
    };
  }

  async getCashFlow({ months = 12 } = {}) {
    // Monthly revenue (paid invoices by paid_date)
    const revenueSql = `
      SELECT to_char(paid_date, 'YYYY-MM') as month, COALESCE(SUM(total), 0) as revenue
      FROM invoices
      WHERE status = 'paid' AND paid_date >= (CURRENT_DATE - ($1 || ' months')::interval)
      GROUP BY to_char(paid_date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Monthly expenses by expense_date
    const expenseSql = `
      SELECT to_char(expense_date, 'YYYY-MM') as month, COALESCE(SUM(amount), 0) as expenses
      FROM expenses
      WHERE expense_date >= (CURRENT_DATE - ($1 || ' months')::interval)
      GROUP BY to_char(expense_date, 'YYYY-MM')
      ORDER BY month ASC
    `;

    const [revenueResult, expenseResult] = await Promise.all([
      query(revenueSql, [months]),
      query(expenseSql, [months])
    ]);

    // Build month-by-month cash flow
    const revenueByMonth = {};
    revenueResult.rows.forEach(r => { revenueByMonth[r.month] = parseFloat(r.revenue); });
    const expensesByMonth = {};
    expenseResult.rows.forEach(r => { expensesByMonth[r.month] = parseFloat(r.expenses); });

    const allMonths = new Set([...Object.keys(revenueByMonth), ...Object.keys(expensesByMonth)]);
    const cashFlow = Array.from(allMonths).sort().map(month => {
      const revenue = revenueByMonth[month] || 0;
      const expenses = expensesByMonth[month] || 0;
      return {
        month,
        revenue,
        expenses,
        net: revenue - expenses
      };
    });

    return cashFlow;
  }

  // ========================
  // ENHANCED DASHBOARD METRICS
  // ========================

  async getDashboardMetrics() {
    const [revenue, expenses, outstanding, burnRate] = await Promise.all([
      query(`SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status = 'paid'`),
      query(`SELECT COALESCE(SUM(amount), 0) as total FROM expenses`),
      query(`SELECT COALESCE(SUM(total - paid_amount), 0) as total FROM invoices WHERE status NOT IN ('paid', 'cancelled')`),
      query(`SELECT COALESCE(AVG(monthly_total), 0) as avg_burn FROM (
        SELECT SUM(amount) as monthly_total FROM expenses
        WHERE expense_date >= CURRENT_DATE - INTERVAL '3 months'
        GROUP BY to_char(expense_date, 'YYYY-MM')
      ) m`)
    ]);

    const totalRevenue = parseFloat(revenue.rows[0].total);
    const totalExpenses = parseFloat(expenses.rows[0].total);
    const monthlyBurn = parseFloat(burnRate.rows[0].avg_burn);
    const cashPosition = totalRevenue - totalExpenses;

    return {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_income: totalRevenue - totalExpenses,
      outstanding: parseFloat(outstanding.rows[0].total),
      monthly_burn: monthlyBurn,
      runway_months: monthlyBurn > 0 ? Math.round((cashPosition / monthlyBurn) * 10) / 10 : 999,
      cash_position: cashPosition,
      revenue_target: 300000,
      revenue_progress: Math.round((totalRevenue / 300000) * 10000) / 100
    };
  }

  async getPnL({ period = '' } = {}) {
    let revenueCondition = "status = 'paid'";
    let expenseCondition = '1=1';
    const params = [];

    if (period) {
      revenueCondition += ` AND to_char(paid_date, 'YYYY-MM') = $1`;
      expenseCondition = `to_char(expense_date, 'YYYY-MM') = $1`;
      params.push(period);
    }

    const [revenueResult, expenseResult, expenseBreakdown] = await Promise.all([
      query(`SELECT COALESCE(SUM(total), 0) as revenue FROM invoices WHERE ${revenueCondition}`, params),
      query(`SELECT COALESCE(SUM(amount), 0) as expenses FROM expenses WHERE ${expenseCondition}`, params),
      query(`SELECT category, COALESCE(SUM(amount), 0) as total FROM expenses WHERE ${expenseCondition} GROUP BY category ORDER BY total DESC`, params)
    ]);

    const revenue = parseFloat(revenueResult.rows[0].revenue);
    const expenses = parseFloat(expenseResult.rows[0].expenses);

    return {
      revenue,
      expenses,
      net_income: revenue - expenses,
      margin: revenue > 0 ? Math.round(((revenue - expenses) / revenue) * 10000) / 100 : 0,
      expense_breakdown: expenseBreakdown.rows,
      period: period || 'all-time'
    };
  }

  async getRevenueTarget() {
    const target = 300000;
    const [revenueResult, pipelineResult] = await Promise.all([
      query(`SELECT COALESCE(SUM(total), 0) as current FROM invoices WHERE status = 'paid'`),
      query(`SELECT COALESCE(SUM(opportunity_value * probability / 100), 0) as weighted FROM pipeline`)
    ]);

    const current = parseFloat(revenueResult.rows[0].current);
    const weighted = parseFloat(pipelineResult.rows[0].weighted);

    return {
      target,
      current,
      percentage: Math.round((current / target) * 10000) / 100,
      remaining: target - current,
      weighted_pipeline: weighted,
      projected: current + weighted
    };
  }

  async getBurnRate() {
    const result = await query(
      `SELECT to_char(expense_date, 'YYYY-MM') as month, SUM(amount) as total
       FROM expenses WHERE expense_date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY to_char(expense_date, 'YYYY-MM') ORDER BY month DESC`
    );
    const months = result.rows;
    const avg3 = months.slice(0, 3).reduce((s, m) => s + parseFloat(m.total), 0) / Math.max(months.slice(0, 3).length, 1);
    const avg6 = months.reduce((s, m) => s + parseFloat(m.total), 0) / Math.max(months.length, 1);

    return {
      monthly_data: months,
      avg_3_month: Math.round(avg3),
      avg_6_month: Math.round(avg6),
      trend: months.length >= 2 ? (parseFloat(months[0]?.total || 0) > parseFloat(months[1]?.total || 0) ? 'increasing' : 'decreasing') : 'stable'
    };
  }

  async getRunway() {
    const [cashResult, burnResult] = await Promise.all([
      query(`SELECT (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = 'paid') - (SELECT COALESCE(SUM(amount), 0) FROM expenses) as cash`),
      this.getBurnRate()
    ]);
    const cash = parseFloat(cashResult.rows[0].cash);
    const burn = burnResult.avg_3_month || 1;

    return {
      cash_on_hand: cash,
      monthly_burn: burn,
      months_remaining: burn > 0 ? Math.round((cash / burn) * 10) / 10 : 999
    };
  }
}

const instance = new FinanceService();
instance.getFinancialSummary = instance.getSummary.bind(instance);
module.exports = instance;

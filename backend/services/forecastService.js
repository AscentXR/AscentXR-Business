const { query } = require('../db/connection');

class ForecastService {
  async getForecasts({ business_area = '', forecast_type = '', scenario = '', period = '' } = {}) {
    let sql = 'SELECT * FROM forecasts';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (business_area) {
      conditions.push(`business_area = $${paramIndex}`);
      params.push(business_area);
      paramIndex++;
    }
    if (forecast_type) {
      conditions.push(`forecast_type = $${paramIndex}`);
      params.push(forecast_type);
      paramIndex++;
    }
    if (scenario) {
      conditions.push(`scenario = $${paramIndex}`);
      params.push(scenario);
      paramIndex++;
    }
    if (period) {
      conditions.push(`period = $${paramIndex}`);
      params.push(period);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY period ASC, scenario ASC';
    const result = await query(sql, params);
    return result.rows;
  }

  async getForecastById(id) {
    const result = await query('SELECT * FROM forecasts WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createForecast(data) {
    const { business_area, forecast_type, period, metric, projected_value, actual_value, confidence, scenario, notes } = data;
    const result = await query(
      `INSERT INTO forecasts (business_area, forecast_type, period, metric, projected_value, actual_value, confidence, scenario, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [business_area, forecast_type, period, metric || null, projected_value || null, actual_value || null, confidence || 'medium', scenario || 'baseline', notes || null]
    );
    return result.rows[0];
  }

  async updateForecast(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['business_area', 'forecast_type', 'period', 'metric', 'projected_value', 'actual_value', 'confidence', 'scenario', 'notes'];
    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    const result = await query(
      `UPDATE forecasts SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteForecast(id) {
    const result = await query('DELETE FROM forecasts WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  async getBurnRate() {
    // Calculate monthly burn rate from expenses over last 3 months
    const result = await query(
      `SELECT
        COALESCE(AVG(monthly_total), 0) as avg_monthly_burn,
        COALESCE(MAX(monthly_total), 0) as max_monthly_burn,
        COALESCE(MIN(monthly_total), 0) as min_monthly_burn
       FROM (
         SELECT to_char(expense_date, 'YYYY-MM') as month, SUM(amount) as monthly_total
         FROM expenses
         WHERE expense_date >= CURRENT_DATE - INTERVAL '3 months'
         GROUP BY to_char(expense_date, 'YYYY-MM')
       ) monthly`
    );

    const lastMonthResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as last_month_burn
       FROM expenses
       WHERE to_char(expense_date, 'YYYY-MM') = to_char(CURRENT_DATE - INTERVAL '1 month', 'YYYY-MM')`
    );

    return {
      monthly_burn: parseFloat(result.rows[0].avg_monthly_burn),
      last_month: parseFloat(lastMonthResult.rows[0].last_month_burn),
      max_monthly: parseFloat(result.rows[0].max_monthly_burn),
      min_monthly: parseFloat(result.rows[0].min_monthly_burn)
    };
  }

  async getRunway() {
    // Cash on hand from paid invoices minus expenses
    const cashResult = await query(
      `SELECT
        (SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = 'paid') -
        (SELECT COALESCE(SUM(amount), 0) FROM expenses) as cash_position`
    );

    const burnRate = await this.getBurnRate();
    const cashOnHand = parseFloat(cashResult.rows[0].cash_position);
    const monthlyBurn = burnRate.monthly_burn || 1;

    return {
      cash_on_hand: cashOnHand,
      monthly_burn: monthlyBurn,
      months_remaining: monthlyBurn > 0 ? Math.round((cashOnHand / monthlyBurn) * 10) / 10 : 999
    };
  }

  async getRevenueTarget() {
    const target = 300000;
    const revenueResult = await query(
      `SELECT COALESCE(SUM(total), 0) as current_revenue FROM invoices WHERE status = 'paid'`
    );
    const pipelineResult = await query(
      `SELECT COALESCE(SUM(opportunity_value * probability / 100), 0) as weighted_pipeline FROM pipeline`
    );

    const current = parseFloat(revenueResult.rows[0].current_revenue);
    const pipeline = parseFloat(pipelineResult.rows[0].weighted_pipeline);

    return {
      target,
      current,
      percentage: Math.round((current / target) * 10000) / 100,
      remaining: target - current,
      weighted_pipeline: pipeline,
      projected: current + pipeline
    };
  }
}

module.exports = new ForecastService();

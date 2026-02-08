const { query } = require('../db/connection');

class BusinessActivityService {
  async getActivities({ business_area = '', status = '', priority = '', page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM business_activities';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (business_area) {
      conditions.push(`business_area = $${paramIndex}`);
      params.push(business_area);
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

    sql += ` ORDER BY CASE priority WHEN 'asap' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END ASC, due_date ASC NULLS LAST LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    let countSql = 'SELECT COUNT(*) FROM business_activities';
    const countParams = [];
    const countConditions = [];
    let cIdx = 1;
    if (business_area) { countConditions.push(`business_area = $${cIdx}`); countParams.push(business_area); cIdx++; }
    if (status) { countConditions.push(`status = $${cIdx}`); countParams.push(status); cIdx++; }
    if (priority) { countConditions.push(`priority = $${cIdx}`); countParams.push(priority); cIdx++; }
    if (countConditions.length > 0) { countSql += ` WHERE ${countConditions.join(' AND ')}`; }
    const countResult = await query(countSql, countParams);

    return {
      activities: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getActivityById(id) {
    const result = await query('SELECT * FROM business_activities WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createActivity(data) {
    const { business_area, title, description, priority, status, due_date, assigned_to, recurrence } = data;
    const result = await query(
      `INSERT INTO business_activities (business_area, title, description, priority, status, due_date, assigned_to, recurrence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [business_area, title, description || null, priority || 'medium', status || 'pending', due_date || null, assigned_to || null, recurrence || null]
    );
    return result.rows[0];
  }

  async updateActivity(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['business_area', 'title', 'description', 'priority', 'status', 'due_date', 'assigned_to', 'recurrence', 'completed_at'];
    for (const [key, value] of Object.entries(data)) {
      if (allowed.includes(key)) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    // Auto-set completed_at when status changes to completed
    if (data.status === 'completed' && !data.completed_at) {
      fields.push(`completed_at = CURRENT_TIMESTAMP`);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    const result = await query(
      `UPDATE business_activities SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteActivity(id) {
    const result = await query('DELETE FROM business_activities WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  async getOverdue() {
    const result = await query(
      `SELECT * FROM business_activities
       WHERE due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled')
       ORDER BY CASE priority WHEN 'asap' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END ASC, due_date ASC`
    );
    return result.rows;
  }

  async getUpcoming({ days = 30 } = {}) {
    const result = await query(
      `SELECT * FROM business_activities
       WHERE due_date >= CURRENT_DATE AND due_date <= CURRENT_DATE + ($1 || ' days')::interval AND status NOT IN ('completed', 'cancelled')
       ORDER BY due_date ASC, CASE priority WHEN 'asap' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END ASC`,
      [days]
    );
    return result.rows;
  }
}

module.exports = new BusinessActivityService();

const { query } = require('../db/connection');

class TeamService {
  async getTeamMembers({ type = '', department = '', status = '' } = {}) {
    let sql = `
      SELECT tm.*, a.status as agent_status, a.progress as agent_progress, a.current_task as agent_current_task
      FROM team_members tm
      LEFT JOIN agents a ON tm.agent_id = a.id
    `;
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (type) {
      conditions.push(`tm.type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }
    if (department) {
      conditions.push(`tm.department = $${paramIndex}`);
      params.push(department);
      paramIndex++;
    }
    if (status) {
      conditions.push(`tm.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY tm.type ASC, tm.name ASC';
    const result = await query(sql, params);
    return result.rows;
  }

  async getTeamMemberById(id) {
    const result = await query(
      `SELECT tm.*, a.status as agent_status, a.progress as agent_progress, a.current_task as agent_current_task, a.tasks_completed as agent_tasks_completed, a.capabilities as agent_capabilities
       FROM team_members tm
       LEFT JOIN agents a ON tm.agent_id = a.id
       WHERE tm.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createTeamMember(data) {
    const { name, type, role, email, phone, department, bio, avatar_url, agent_id, responsibilities, status, hire_date } = data;
    const result = await query(
      `INSERT INTO team_members (name, type, role, email, phone, department, bio, avatar_url, agent_id, responsibilities, status, hire_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [name, type, role, email || null, phone || null, department || null, bio || null, avatar_url || null, agent_id || null, responsibilities || [], status || 'active', hire_date || null]
    );
    return result.rows[0];
  }

  async updateTeamMember(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['name', 'type', 'role', 'email', 'phone', 'department', 'bio', 'avatar_url', 'agent_id', 'responsibilities', 'status', 'hire_date'];
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
      `UPDATE team_members SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  async deleteTeamMember(id) {
    const result = await query('DELETE FROM team_members WHERE id = $1 RETURNING id', [id]);
    return result.rows[0] || null;
  }

  async getSummary() {
    const result = await query(`
      SELECT
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE type = 'human') as humans,
        COUNT(*) FILTER (WHERE type = 'ai_agent') as ai_agents,
        COUNT(*) FILTER (WHERE status = 'active') as active_members,
        COUNT(DISTINCT department) FILTER (WHERE department IS NOT NULL) as departments
      FROM team_members
    `);
    return result.rows[0];
  }
}

// Route-compatible aliases
const instance = new TeamService();
instance.getMembers = instance.getTeamMembers.bind(instance);
instance.getMemberById = instance.getTeamMemberById.bind(instance);
instance.createMember = instance.createTeamMember.bind(instance);
instance.updateMember = instance.updateTeamMember.bind(instance);
module.exports = instance;

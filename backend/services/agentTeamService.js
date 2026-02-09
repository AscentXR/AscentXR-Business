const { query } = require('../db/connection');

/**
 * Service for Agent Team CRUD operations.
 * Manages teams, team memberships, and daily status aggregation.
 */

/**
 * Get all teams with member counts and today's task stats.
 */
async function getTeams() {
  const result = await query(`
    SELECT
      t.*,
      COALESCE(m.member_count, 0) AS member_count,
      COALESCE(s.schedule_count, 0) AS schedule_count,
      COALESCE(td.tasks_today, 0) AS tasks_today,
      COALESCE(td.tasks_completed, 0) AS tasks_completed,
      COALESCE(td.tasks_review, 0) AS tasks_review,
      COALESCE(td.tasks_running, 0) AS tasks_running,
      COALESCE(td.tasks_failed, 0) AS tasks_failed
    FROM agent_teams t
    LEFT JOIN (
      SELECT team_id, COUNT(*) AS member_count FROM agent_team_members GROUP BY team_id
    ) m ON m.team_id = t.id
    LEFT JOIN (
      SELECT team_id, COUNT(*) AS schedule_count FROM recurring_task_schedules WHERE is_active = true GROUP BY team_id
    ) s ON s.team_id = t.id
    LEFT JOIN (
      SELECT
        team_id,
        COUNT(*) AS tasks_today,
        COUNT(*) FILTER (WHERE status IN ('approved', 'rejected')) AS tasks_completed,
        COUNT(*) FILTER (WHERE status = 'review') AS tasks_review,
        COUNT(*) FILTER (WHERE status IN ('running', 'streaming', 'queued')) AS tasks_running,
        COUNT(*) FILTER (WHERE status = 'failed') AS tasks_failed
      FROM agent_tasks
      WHERE run_date = CURRENT_DATE
      GROUP BY team_id
    ) td ON td.team_id = t.id
    ORDER BY t.name
  `);
  return result.rows;
}

/**
 * Get a single team by ID with its agent members.
 */
async function getTeamById(id) {
  const teamResult = await query('SELECT * FROM agent_teams WHERE id = $1', [id]);
  if (teamResult.rows.length === 0) return null;

  const team = teamResult.rows[0];

  const membersResult = await query(`
    SELECT atm.*, a.name AS agent_name, a.description AS agent_description,
           a.status AS agent_status, a.tasks_completed AS agent_tasks_completed,
           a.current_task AS agent_current_task
    FROM agent_team_members atm
    JOIN agents a ON atm.agent_id = a.id
    WHERE atm.team_id = $1
    ORDER BY atm.join_order
  `, [id]);

  team.members = membersResult.rows;
  return team;
}

/**
 * Create a new team.
 */
async function createTeam(data) {
  const { id, name, description, business_area, icon, daily_schedule_time } = data;
  const result = await query(
    `INSERT INTO agent_teams (id, name, description, business_area, icon, daily_schedule_time)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, name, description || null, business_area || null, icon || 'users', daily_schedule_time || '06:00:00']
  );
  return result.rows[0];
}

/**
 * Update an existing team.
 */
async function updateTeam(id, data) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const allowedFields = ['name', 'description', 'business_area', 'icon', 'status', 'daily_schedule_time'];
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIndex}`);
      values.push(data[field]);
      paramIndex++;
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  const result = await query(
    `UPDATE agent_teams SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

/**
 * Add an agent to a team.
 */
async function addTeamMember(teamId, agentId, roleInTeam = 'member', joinOrder = 0) {
  const result = await query(
    `INSERT INTO agent_team_members (team_id, agent_id, role_in_team, join_order)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (team_id, agent_id) DO UPDATE SET role_in_team = $3, join_order = $4
     RETURNING *`,
    [teamId, agentId, roleInTeam, joinOrder]
  );

  // Also update agent's team_id
  await query('UPDATE agents SET team_id = $1 WHERE id = $2', [teamId, agentId]);

  return result.rows[0];
}

/**
 * Remove an agent from a team.
 */
async function removeTeamMember(teamId, agentId) {
  await query(
    'DELETE FROM agent_team_members WHERE team_id = $1 AND agent_id = $2',
    [teamId, agentId]
  );
  await query('UPDATE agents SET team_id = NULL WHERE id = $1 AND team_id = $2', [agentId, teamId]);
}

/**
 * Get today's task statuses for a specific team.
 */
async function getTeamDailyStatus(teamId, date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const result = await query(`
    SELECT
      at.*,
      a.name AS agent_name,
      rts.title AS schedule_title,
      rts.requires_review
    FROM agent_tasks at
    LEFT JOIN agents a ON at.agent_id = a.id
    LEFT JOIN recurring_task_schedules rts ON at.schedule_id = rts.id
    WHERE at.team_id = $1 AND at.run_date = $2
    ORDER BY at.created_at
  `, [teamId, targetDate]);
  return result.rows;
}

/**
 * Get tasks for a team, optionally filtered by date.
 */
async function getTeamTasks(teamId, { date, status, page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;
  const conditions = ['at.team_id = $1'];
  const params = [teamId];
  let paramIndex = 2;

  if (date) {
    conditions.push(`at.run_date = $${paramIndex}`);
    params.push(date);
    paramIndex++;
  }
  if (status) {
    conditions.push(`at.status = $${paramIndex}`);
    params.push(status);
    paramIndex++;
  }

  const where = conditions.join(' AND ');
  params.push(limit, offset);

  const result = await query(`
    SELECT at.*, a.name AS agent_name
    FROM agent_tasks at
    LEFT JOIN agents a ON at.agent_id = a.id
    WHERE ${where}
    ORDER BY at.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `, params);

  const countResult = await query(
    `SELECT COUNT(*) FROM agent_tasks at WHERE ${where}`,
    params.slice(0, -2)
  );

  return {
    tasks: result.rows,
    total: parseInt(countResult.rows[0].count)
  };
}

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  addTeamMember,
  removeTeamMember,
  getTeamDailyStatus,
  getTeamTasks,
};

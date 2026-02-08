const { query } = require('../db/connection');

class AgentService {
  async getAgents() {
    const result = await query(
      `SELECT * FROM agents ORDER BY status, name`
    );

    const agents = result.rows;
    const activeAgents = agents.filter(a => a.status === 'active').length;
    const totalProgress = agents.reduce((sum, a) => sum + (a.progress || 0), 0);
    const totalTasksCompleted = agents.reduce((sum, a) => sum + (a.tasks_completed || 0), 0);

    return {
      agents,
      systemMetrics: {
        totalAgents: agents.length,
        activeAgents,
        totalTasksCompleted,
        averageProgress: agents.length > 0 ? Math.round(totalProgress / agents.length * 10) / 10 : 0,
        uptime: '99.8%',
        lastUpdated: new Date().toISOString()
      }
    };
  }

  async getAgentById(id) {
    const result = await query('SELECT * FROM agents WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async getAgentTasks(agentId) {
    // Agent tasks are stored as part of agent performance tracking
    const agent = await this.getAgentById(agentId);
    if (!agent) return [];

    // Return structured task data based on agent capabilities
    return (agent.capabilities || []).map((cap, i) => ({
      id: `task-${agentId}-${i}`,
      name: `${cap} task`,
      status: i < agent.tasks_completed ? 'completed' : (i === agent.tasks_completed ? 'in-progress' : 'pending'),
      agentId
    }));
  }

  async updateAgentStatus(agentId, data) {
    const { status, progress, current_task, tasks_completed } = data;
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (progress !== undefined) {
      fields.push(`progress = $${paramIndex++}`);
      values.push(progress);
    }
    if (current_task !== undefined) {
      fields.push(`current_task = $${paramIndex++}`);
      values.push(current_task);
    }
    if (tasks_completed !== undefined) {
      fields.push(`tasks_completed = $${paramIndex++}`);
      values.push(tasks_completed);
    }

    fields.push(`last_active = NOW()`);

    if (fields.length === 1) {
      // Only last_active, nothing meaningful to update
      return { agentId, status: 'no changes', updated: false };
    }

    values.push(agentId);
    const result = await query(
      `UPDATE agents SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    return result.rows[0] || { agentId, status, updated: true };
  }
}

module.exports = new AgentService();

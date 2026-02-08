const { query } = require('../db/connection');

class GoalService {
  async getGoals({ quarter = '', business_area = '', goal_type = '' } = {}) {
    let sql = 'SELECT * FROM goals';
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (quarter) {
      conditions.push(`quarter = $${paramIndex}`);
      params.push(quarter);
      paramIndex++;
    }
    if (business_area) {
      conditions.push(`business_area = $${paramIndex}`);
      params.push(business_area);
      paramIndex++;
    }
    if (goal_type) {
      conditions.push(`goal_type = $${paramIndex}`);
      params.push(goal_type);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ' ORDER BY goal_type ASC, created_at ASC';
    const result = await query(sql, params);
    return result.rows;
  }

  async getGoalById(id) {
    const result = await query('SELECT * FROM goals WHERE id = $1', [id]);
    if (!result.rows[0]) return null;

    // Also fetch children if this is an objective
    const goal = result.rows[0];
    if (goal.goal_type === 'objective') {
      const children = await query(
        'SELECT * FROM goals WHERE parent_id = $1 ORDER BY created_at ASC',
        [id]
      );
      goal.key_results = children.rows;
    }

    return goal;
  }

  async createGoal(data) {
    const { parent_id, title, description, goal_type, business_area, quarter, target_value, current_value, unit, progress, status, owner, due_date } = data;
    const result = await query(
      `INSERT INTO goals (parent_id, title, description, goal_type, business_area, quarter, target_value, current_value, unit, progress, status, owner, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [parent_id || null, title, description || null, goal_type, business_area || null, quarter || null, target_value || null, current_value || 0, unit || null, progress || 0, status || 'on_track', owner || null, due_date || null]
    );
    return result.rows[0];
  }

  async updateGoal(id, data) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const allowed = ['parent_id', 'title', 'description', 'goal_type', 'business_area', 'quarter', 'target_value', 'current_value', 'unit', 'progress', 'status', 'owner', 'due_date'];
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
      `UPDATE goals SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    // After updating a key_result, recalculate parent objective progress
    const updated = result.rows[0];
    if (updated && updated.parent_id) {
      await this.rollupProgress(updated.parent_id);
    }

    return updated || null;
  }

  async deleteGoal(id) {
    const result = await query('DELETE FROM goals WHERE id = $1 RETURNING id, parent_id', [id]);
    const deleted = result.rows[0];

    // Recalculate parent progress if this was a child
    if (deleted && deleted.parent_id) {
      await this.rollupProgress(deleted.parent_id);
    }

    return deleted || null;
  }

  /**
   * Build OKR tree for a given quarter.
   * Objectives at the top level, each containing key_results as children.
   * Objective progress = average of children's progress.
   */
  async getTree({ quarter = '' } = {}) {
    let sql = 'SELECT * FROM goals';
    const params = [];

    if (quarter) {
      sql += ' WHERE quarter = $1';
      params.push(quarter);
    }

    sql += ' ORDER BY created_at ASC';
    const result = await query(sql, params);
    const allGoals = result.rows;

    // Separate objectives and key results
    const objectives = allGoals.filter(g => g.goal_type === 'objective');
    const keyResults = allGoals.filter(g => g.goal_type === 'key_result');

    // Build parent-child map
    const childMap = {};
    for (const kr of keyResults) {
      if (!kr.parent_id) continue;
      if (!childMap[kr.parent_id]) {
        childMap[kr.parent_id] = [];
      }
      childMap[kr.parent_id].push(kr);
    }

    // Assemble tree with progress rollup
    const tree = objectives.map(obj => {
      const children = childMap[obj.id] || [];
      const calculatedProgress = children.length > 0
        ? Math.round(children.reduce((sum, kr) => sum + (kr.progress || 0), 0) / children.length)
        : obj.progress || 0;

      return {
        ...obj,
        key_results: children,
        calculated_progress: calculatedProgress,
        key_result_count: children.length
      };
    });

    // Group by business_area for convenience
    const byArea = {};
    for (const obj of tree) {
      const area = obj.business_area || 'general';
      if (!byArea[area]) byArea[area] = [];
      byArea[area].push(obj);
    }

    return {
      tree,
      by_area: byArea,
      summary: {
        total_objectives: objectives.length,
        total_key_results: keyResults.length,
        avg_progress: objectives.length > 0
          ? Math.round(tree.reduce((s, o) => s + o.calculated_progress, 0) / tree.length)
          : 0
      }
    };
  }

  /**
   * Recalculate an objective's progress as the average of its children's progress.
   */
  async rollupProgress(objectiveId) {
    const children = await query(
      'SELECT progress FROM goals WHERE parent_id = $1',
      [objectiveId]
    );

    if (children.rows.length === 0) return;

    const avgProgress = Math.round(
      children.rows.reduce((sum, kr) => sum + (kr.progress || 0), 0) / children.rows.length
    );

    await query(
      'UPDATE goals SET progress = $1 WHERE id = $2',
      [avgProgress, objectiveId]
    );
  }
}

// Route-compatible aliases
const instance = new GoalService();
instance.getGoalTree = instance.getTree.bind(instance);
module.exports = instance;

const { query } = require('../db/connection');

class SkillCalendarService {
  // ========================
  // PLAN CRUD
  // ========================

  async getPlans({ business_area = '', status = '' } = {}) {
    let sql = `SELECT ep.*,
      (SELECT COUNT(*) FROM skill_calendar_entries WHERE plan_id = ep.id) as total_entries,
      (SELECT COUNT(*) FROM skill_calendar_entries WHERE plan_id = ep.id AND status = 'completed') as completed_entries,
      (SELECT COUNT(*) FROM skill_calendar_entries WHERE plan_id = ep.id AND status = 'running') as running_entries
      FROM execution_plans ep`;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (business_area) {
      conditions.push(`ep.business_area = $${idx}`);
      params.push(business_area);
      idx++;
    }
    if (status) {
      conditions.push(`ep.status = $${idx}`);
      params.push(status);
      idx++;
    }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY ep.created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  async getPlanById(id) {
    const result = await query(
      `SELECT ep.*,
        (SELECT COUNT(*) FROM skill_calendar_entries WHERE plan_id = ep.id) as total_entries,
        (SELECT COUNT(*) FROM skill_calendar_entries WHERE plan_id = ep.id AND status = 'completed') as completed_entries,
        (SELECT COUNT(*) FROM skill_calendar_entries WHERE plan_id = ep.id AND status = 'running') as running_entries
       FROM execution_plans ep WHERE ep.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async getPlanBySlug(slug) {
    const result = await query(
      `SELECT ep.*,
        (SELECT COUNT(*) FROM skill_calendar_entries WHERE plan_id = ep.id) as total_entries,
        (SELECT COUNT(*) FROM skill_calendar_entries WHERE plan_id = ep.id AND status = 'completed') as completed_entries,
        (SELECT COUNT(*) FROM skill_calendar_entries WHERE plan_id = ep.id AND status = 'running') as running_entries
       FROM execution_plans ep WHERE ep.slug = $1`,
      [slug]
    );
    return result.rows[0] || null;
  }

  async createPlan(data) {
    const { name, slug, description, business_area, team_id, status, start_date, end_date, revenue_target, context, created_by } = data;
    const result = await query(
      `INSERT INTO execution_plans (name, slug, description, business_area, team_id, status, start_date, end_date, revenue_target, context, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [name, slug, description || null, business_area, team_id || null, status || 'draft', start_date || null, end_date || null, revenue_target || null, JSON.stringify(context || {}), created_by || 'system']
    );
    return result.rows[0];
  }

  async updatePlan(id, data) {
    const fields = [];
    const params = [];
    let idx = 1;

    for (const key of ['name', 'slug', 'description', 'status', 'start_date', 'end_date', 'revenue_target']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        params.push(data[key]);
        idx++;
      }
    }
    if (data.context !== undefined) {
      fields.push(`context = $${idx}`);
      params.push(JSON.stringify(data.context));
      idx++;
    }

    if (fields.length === 0) return this.getPlanById(id);

    params.push(id);
    const result = await query(
      `UPDATE execution_plans SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return result.rows[0] || null;
  }

  async deletePlan(id) {
    const result = await query(
      `UPDATE execution_plans SET status = 'archived' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  // ========================
  // CALENDAR ENTRY CRUD
  // ========================

  async getCalendarEntries({ plan_id, status = '', start_date = '', end_date = '', phase = '' } = {}) {
    let sql = `SELECT sce.*,
      COALESCE(ms.name, ss.name) as skill_name,
      COALESCE(ms.skill_id, ss.skill_id) as skill_slug,
      COALESCE(ms.category, ss.category) as skill_category,
      COALESCE(ms.estimated_duration_minutes, ss.estimated_duration_minutes) as skill_duration_minutes,
      COALESCE(ms.description, ss.description) as skill_description,
      a.name as assigned_agent_name
    FROM skill_calendar_entries sce
    LEFT JOIN marketing_skills ms ON sce.marketing_skill_id = ms.id
    LEFT JOIN sales_skills ss ON sce.sales_skill_id = ss.id
    LEFT JOIN agents a ON sce.assigned_agent_id = a.id`;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (plan_id) {
      conditions.push(`sce.plan_id = $${idx}`);
      params.push(plan_id);
      idx++;
    }
    if (status) {
      conditions.push(`sce.status = $${idx}`);
      params.push(status);
      idx++;
    }
    if (start_date) {
      conditions.push(`sce.scheduled_date >= $${idx}`);
      params.push(start_date);
      idx++;
    }
    if (end_date) {
      conditions.push(`sce.scheduled_date <= $${idx}`);
      params.push(end_date);
      idx++;
    }
    if (phase) {
      conditions.push(`sce.phase = $${idx}`);
      params.push(phase);
      idx++;
    }

    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY sce.scheduled_date ASC, sce.day_order ASC';

    const result = await query(sql, params);
    return result.rows;
  }

  async getCalendarEntriesByDate(planId, date) {
    return this.getCalendarEntries({ plan_id: planId, start_date: date, end_date: date });
  }

  async getCalendarEntry(id) {
    const result = await query(
      `SELECT sce.*,
        COALESCE(ms.name, ss.name) as skill_name,
        COALESCE(ms.skill_id, ss.skill_id) as skill_slug,
        COALESCE(ms.category, ss.category) as skill_category,
        COALESCE(ms.estimated_duration_minutes, ss.estimated_duration_minutes) as skill_duration_minutes,
        COALESCE(ms.description, ss.description) as skill_description,
        COALESCE(ms.content, ss.content) as skill_content,
        COALESCE(ms.applicable_agents, ss.applicable_agents) as skill_agents,
        a.name as assigned_agent_name
      FROM skill_calendar_entries sce
      LEFT JOIN marketing_skills ms ON sce.marketing_skill_id = ms.id
      LEFT JOIN sales_skills ss ON sce.sales_skill_id = ss.id
      LEFT JOIN agents a ON sce.assigned_agent_id = a.id
      WHERE sce.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createCalendarEntry(data) {
    const { plan_id, marketing_skill_id, sales_skill_id, scheduled_date, scheduled_time, priority, day_order, assigned_agent_id, assigned_team_id, title_override, notes, week_label, phase } = data;
    const result = await query(
      `INSERT INTO skill_calendar_entries (plan_id, marketing_skill_id, sales_skill_id, scheduled_date, scheduled_time, priority, day_order, assigned_agent_id, assigned_team_id, title_override, notes, week_label, phase)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [plan_id, marketing_skill_id || null, sales_skill_id || null, scheduled_date, scheduled_time || '09:00:00', priority || 3, day_order || 1, assigned_agent_id || null, assigned_team_id || null, title_override || null, notes || null, week_label || null, phase || null]
    );
    return result.rows[0];
  }

  async updateCalendarEntry(id, data) {
    const fields = [];
    const params = [];
    let idx = 1;

    for (const key of ['scheduled_date', 'scheduled_time', 'priority', 'day_order', 'assigned_agent_id', 'assigned_team_id', 'status', 'title_override', 'notes', 'week_label', 'phase', 'result_summary']) {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${idx}`);
        params.push(data[key]);
        idx++;
      }
    }

    if (fields.length === 0) return this.getCalendarEntry(id);

    params.push(id);
    const result = await query(
      `UPDATE skill_calendar_entries SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return result.rows[0] || null;
  }

  async deleteCalendarEntry(id) {
    const result = await query(
      `DELETE FROM skill_calendar_entries WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  }

  async bulkCreateEntries(entries) {
    const results = [];
    for (const entry of entries) {
      results.push(await this.createCalendarEntry(entry));
    }
    return results;
  }

  // ========================
  // EXECUTION
  // ========================

  async executeCalendarEntry(entryId) {
    const entry = await this.getCalendarEntry(entryId);
    if (!entry) throw new Error('Calendar entry not found');
    if (entry.status === 'running') throw new Error('Entry is already running');
    if (entry.status === 'completed') throw new Error('Entry is already completed');

    // Determine which skill service to use
    const isMarketing = !!entry.marketing_skill_id;
    const skillsService = isMarketing
      ? require('./marketingSkillsService')
      : require('./salesSkillsService');

    // Load the full skill
    const skill = isMarketing
      ? await skillsService.getSkillById(entry.marketing_skill_id)
      : await skillsService.getSkillById(entry.sales_skill_id);

    if (!skill) throw new Error('Linked skill not found');

    // Build prompt
    const prompt = skillsService.buildSkillPrompt(skill, {
      additional_instructions: entry.notes || undefined
    });

    // Determine agent
    const agentId = entry.assigned_agent_id || skill.applicable_agents?.[0] || (isMarketing ? 'content-creator' : 'sdr-agent');

    // Mark as running
    await query(
      `UPDATE skill_calendar_entries SET status = 'running', started_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [entryId]
    );

    // Execute via agentExecutionService
    const agentExecutionService = require('./agentExecutionService');
    const task = await agentExecutionService.executeTaskAsync({
      agent_id: agentId,
      title: `[Plan] ${entry.title_override || entry.skill_name}`,
      prompt: prompt,
      business_area: isMarketing ? 'marketing' : 'sales',
      context: {
        calendar_entry_id: entryId,
        plan_id: entry.plan_id,
        skill_id: isMarketing ? entry.marketing_skill_id : entry.sales_skill_id,
        skill_slug: entry.skill_slug,
        phase: entry.phase
      }
    });

    // Link task to entry
    await query(
      `UPDATE skill_calendar_entries SET task_id = $1 WHERE id = $2`,
      [task.id, entryId]
    );

    return { entry_id: entryId, task_id: task.id, skill: entry.skill_name, agent_id: agentId, status: 'running' };
  }

  // ========================
  // LIFECYCLE
  // ========================

  async completeCalendarEntry(entryId, { resultSummary, taskId } = {}) {
    const fields = [`status = 'completed'`, `completed_at = CURRENT_TIMESTAMP`];
    const params = [];
    let idx = 1;

    if (resultSummary) {
      fields.push(`result_summary = $${idx}`);
      params.push(typeof resultSummary === 'string' ? resultSummary : JSON.stringify(resultSummary));
      idx++;
    }
    if (taskId) {
      fields.push(`task_id = $${idx}`);
      params.push(taskId);
      idx++;
    }

    params.push(entryId);
    const result = await query(
      `UPDATE skill_calendar_entries SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    return result.rows[0] || null;
  }

  async failCalendarEntry(entryId, error) {
    const result = await query(
      `UPDATE skill_calendar_entries SET status = 'failed', result_summary = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [error || 'Execution failed', entryId]
    );
    return result.rows[0] || null;
  }

  async skipCalendarEntry(entryId) {
    const result = await query(
      `UPDATE skill_calendar_entries SET status = 'skipped', completed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [entryId]
    );
    return result.rows[0] || null;
  }

  // ========================
  // STATS
  // ========================

  async getPlanStats(planId) {
    const result = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
        COUNT(*) FILTER (WHERE status = 'running') as running,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COUNT(*) FILTER (WHERE status = 'skipped') as skipped,
        COUNT(DISTINCT phase) as total_phases,
        MIN(scheduled_date) as earliest_date,
        MAX(scheduled_date) as latest_date
      FROM skill_calendar_entries WHERE plan_id = $1`,
      [planId]
    );
    const stats = result.rows[0];

    // Phase breakdown
    const phaseResult = await query(
      `SELECT phase,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'running') as running
      FROM skill_calendar_entries WHERE plan_id = $1 AND phase IS NOT NULL
      GROUP BY phase ORDER BY MIN(scheduled_date)`,
      [planId]
    );

    return {
      ...stats,
      total: parseInt(stats.total),
      pending: parseInt(stats.pending),
      scheduled: parseInt(stats.scheduled),
      running: parseInt(stats.running),
      completed: parseInt(stats.completed),
      failed: parseInt(stats.failed),
      skipped: parseInt(stats.skipped),
      total_phases: parseInt(stats.total_phases),
      progress: stats.total > 0 ? Math.round((parseInt(stats.completed) / parseInt(stats.total)) * 100) : 0,
      phases: phaseResult.rows.map(p => ({
        ...p,
        total: parseInt(p.total),
        completed: parseInt(p.completed),
        running: parseInt(p.running)
      }))
    };
  }

  async getUpcomingEntries(days = 7) {
    const result = await query(
      `SELECT sce.*,
        COALESCE(ms.name, ss.name) as skill_name,
        COALESCE(ms.skill_id, ss.skill_id) as skill_slug,
        COALESCE(ms.category, ss.category) as skill_category,
        COALESCE(ms.estimated_duration_minutes, ss.estimated_duration_minutes) as skill_duration_minutes,
        ep.name as plan_name, ep.business_area,
        a.name as assigned_agent_name
      FROM skill_calendar_entries sce
      JOIN execution_plans ep ON sce.plan_id = ep.id
      LEFT JOIN marketing_skills ms ON sce.marketing_skill_id = ms.id
      LEFT JOIN sales_skills ss ON sce.sales_skill_id = ss.id
      LEFT JOIN agents a ON sce.assigned_agent_id = a.id
      WHERE sce.scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + $1::integer
        AND sce.status IN ('pending', 'scheduled')
        AND ep.status = 'active'
      ORDER BY sce.scheduled_date ASC, sce.day_order ASC`,
      [days]
    );
    return result.rows;
  }

  // ========================
  // PLAN GENERATION
  // ========================

  async generatePlanFromTemplate(data) {
    const { name, slug, description, business_area, team_id, start_date, end_date, revenue_target, created_by } = data;

    // Create the plan
    const plan = await this.createPlan({
      name, slug, description, business_area, team_id,
      status: 'draft', start_date, end_date, revenue_target, created_by
    });

    return plan;
  }
}

module.exports = new SkillCalendarService();

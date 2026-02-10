const { query } = require('../db/connection');
const agentExecutionService = require('./agentExecutionService');

/**
 * Task Scheduler Service - Core of the self-running agent system.
 * Generates daily tasks from recurring schedules and manages execution.
 */

/**
 * Main cron entry point: generate all tasks for a given date.
 * 1. Query active schedules matching today's schedule type
 * 2. Skip already-generated tasks (idempotent via daily_task_runs UNIQUE)
 * 3. Build dynamic context from context_template
 * 4. Create task via agentExecutionService
 * 5. Record daily_task_run
 * 6. Auto-execute if configured
 */
async function generateDailyTasks(date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const jsDate = new Date(targetDate + 'T00:00:00');
  const dayOfWeek = jsDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const dayOfMonth = jsDate.getDate();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

  console.log(`[SCHEDULER] Generating daily tasks for ${targetDate} (day=${dayOfWeek}, dom=${dayOfMonth}, weekday=${isWeekday})`);

  // Get all active schedules
  const schedulesResult = await query(`
    SELECT rts.*, at.name AS team_name
    FROM recurring_task_schedules rts
    JOIN agent_teams at ON rts.team_id = at.id
    WHERE rts.is_active = true AND at.status = 'active'
    ORDER BY rts.schedule_time, rts.priority
  `);

  const schedules = schedulesResult.rows;
  const results = { generated: 0, skipped: 0, errors: 0, tasks: [] };

  for (const schedule of schedules) {
    try {
      // Check if this schedule should run today
      if (!shouldRunToday(schedule, dayOfWeek, dayOfMonth, isWeekday)) {
        continue;
      }

      // Check idempotency - skip if already generated for this date
      const existingRun = await query(
        'SELECT id FROM daily_task_runs WHERE schedule_id = $1 AND run_date = $2',
        [schedule.id, targetDate]
      );

      if (existingRun.rows.length > 0) {
        results.skipped++;
        continue;
      }

      // Build dynamic context
      const context = await buildDynamicContext(schedule);

      // Create the task via existing execution service
      const task = await agentExecutionService.createTask({
        agent_id: schedule.agent_id,
        title: schedule.title,
        description: schedule.description,
        business_area: schedule.business_area,
        priority: schedule.priority,
        prompt: schedule.prompt,
        context,
        result_type: 'text',
        created_by: 'scheduler',
      });

      // Add schedule/team references to the task
      await query(
        'UPDATE agent_tasks SET schedule_id = $1, team_id = $2, run_date = $3 WHERE id = $4',
        [schedule.id, schedule.team_id, targetDate, task.id]
      );

      // Record the daily run
      await query(
        `INSERT INTO daily_task_runs (run_date, schedule_id, task_id, agent_id, team_id, status)
         VALUES ($1, $2, $3, $4, $5, 'generated')`,
        [targetDate, schedule.id, task.id, schedule.agent_id, schedule.team_id]
      );

      // Update last_generated_at
      await query(
        'UPDATE recurring_task_schedules SET last_generated_at = NOW() WHERE id = $1',
        [schedule.id]
      );

      results.generated++;
      results.tasks.push({ task_id: task.id, title: schedule.title, agent_id: schedule.agent_id });

      // Auto-execute if configured
      if (schedule.auto_execute) {
        // Fire and forget - execute in background
        executeTaskInBackground(task.id, schedule).catch(err => {
          console.error(`[SCHEDULER] Background execution failed for task ${task.id}:`, err.message);
        });
      }

    } catch (err) {
      console.error(`[SCHEDULER] Error generating task for schedule ${schedule.id}:`, err.message);
      results.errors++;
    }
  }

  console.log(`[SCHEDULER] Daily generation complete: ${results.generated} generated, ${results.skipped} skipped, ${results.errors} errors`);

  // Emit WebSocket event
  try {
    const { broadcast } = require('../websocket');
    broadcast('daily:tasks:generated', {
      date: targetDate,
      ...results
    });
  } catch (e) { /* websocket not available */ }

  return results;
}

/**
 * Execute a task in background, updating daily_task_run status.
 */
async function executeTaskInBackground(taskId, schedule) {
  try {
    // Update run status
    await query(
      "UPDATE daily_task_runs SET status = 'running' WHERE task_id = $1",
      [taskId]
    );

    const result = await agentExecutionService.executeTask(taskId);

    // If the schedule doesn't require review, auto-approve
    if (!schedule.requires_review && result && result.status === 'review') {
      await agentExecutionService.reviewTask(taskId, {
        status: 'approved',
        reviewed_by: 'auto-scheduler',
        notes: 'Auto-approved per schedule configuration'
      });
    }

    await query(
      "UPDATE daily_task_runs SET status = 'completed' WHERE task_id = $1",
      [taskId]
    );
  } catch (err) {
    await query(
      "UPDATE daily_task_runs SET status = 'failed', error = $1 WHERE task_id = $2",
      [err.message, taskId]
    );

    // Retry once if configured
    if (schedule.max_retries > 0) {
      try {
        const retried = await agentExecutionService.retryTask(taskId);
        if (retried) {
          await agentExecutionService.executeTask(taskId);
          await query(
            "UPDATE daily_task_runs SET status = 'completed', error = NULL WHERE task_id = $1",
            [taskId]
          );
        }
      } catch (retryErr) {
        console.error(`[SCHEDULER] Retry also failed for task ${taskId}:`, retryErr.message);
      }
    }
  }
}

/**
 * Determine if a schedule should run on a given day.
 */
function shouldRunToday(schedule, dayOfWeek, dayOfMonth, isWeekday) {
  switch (schedule.schedule_type) {
    case 'daily':
      return true;

    case 'weekdays':
      return isWeekday;

    case 'weekly':
      // schedule_days contains day-of-week numbers (1=Mon, 5=Fri, etc.)
      if (!schedule.schedule_days || schedule.schedule_days.length === 0) return false;
      return schedule.schedule_days.includes(dayOfWeek);

    case 'monthly':
      // schedule_days contains day-of-month numbers
      if (!schedule.schedule_days || schedule.schedule_days.length === 0) return false;
      return schedule.schedule_days.includes(dayOfMonth);

    default:
      return false;
  }
}

/**
 * Build dynamic context by resolving context_template tokens.
 * Tokens reference live data queries.
 */
async function buildDynamicContext(schedule) {
  const template = schedule.context_template || {};
  const includes = template.include || [];
  const context = { generated_at: new Date().toISOString(), schedule_id: schedule.id };

  for (const key of includes) {
    try {
      context[key] = await resolveContextToken(key, schedule);
    } catch (err) {
      console.error(`[SCHEDULER] Failed to resolve context token "${key}":`, err.message);
      context[key] = null;
    }
  }

  return context;
}

/**
 * Resolve a single context token to live data.
 */
async function resolveContextToken(token, schedule) {
  switch (token) {
    case 'pipeline_summary': {
      const r = await query(`
        SELECT stage, COUNT(*) as count, SUM(opportunity_value) as total_value
        FROM pipeline WHERE stage NOT IN ('closed_lost')
        GROUP BY stage ORDER BY count DESC
      `);
      return r.rows;
    }

    case 'pipeline_deals': {
      const r = await query(`
        SELECT d.*, sd.name as district_name
        FROM pipeline d
        LEFT JOIN school_districts sd ON d.school_district_id = sd.id
        WHERE d.stage NOT IN ('closed_lost')
        ORDER BY d.opportunity_value DESC LIMIT 20
      `);
      return r.rows;
    }

    case 'existing_districts': {
      const r = await query('SELECT name, state, city FROM school_districts ORDER BY name LIMIT 50');
      return r.rows;
    }

    case 'contact_data': {
      const r = await query(`
        SELECT c.*, sd.name as district_name
        FROM contacts c
        LEFT JOIN school_districts sd ON c.school_district_id = sd.id
        WHERE c.is_decision_maker = true
        ORDER BY c.created_at DESC LIMIT 30
      `);
      return r.rows;
    }

    case 'recent_activities': {
      const r = await query(`
        SELECT * FROM business_activities
        WHERE status IN ('pending', 'in_progress')
        ORDER BY priority ASC, due_date ASC LIMIT 15
      `);
      return r.rows;
    }

    case 'health_scores': {
      const r = await query(`
        SELECT ch.*, sd.name as district_name
        FROM customer_health ch
        LEFT JOIN school_districts sd ON ch.school_district_id = sd.id
        ORDER BY ch.overall_score ASC LIMIT 20
      `);
      return r.rows;
    }

    case 'renewal_pipeline': {
      const r = await query(`
        SELECT ch.*, sd.name as district_name
        FROM customer_health ch
        LEFT JOIN school_districts sd ON ch.school_district_id = sd.id
        WHERE ch.renewal_date IS NOT NULL
        AND ch.renewal_date <= CURRENT_DATE + INTERVAL '90 days'
        ORDER BY ch.renewal_date ASC
      `);
      return r.rows;
    }

    case 'onboarding_milestones': {
      const r = await query(`
        SELECT om.*, sd.name as district_name
        FROM onboarding_milestones om
        LEFT JOIN school_districts sd ON om.school_district_id = sd.id
        WHERE om.status IN ('pending', 'in_progress')
        ORDER BY om.due_date ASC LIMIT 20
      `);
      return r.rows;
    }

    case 'support_tickets': {
      const r = await query(`
        SELECT * FROM support_tickets
        WHERE status NOT IN ('resolved', 'closed')
        ORDER BY priority ASC, created_at ASC LIMIT 15
      `);
      return r.rows;
    }

    case 'campaign_metrics': {
      const r = await query('SELECT * FROM campaigns WHERE status = $1 ORDER BY name', ['active']);
      return r.rows;
    }

    case 'content_calendar': {
      const r = await query(`
        SELECT * FROM content_calendar
        WHERE scheduled_date >= CURRENT_DATE AND scheduled_date <= CURRENT_DATE + INTERVAL '7 days'
        ORDER BY scheduled_date
      `);
      return r.rows;
    }

    case 'recent_content_drafts': {
      const r = await query(`
        SELECT * FROM content_calendar
        WHERE status IN ('draft', 'review')
        AND updated_at >= CURRENT_DATE - INTERVAL '1 day'
        ORDER BY updated_at DESC LIMIT 10
      `);
      return r.rows;
    }

    case 'recent_linkedin_posts': {
      const r = await query(`
        SELECT * FROM linkedin_posts
        ORDER BY created_at DESC LIMIT 5
      `);
      return r.rows;
    }

    case 'brand_guidelines': {
      const r = await query(`
        SELECT * FROM brand_assets
        WHERE asset_type IN ('guideline', 'template')
        ORDER BY name LIMIT 20
      `);
      return r.rows;
    }

    case 'brand_assets': {
      const r = await query('SELECT * FROM brand_assets ORDER BY asset_type, name LIMIT 30');
      return r.rows;
    }

    case 'brand_metrics': {
      const r = await query(`
        SELECT asset_type, COUNT(*) as count
        FROM brand_assets
        GROUP BY asset_type ORDER BY count DESC
      `);
      return r.rows;
    }

    case 'cash_position':
    case 'pnl_data': {
      const r = await query(`
        SELECT
          COALESCE(SUM(CASE WHEN status = 'paid' THEN paid_amount ELSE 0 END), 0) as total_revenue,
          (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE expense_date >= date_trunc('month', CURRENT_DATE)) as monthly_expenses
        FROM invoices
      `);
      return r.rows[0] || {};
    }

    case 'recent_expenses': {
      const r = await query(`
        SELECT * FROM expenses
        WHERE expense_date >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY expense_date DESC LIMIT 20
      `);
      return r.rows;
    }

    case 'outstanding_invoices': {
      const r = await query(`
        SELECT i.*, sd.name as district_name
        FROM invoices i
        LEFT JOIN school_districts sd ON i.school_district_id = sd.id
        WHERE i.status IN ('sent', 'overdue')
        ORDER BY i.due_date ASC
      `);
      return r.rows;
    }

    case 'budget_data': {
      const r = await query('SELECT * FROM budgets ORDER BY period DESC, category');
      return r.rows;
    }

    case 'revenue_target': {
      const r = await query(`
        SELECT
          300000 as target,
          COALESCE(SUM(paid_amount), 0) as current_revenue,
          ROUND(COALESCE(SUM(paid_amount), 0) * 100.0 / 300000, 1) as percentage
        FROM invoices WHERE status = 'paid'
      `);
      return r.rows[0] || { target: 300000, current_revenue: 0, percentage: 0 };
    }

    case 'burn_rate':
    case 'runway': {
      const r = await query(`
        SELECT
          COALESCE(AVG(monthly_total), 0) as avg_monthly_burn
        FROM (
          SELECT date_trunc('month', expense_date) as month, SUM(amount) as monthly_total
          FROM expenses
          WHERE expense_date >= CURRENT_DATE - INTERVAL '3 months'
          GROUP BY month
        ) sub
      `);
      return r.rows[0] || {};
    }

    case 'tax_events': {
      const r = await query(`
        SELECT * FROM tax_events
        WHERE due_date >= CURRENT_DATE AND due_date <= CURRENT_DATE + INTERVAL '30 days'
        ORDER BY due_date ASC
      `);
      return r.rows;
    }

    case 'tax_deductions': {
      const r = await query(`
        SELECT * FROM tax_deductions
        WHERE tax_year = EXTRACT(YEAR FROM CURRENT_DATE)
        ORDER BY category, amount DESC
      `);
      return r.rows;
    }

    case 'state_obligations': {
      const r = await query(`
        SELECT * FROM tax_events
        WHERE state IS NOT NULL
        ORDER BY due_date ASC LIMIT 20
      `);
      return r.rows;
    }

    case 'compliance_items': {
      const r = await query(`
        SELECT * FROM compliance_items
        WHERE status NOT IN ('compliant')
        ORDER BY priority ASC LIMIT 20
      `);
      return r.rows;
    }

    case 'okr_progress': {
      const r = await query(`
        SELECT * FROM goals
        WHERE quarter = 'Q1_2026'
        ORDER BY goal_type ASC, progress ASC
      `);
      return r.rows;
    }

    case 'active_alerts': {
      const r = await query(`
        SELECT * FROM notifications
        WHERE is_read = false
        ORDER BY severity DESC, created_at DESC LIMIT 10
      `);
      return r.rows;
    }

    case 'yesterday_tasks': {
      const r = await query(`
        SELECT at.*, a.name as agent_name
        FROM agent_tasks at
        LEFT JOIN agents a ON at.agent_id = a.id
        WHERE at.run_date = CURRENT_DATE - INTERVAL '1 day'
        ORDER BY at.completed_at DESC LIMIT 20
      `);
      return r.rows;
    }

    case 'today_schedules': {
      const jsDate = new Date();
      const dow = jsDate.getDay();
      const dom = jsDate.getDate();
      const isWd = dow >= 1 && dow <= 5;
      const r = await query(`
        SELECT rts.*, at.name as team_name
        FROM recurring_task_schedules rts
        JOIN agent_teams at ON rts.team_id = at.id
        WHERE rts.is_active = true
        ORDER BY rts.schedule_time, rts.priority
      `);
      return r.rows.filter(s => shouldRunToday(s, dow, dom, isWd));
    }

    case 'partner_data': {
      const r = await query('SELECT * FROM partners WHERE status = $1 ORDER BY name', ['active']);
      return r.rows;
    }

    case 'partner_deals': {
      const r = await query(`
        SELECT pd.*, p.name as partner_name
        FROM partner_deals pd
        LEFT JOIN partners p ON pd.partner_id = p.id
        ORDER BY pd.created_at DESC LIMIT 20
      `);
      return r.rows;
    }

    case 'esser_districts': {
      // Districts with known ESSER III allocations — prioritized for urgency outreach
      const r = await query(`
        SELECT sd.name, sd.state, sd.city, sd.student_count,
               d.stage, d.opportunity_value, d.expected_close_date
        FROM school_districts sd
        LEFT JOIN pipeline d ON d.school_district_id = sd.id AND d.stage NOT IN ('closed_lost')
        WHERE sd.state IN ('IN', 'OH', 'IL', 'MI')
        ORDER BY sd.student_count DESC NULLS LAST
        LIMIT 50
      `);
      return r.rows;
    }

    case 'budget_deadlines': {
      // Upcoming budget decision dates and board vote schedules
      const r = await query(`
        SELECT d.*, sd.name as district_name, sd.state
        FROM pipeline d
        LEFT JOIN school_districts sd ON d.school_district_id = sd.id
        WHERE d.next_action_date IS NOT NULL
        AND d.next_action_date >= CURRENT_DATE
        AND d.next_action_date <= CURRENT_DATE + INTERVAL '90 days'
        AND d.stage NOT IN ('closed_won', 'closed_lost')
        ORDER BY d.next_action_date ASC
      `);
      return r.rows;
    }

    case 'pilot_conversions': {
      // Deals in pilot stage approaching conversion
      const r = await query(`
        SELECT d.*, sd.name as district_name, sd.state,
               ch.overall_score as health_score, ch.engagement_score
        FROM pipeline d
        LEFT JOIN school_districts sd ON d.school_district_id = sd.id
        LEFT JOIN customer_health ch ON ch.school_district_id = d.school_district_id
        WHERE d.stage IN ('pilot', 'evaluation', 'trial')
        ORDER BY d.next_action_date ASC NULLS LAST
      `);
      return r.rows;
    }

    case 'revenue_gap': {
      // Dynamic revenue gap calculation toward $300K target
      const r = await query(`
        SELECT
          300000 as target,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN paid_amount ELSE 0 END), 0) as current_revenue,
          300000 - COALESCE(SUM(CASE WHEN status = 'paid' THEN paid_amount ELSE 0 END), 0) as remaining,
          ROUND(COALESCE(SUM(CASE WHEN status = 'paid' THEN paid_amount ELSE 0 END), 0) * 100.0 / 300000, 1) as percentage,
          ('2026-06-30'::date - CURRENT_DATE) as days_remaining,
          CASE WHEN ('2026-06-30'::date - CURRENT_DATE) > 0
            THEN ROUND((300000 - COALESCE(SUM(CASE WHEN status = 'paid' THEN paid_amount ELSE 0 END), 0)) / (('2026-06-30'::date - CURRENT_DATE) / 30.0), 0)
            ELSE 0 END as required_monthly_rate
        FROM invoices
      `);
      return r.rows[0] || { target: 300000, current_revenue: 0, remaining: 300000, percentage: 0, days_remaining: 140, required_monthly_rate: 50500 };
    }

    case 'recent_content_performance':
    case 'linkedin_analytics':
    case 'outreach_performance':
    case 'content_performance':
    case 'recent_content':
    case 'recent_proposals':
    case 'deal_outcomes':
    case 'deal_activities':
    case 'districts':
    case 'data_quality_metrics':
    case 'system_metrics':
    case 'r_and_d_activities':
    case 'financial_metrics':
    case 'customer_health_scores':
    case 'onboarding_data':
      // These are alias/extended tokens - return empty for now,
      // agents handle gracefully with available context
      return null;

    default:
      console.warn(`[SCHEDULER] Unknown context token: ${token}`);
      return null;
  }
}

/**
 * Get daily briefing data for a user.
 * Aggregates pending reviews, today's tasks, alerts, and key metrics.
 */
async function getDailyBriefing(userId, date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Get today's task stats
  const taskStats = await query(`
    SELECT
      COUNT(*) AS total_tasks,
      COUNT(*) FILTER (WHERE status IN ('approved', 'rejected')) AS completed,
      COUNT(*) FILTER (WHERE status IN ('running', 'streaming', 'queued')) AS running,
      COUNT(*) FILTER (WHERE status = 'review') AS pending_review,
      COUNT(*) FILTER (WHERE status = 'failed') AS failed
    FROM agent_tasks
    WHERE run_date = $1
  `, [targetDate]);

  // Get pending review tasks
  const pendingReviews = await query(`
    SELECT at.id, at.title, at.agent_id, a.name AS agent_name, at.team_id, atm.name AS team_name
    FROM agent_tasks at
    LEFT JOIN agents a ON at.agent_id = a.id
    LEFT JOIN agent_teams atm ON at.team_id = atm.id
    WHERE at.status = 'review' AND at.run_date = $1
    ORDER BY at.created_at
  `, [targetDate]);

  // Get active alerts count
  const alertCount = await query(
    'SELECT COUNT(*) FROM notifications WHERE is_read = false'
  );

  // Get mission director's briefing if available
  const briefingTask = await query(`
    SELECT result FROM agent_tasks
    WHERE agent_id = 'mission-director'
    AND title = 'Morning Briefing for Jim and Nick'
    AND run_date = $1
    AND status IN ('review', 'approved')
    ORDER BY created_at DESC LIMIT 1
  `, [targetDate]);

  // Team summary
  const teamSummary = await query(`
    SELECT
      atm.id AS team_id,
      atm.name AS team_name,
      COALESCE(t.total, 0) AS total_tasks,
      COALESCE(t.done, 0) AS completed,
      COALESCE(t.review_count, 0) AS pending_review
    FROM agent_teams atm
    LEFT JOIN (
      SELECT
        team_id,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status IN ('approved', 'rejected')) AS done,
        COUNT(*) FILTER (WHERE status = 'review') AS review_count
      FROM agent_tasks
      WHERE run_date = $1
      GROUP BY team_id
    ) t ON t.team_id = atm.id
    WHERE atm.status = 'active'
    ORDER BY atm.name
  `, [targetDate]);

  return {
    date: targetDate,
    stats: taskStats.rows[0],
    pending_reviews: pendingReviews.rows,
    alert_count: parseInt(alertCount.rows[0].count),
    briefing_text: briefingTask.rows[0]?.result || null,
    team_summary: teamSummary.rows,
  };
}

/**
 * Get all recurring schedules, optionally filtered by team.
 */
async function getSchedules(teamId = null) {
  let sql = `
    SELECT rts.*, a.name AS agent_name, at.name AS team_name
    FROM recurring_task_schedules rts
    JOIN agents a ON rts.agent_id = a.id
    JOIN agent_teams at ON rts.team_id = at.id
  `;
  const params = [];

  if (teamId) {
    sql += ' WHERE rts.team_id = $1';
    params.push(teamId);
  }

  sql += ' ORDER BY rts.team_id, rts.schedule_time, rts.title';
  const result = await query(sql, params);
  return result.rows;
}

/**
 * Create a new recurring schedule.
 */
async function createSchedule(data) {
  const {
    agent_id, team_id, title, description, prompt, business_area,
    priority, schedule_type, schedule_days, schedule_time,
    auto_execute, requires_review, max_retries, context_template
  } = data;

  const result = await query(
    `INSERT INTO recurring_task_schedules
     (agent_id, team_id, title, description, prompt, business_area, priority,
      schedule_type, schedule_days, schedule_time, auto_execute, requires_review,
      max_retries, context_template)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      agent_id, team_id, title, description || null, prompt, business_area || null,
      priority || 3, schedule_type, schedule_days || '{}', schedule_time || '06:00:00',
      auto_execute !== false, requires_review !== false, max_retries || 1,
      JSON.stringify(context_template || {})
    ]
  );
  return result.rows[0];
}

/**
 * Update an existing schedule.
 */
async function updateSchedule(id, data) {
  const fields = [];
  const values = [];
  let paramIndex = 1;

  const allowedFields = [
    'title', 'description', 'prompt', 'business_area', 'priority',
    'schedule_type', 'schedule_days', 'schedule_time',
    'auto_execute', 'requires_review', 'max_retries', 'is_active', 'context_template'
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      if (field === 'context_template') {
        fields.push(`${field} = $${paramIndex}`);
        values.push(JSON.stringify(data[field]));
      } else {
        fields.push(`${field} = $${paramIndex}`);
        values.push(data[field]);
      }
      paramIndex++;
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  const result = await query(
    `UPDATE recurring_task_schedules SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

/**
 * Delete a schedule (soft delete by setting is_active = false).
 */
async function deleteSchedule(id) {
  const result = await query(
    'UPDATE recurring_task_schedules SET is_active = false WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Get all daily task runs for a date.
 */
async function getDailyRuns(date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const result = await query(`
    SELECT
      dtr.*,
      a.name AS agent_name,
      at.name AS team_name,
      rts.title AS schedule_title
    FROM daily_task_runs dtr
    LEFT JOIN agents a ON dtr.agent_id = a.id
    LEFT JOIN agent_teams at ON dtr.team_id = at.id
    LEFT JOIN recurring_task_schedules rts ON dtr.schedule_id = rts.id
    WHERE dtr.run_date = $1
    ORDER BY dtr.created_at
  `, [targetDate]);
  return result.rows;
}

/**
 * Monitor for stuck tasks (running > 15 min) and mark as failed.
 */
async function monitorStuckTasks() {
  const result = await query(`
    UPDATE agent_tasks
    SET status = 'failed', error = 'Task timed out (exceeded 15 minutes)', completed_at = NOW()
    WHERE status IN ('running', 'streaming')
    AND started_at < NOW() - INTERVAL '15 minutes'
    RETURNING id, agent_id, title
  `);

  if (result.rows.length > 0) {
    console.log(`[SCHEDULER] Marked ${result.rows.length} stuck tasks as failed`);

    // Update corresponding daily_task_runs
    for (const task of result.rows) {
      await query(
        "UPDATE daily_task_runs SET status = 'failed', error = 'Task timed out' WHERE task_id = $1",
        [task.id]
      );
    }
  }

  return result.rows;
}

/**
 * Generate evening summary notification.
 */
async function generateEveningSummary() {
  const today = new Date().toISOString().split('T')[0];

  const stats = await query(`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status IN ('approved', 'rejected')) AS completed,
      COUNT(*) FILTER (WHERE status = 'review') AS pending_review,
      COUNT(*) FILTER (WHERE status = 'failed') AS failed
    FROM agent_tasks
    WHERE run_date = $1
  `, [today]);

  const s = stats.rows[0];

  try {
    const notificationService = require('./notificationService');
    await notificationService.createNotification({
      type: 'daily_summary',
      severity: s.failed > 0 ? 'medium' : 'low',
      title: 'Daily Agent Summary',
      message: `Today's results: ${s.completed} completed, ${s.pending_review} pending review, ${s.failed} failed out of ${s.total} total tasks.`,
      section: 'agents',
    });
  } catch (err) {
    console.error('[SCHEDULER] Failed to create evening summary notification:', err.message);
  }

  return s;
}

module.exports = {
  generateDailyTasks,
  buildDynamicContext,
  getDailyBriefing,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getDailyRuns,
  monitorStuckTasks,
  generateEveningSummary,
};

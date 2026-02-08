const { query } = require('../db/connection');

class SalesSkillsService {
  // ========================
  // SKILLS
  // ========================

  async getSkills({ category = '', search = '', agent_id = '', page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT id, skill_id, name, category, description, applicable_agents, edtech_relevance, estimated_duration_minutes, output_format, tags, is_active, source_repo, created_at FROM sales_skills';
    const params = [];
    const conditions = ['is_active = true'];
    let paramIndex = 1;

    if (category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    if (search) {
      conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR skill_id ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (agent_id) {
      conditions.push(`$${paramIndex} = ANY(applicable_agents)`);
      params.push(agent_id);
      paramIndex++;
    }

    sql += ` WHERE ${conditions.join(' AND ')}`;
    sql += ` ORDER BY category, edtech_relevance DESC, name LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    let countSql = 'SELECT COUNT(*) FROM sales_skills';
    const countParams = [];
    const countConditions = ['is_active = true'];
    let cIdx = 1;
    if (category) { countConditions.push(`category = $${cIdx}`); countParams.push(category); cIdx++; }
    if (search) { countConditions.push(`(name ILIKE $${cIdx} OR description ILIKE $${cIdx} OR skill_id ILIKE $${cIdx})`); countParams.push(`%${search}%`); cIdx++; }
    if (agent_id) { countConditions.push(`$${cIdx} = ANY(applicable_agents)`); countParams.push(agent_id); cIdx++; }
    countSql += ` WHERE ${countConditions.join(' AND ')}`;
    const countResult = await query(countSql, countParams);

    return {
      skills: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  async getSkillById(id) {
    const result = await query('SELECT * FROM sales_skills WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async getSkillBySlug(skillId) {
    const result = await query('SELECT * FROM sales_skills WHERE skill_id = $1', [skillId]);
    return result.rows[0] || null;
  }

  async getCategories() {
    const result = await query(
      `SELECT category, COUNT(*) as count FROM sales_skills WHERE is_active = true GROUP BY category ORDER BY category`
    );
    return result.rows;
  }

  // ========================
  // WORKFLOWS
  // ========================

  async getWorkflows({ category = '' } = {}) {
    let sql = `SELECT w.*,
      (SELECT COUNT(*) FROM sales_workflow_steps WHERE workflow_id = w.id) as step_count
      FROM sales_workflows w WHERE w.is_active = true`;
    const params = [];

    if (category) {
      sql += ' AND w.category = $1';
      params.push(category);
    }

    sql += ' ORDER BY w.category, w.name';
    const result = await query(sql, params);
    return result.rows;
  }

  async getWorkflowById(id) {
    const workflowResult = await query('SELECT * FROM sales_workflows WHERE id = $1', [id]);
    const workflow = workflowResult.rows[0];
    if (!workflow) return null;

    const stepsResult = await query(
      `SELECT ws.*, ss.skill_id as skill_slug, ss.name as skill_name, ss.category as skill_category,
              ss.estimated_duration_minutes as skill_duration, ss.description as skill_description
       FROM sales_workflow_steps ws
       JOIN sales_skills ss ON ws.skill_id = ss.id
       WHERE ws.workflow_id = $1
       ORDER BY ws.step_order`,
      [id]
    );

    workflow.steps = stepsResult.rows;
    return workflow;
  }

  // ========================
  // WORKFLOW RUNS
  // ========================

  async startWorkflowRun(workflowId, { context = {}, created_by = 'system' } = {}) {
    const workflow = await this.getWorkflowById(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    const runResult = await query(
      `INSERT INTO sales_workflow_runs (workflow_id, status, current_step, total_steps, context, created_by, started_at)
       VALUES ($1, 'running', 1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [workflowId, workflow.steps.length, JSON.stringify(context), created_by]
    );
    const run = runResult.rows[0];

    // Create run step records for each workflow step
    for (const step of workflow.steps) {
      await query(
        `INSERT INTO sales_workflow_run_steps (run_id, step_id, status) VALUES ($1, $2, 'pending')`,
        [run.id, step.id]
      );
    }

    return run;
  }

  async advanceWorkflowRun(runId) {
    const run = await this.getWorkflowRun(runId);
    if (!run) throw new Error('Workflow run not found');
    if (run.status === 'completed' || run.status === 'cancelled' || run.status === 'failed') {
      throw new Error(`Workflow run is ${run.status}`);
    }

    // Find the next pending step
    const pendingStep = run.steps.find(s => s.status === 'pending');
    if (!pendingStep) {
      // All steps completed
      await query(
        `UPDATE sales_workflow_runs SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [runId]
      );
      return { ...run, status: 'completed' };
    }

    // Get the skill for this step
    const stepDetail = await query(
      `SELECT ws.*, ss.* FROM sales_workflow_steps ws
       JOIN sales_skills ss ON ws.skill_id = ss.id
       WHERE ws.id = $1`,
      [pendingStep.step_id]
    );
    const step = stepDetail.rows[0];
    if (!step) throw new Error('Workflow step not found');

    // Gather context from completed steps
    const completedSteps = run.steps.filter(s => s.status === 'completed');
    const priorResults = completedSteps.map(s => ({
      step: s.step_order,
      skill: s.skill_name,
      result: s.result_summary
    }));

    // Build the prompt
    const prompt = this.buildSkillPrompt(step, { ...run.context, priorResults });

    // Mark step as running
    await query(
      `UPDATE sales_workflow_run_steps SET status = 'running', started_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [pendingStep.id]
    );

    // Update run current step
    const currentStepOrder = step.step_order || (completedSteps.length + 1);
    await query(
      `UPDATE sales_workflow_runs SET current_step = $1, status = 'running', updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [currentStepOrder, runId]
    );

    // Delegate to agent execution service
    try {
      const agentExecutionService = require('./agentExecutionService');
      const agentId = step.agent_id || step.applicable_agents?.[0] || 'sdr-agent';
      const task = await agentExecutionService.executeTaskAsync({
        agent_id: agentId,
        title: `[Workflow] ${step.name}`,
        prompt: prompt,
        business_area: 'sales',
        context: { workflow_run_id: runId, step_id: pendingStep.id }
      });

      // Link task to run step
      await query(
        `UPDATE sales_workflow_run_steps SET task_id = $1 WHERE id = $2`,
        [task.id, pendingStep.id]
      );

      return { run_id: runId, step_id: pendingStep.id, task_id: task.id, skill: step.name, status: 'running' };
    } catch (err) {
      await query(
        `UPDATE sales_workflow_run_steps SET status = 'failed' WHERE id = $1`,
        [pendingStep.id]
      );
      await query(
        `UPDATE sales_workflow_runs SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [runId]
      );
      throw err;
    }
  }

  async getWorkflowRun(runId) {
    const runResult = await query(
      `SELECT r.*, w.name as workflow_name, w.slug as workflow_slug
       FROM sales_workflow_runs r
       JOIN sales_workflows w ON r.workflow_id = w.id
       WHERE r.id = $1`,
      [runId]
    );
    const run = runResult.rows[0];
    if (!run) return null;

    const stepsResult = await query(
      `SELECT rs.*, ws.step_order, ss.name as skill_name, ss.skill_id as skill_slug, ss.category as skill_category
       FROM sales_workflow_run_steps rs
       JOIN sales_workflow_steps ws ON rs.step_id = ws.id
       JOIN sales_skills ss ON ws.skill_id = ss.id
       WHERE rs.run_id = $1
       ORDER BY ws.step_order`,
      [runId]
    );

    run.steps = stepsResult.rows;
    return run;
  }

  async getWorkflowRuns({ status = '' } = {}) {
    let sql = `SELECT r.*, w.name as workflow_name, w.slug as workflow_slug
               FROM sales_workflow_runs r
               JOIN sales_workflows w ON r.workflow_id = w.id`;
    const params = [];

    if (status) {
      sql += ' WHERE r.status = $1';
      params.push(status);
    }

    sql += ' ORDER BY r.created_at DESC LIMIT 50';
    const result = await query(sql, params);
    return result.rows;
  }

  async cancelWorkflowRun(runId) {
    const result = await query(
      `UPDATE sales_workflow_runs SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status IN ('pending', 'running', 'paused')
       RETURNING *`,
      [runId]
    );
    if (!result.rows[0]) throw new Error('Run not found or already finished');

    // Mark pending steps as skipped
    await query(
      `UPDATE sales_workflow_run_steps SET status = 'skipped' WHERE run_id = $1 AND status = 'pending'`,
      [runId]
    );

    return result.rows[0];
  }

  async completeRunStep(runStepId, resultSummary) {
    await query(
      `UPDATE sales_workflow_run_steps SET status = 'completed', result_summary = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [resultSummary, runStepId]
    );

    // Check if all steps are completed for the run
    const runStep = await query('SELECT run_id FROM sales_workflow_run_steps WHERE id = $1', [runStepId]);
    if (runStep.rows[0]) {
      const runId = runStep.rows[0].run_id;
      const pending = await query(
        `SELECT COUNT(*) FROM sales_workflow_run_steps WHERE run_id = $1 AND status IN ('pending', 'running')`,
        [runId]
      );
      if (parseInt(pending.rows[0].count) === 0) {
        await query(
          `UPDATE sales_workflow_runs SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [runId]
        );
      }
    }
  }

  // ========================
  // PROMPT BUILDING
  // ========================

  buildSkillPrompt(skill, context = {}) {
    const sections = [];

    sections.push(`You are executing the "${skill.name}" sales skill for Ascent XR.`);
    sections.push(`Follow the framework below precisely and produce actionable output.`);
    sections.push('');
    sections.push('--- SKILL FRAMEWORK ---');
    sections.push(skill.content);
    sections.push('--- END SKILL FRAMEWORK ---');
    sections.push('');

    // Add Ascent XR K-12 context
    sections.push('--- COMPANY CONTEXT ---');
    sections.push('Company: Ascent XR - Immersive XR learning experiences for K-12 school districts');
    sections.push('Revenue Target: $300K by June 2026');
    sections.push('Target Market: K-12 school districts in IN, OH, IL, MI (expanding nationally)');
    sections.push('Products: Custom XR Experiences ($15-50K), District Subscriptions ($3-10K/yr), Professional Services ($150/hr), Pilot Programs ($2K)');
    sections.push('Sales Motion: Land with pilot, expand to district-wide deployment');
    sections.push('Pipeline: 15-20 active district opportunities, average deal size $8-12K');
    sections.push('District Targets: 50+ districts in pipeline, 10-15 active pilots');
    sections.push('--- END COMPANY CONTEXT ---');

    // Add prior workflow step results if present
    if (context.priorResults && context.priorResults.length > 0) {
      sections.push('');
      sections.push('--- PRIOR WORKFLOW STEP RESULTS ---');
      sections.push('Build upon these results from earlier steps in this workflow:');
      for (const prior of context.priorResults) {
        sections.push(`\nStep ${prior.step} - ${prior.skill}:`);
        sections.push(prior.result || '(no result yet)');
      }
      sections.push('--- END PRIOR RESULTS ---');
    }

    // Add any additional context
    if (context.additional_instructions) {
      sections.push(`\nAdditional Instructions: ${context.additional_instructions}`);
    }

    return sections.join('\n');
  }
}

module.exports = new SalesSkillsService();

const { query } = require('../db/connection');
const agentPrompts = require('./agentPrompts');
const knowledgeBaseService = require('./knowledgeBaseService');
const businessActivityService = require('./businessActivityService');

class AgentExecutionService {
  constructor() {
    this._client = null;
  }

  /**
   * Lazy-initialize the Anthropic client so the module can be required
   * even when ANTHROPIC_API_KEY is not yet available at import time.
   */
  get client() {
    if (!this._client) {
      const Anthropic = require('@anthropic-ai/sdk');
      this._client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }
    return this._client;
  }

  // ========================
  // TASK MANAGEMENT
  // ========================

  /**
   * Create a new agent task with status 'queued'.
   */
  async createTask(data) {
    const { agent_id, title, description, business_area, priority, prompt, context, result_type, goal_id, created_by } = data;
    const result = await query(
      `INSERT INTO agent_tasks (agent_id, title, description, business_area, priority, status, prompt, context, result_type, goal_id, created_by)
       VALUES ($1, $2, $3, $4, $5, 'queued', $6, $7, $8, $9, $10)
       RETURNING *`,
      [agent_id, title, description || null, business_area || null, priority || 3, prompt || null, JSON.stringify(context || {}), result_type || 'text', goal_id || null, created_by || null]
    );
    return result.rows[0];
  }

  /**
   * Get a single task by ID.
   */
  async getTask(id) {
    const result = await query(
      `SELECT at.*, a.name as agent_name, a.description as agent_description
       FROM agent_tasks at
       LEFT JOIN agents a ON at.agent_id = a.id
       WHERE at.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * List tasks with filtering.
   */
  async getTasks({ agent_id = '', status = '', business_area = '', page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT at.*, a.name as agent_name
      FROM agent_tasks at
      LEFT JOIN agents a ON at.agent_id = a.id
    `;
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (agent_id) {
      conditions.push(`at.agent_id = $${paramIndex}`);
      params.push(agent_id);
      paramIndex++;
    }
    if (status) {
      conditions.push(`at.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    if (business_area) {
      conditions.push(`at.business_area = $${paramIndex}`);
      params.push(business_area);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY at.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    let countSql = 'SELECT COUNT(*) FROM agent_tasks at';
    const countParams = [];
    const countConditions = [];
    let cIdx = 1;
    if (agent_id) {
      countConditions.push(`at.agent_id = $${cIdx}`);
      countParams.push(agent_id);
      cIdx++;
    }
    if (status) {
      countConditions.push(`at.status = $${cIdx}`);
      countParams.push(status);
      cIdx++;
    }
    if (business_area) {
      countConditions.push(`at.business_area = $${cIdx}`);
      countParams.push(business_area);
      cIdx++;
    }
    if (countConditions.length > 0) {
      countSql += ` WHERE ${countConditions.join(' AND ')}`;
    }
    const countResult = await query(countSql, countParams);

    return {
      tasks: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  /**
   * Get tasks by goal ID.
   */
  async getTasksByGoal(goalId) {
    const result = await query(
      'SELECT at.*, a.name as agent_name FROM agent_tasks at LEFT JOIN agents a ON at.agent_id = a.id WHERE at.goal_id = $1 ORDER BY at.created_at DESC',
      [goalId]
    );
    return result.rows;
  }

  /**
   * Get most recent tasks across all agents.
   */
  async getRecentTasks(limit = 10) {
    const result = await query(
      `SELECT at.*, a.name as agent_name
       FROM agent_tasks at
       LEFT JOIN agents a ON at.agent_id = a.id
       ORDER BY at.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  // ========================
  // TASK EXECUTION
  // ========================

  /**
   * Execute a task:
   * 1. Update status to 'running' and record start time
   * 2. Build system prompt from agentPrompts using agent_id and context
   * 3. Call Anthropic API
   * 4. Save result and update status to 'review'
   * On failure, update status to 'failed' with error message
   */
  async executeTask(taskId) {
    // Fetch the task
    const task = await this.getTask(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    if (task.status !== 'queued') {
      throw new Error(`Task is not queued (current status: ${task.status})`);
    }

    const startTime = Date.now();

    // Update status to running
    await query(
      `UPDATE agent_tasks SET status = 'running', started_at = NOW() WHERE id = $1`,
      [taskId]
    );

    // Emit WebSocket update if available
    this._emitUpdate({ ...task, status: 'running' });

    try {
      // Build system prompt with knowledge base context injection
      const context = typeof task.context === 'string' ? JSON.parse(task.context) : (task.context || {});
      const businessArea = agentPrompts.mapAgentToBusinessArea(task.agent_id);
      let kbContext = {};
      if (businessArea) {
        try {
          const [kbResult, actResult, goalsResult] = await Promise.all([
            knowledgeBaseService.getArticles({ business_area: businessArea, limit: 5 }),
            businessActivityService.getActivities({ business_area: businessArea, priority: 'asap', limit: 5 }),
            query('SELECT * FROM goals WHERE business_area = $1 AND quarter = $2 ORDER BY goal_type ASC', [businessArea, 'Q1_2026'])
          ]);
          kbContext = {
            articles: kbResult.articles || [],
            activities: (actResult.activities || []),
            goals: goalsResult.rows || []
          };
        } catch (e) { /* KB context is optional, continue without it */ }
      }
      const systemPrompt = agentPrompts.buildEnhancedPrompt(task.agent_id, context, kbContext);

      // Build user message from task prompt/description
      const userMessage = task.prompt || task.description || task.title;

      let resultText;
      let tokensUsed = 0;

      if (process.env.ANTHROPIC_API_KEY) {
        // Update to streaming status
        await query(
          `UPDATE agent_tasks SET status = 'streaming' WHERE id = $1`,
          [taskId]
        );

        // Call Anthropic API
        const response = await this.client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userMessage }
          ]
        });

        resultText = response.content
          .filter(block => block.type === 'text')
          .map(block => block.text)
          .join('\n\n');

        tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);
      } else {
        // Fallback: generate a placeholder response when no API key
        resultText = `[Agent ${task.agent_id} - Simulated Response]\n\n` +
          `Task: ${task.title}\n\n` +
          `This is a simulated response. To enable real AI agent execution, ` +
          `set the ANTHROPIC_API_KEY environment variable.\n\n` +
          `Prompt was: ${userMessage}`;
      }

      const executionTime = Date.now() - startTime;

      // Save result and update to 'review'
      const updated = await query(
        `UPDATE agent_tasks
         SET status = 'review', result = $1, tokens_used = $2, execution_time_ms = $3, completed_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [resultText, tokensUsed, executionTime, taskId]
      );

      // Update agent's task count and last_active
      if (task.agent_id) {
        await query(
          `UPDATE agents SET tasks_completed = tasks_completed + 1, last_active = NOW() WHERE id = $1`,
          [task.agent_id]
        );
      }

      this._emitUpdate({ ...task, status: 'review', result: resultText });

      return updated.rows[0];
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Update task to failed
      await query(
        `UPDATE agent_tasks
         SET status = 'failed', error = $1, execution_time_ms = $2, completed_at = NOW()
         WHERE id = $3`,
        [error.message, executionTime, taskId]
      );

      this._emitUpdate({ ...task, status: 'failed', error: error.message });

      throw error;
    }
  }

  /**
   * Execute a task with streaming. Yields text chunks as they arrive.
   * Returns the complete result when done.
   */
  async *executeTaskStream(taskId) {
    const task = await this.getTask(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    if (task.status !== 'queued') {
      throw new Error(`Task is not queued (current status: ${task.status})`);
    }

    const startTime = Date.now();

    // Update status to streaming
    await query(
      `UPDATE agent_tasks SET status = 'streaming', started_at = NOW() WHERE id = $1`,
      [taskId]
    );

    try {
      const context = typeof task.context === 'string' ? JSON.parse(task.context) : (task.context || {});
      const businessArea = agentPrompts.mapAgentToBusinessArea(task.agent_id);
      let kbContext = {};
      if (businessArea) {
        try {
          const [kbResult, actResult, goalsResult] = await Promise.all([
            knowledgeBaseService.getArticles({ business_area: businessArea, limit: 5 }),
            businessActivityService.getActivities({ business_area: businessArea, priority: 'asap', limit: 5 }),
            query('SELECT * FROM goals WHERE business_area = $1 AND quarter = $2 ORDER BY goal_type ASC', [businessArea, 'Q1_2026'])
          ]);
          kbContext = {
            articles: kbResult.articles || [],
            activities: (actResult.activities || []),
            goals: goalsResult.rows || []
          };
        } catch (e) { /* KB context is optional */ }
      }
      const systemPrompt = agentPrompts.buildEnhancedPrompt(task.agent_id, context, kbContext);
      const userMessage = task.prompt || task.description || task.title;

      if (!process.env.ANTHROPIC_API_KEY) {
        // Fallback for no API key
        const simulated = `[Simulated] Task: ${task.title}\nSet ANTHROPIC_API_KEY for real execution.`;
        yield { type: 'text_delta', text: simulated };

        await query(
          `UPDATE agent_tasks SET status = 'review', result = $1, execution_time_ms = $2, completed_at = NOW() WHERE id = $3`,
          [simulated, Date.now() - startTime, taskId]
        );

        yield { type: 'done', task_id: taskId, tokens_used: 0, execution_time_ms: Date.now() - startTime };
        return;
      }

      const stream = await this.client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userMessage }
        ]
      });

      let fullResult = '';

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          fullResult += event.delta.text;
          yield { type: 'text_delta', text: event.delta.text };
        }
      }

      const finalMessage = await stream.finalMessage();
      const tokensUsed = (finalMessage.usage?.input_tokens || 0) + (finalMessage.usage?.output_tokens || 0);
      const executionTime = Date.now() - startTime;

      // Save result
      await query(
        `UPDATE agent_tasks
         SET status = 'review', result = $1, tokens_used = $2, execution_time_ms = $3, completed_at = NOW()
         WHERE id = $4`,
        [fullResult, tokensUsed, executionTime, taskId]
      );

      if (task.agent_id) {
        await query(
          `UPDATE agents SET tasks_completed = tasks_completed + 1, last_active = NOW() WHERE id = $1`,
          [task.agent_id]
        );
      }

      yield { type: 'done', task_id: taskId, tokens_used: tokensUsed, execution_time_ms: executionTime };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      await query(
        `UPDATE agent_tasks
         SET status = 'failed', error = $1, execution_time_ms = $2, completed_at = NOW()
         WHERE id = $3`,
        [error.message, executionTime, taskId]
      );

      yield { type: 'error', error: error.message };
      throw error;
    }
  }

  /**
   * Execute a task and return it immediately (fire-and-forget).
   * The execution continues in the background.
   */
  async executeTaskAsync(data) {
    const task = await this.createTask(data);

    // Execute in background
    this.executeTask(task.id).catch(err => {
      console.error(`Agent task execution failed for ${task.id}:`, err.message);
    });

    return task;
  }

  // ========================
  // TASK REVIEW
  // ========================

  /**
   * Review a task: approve or reject.
   */
  async reviewTask(taskId, { status, reviewed_by, notes } = {}) {
    if (!['approved', 'rejected'].includes(status)) {
      throw new Error('Review status must be "approved" or "rejected"');
    }

    const fields = [
      'status = $1',
      'reviewed_by = $2',
      'reviewed_at = NOW()'
    ];
    const values = [status, reviewed_by || null];
    let paramIndex = 3;

    if (notes) {
      // Append review notes to existing result
      const task = await this.getTask(taskId);
      if (task) {
        const existingResult = task.result || '';
        const updatedResult = existingResult + `\n\n---\nReview (${status}): ${notes}`;
        fields.push(`result = $${paramIndex}`);
        values.push(updatedResult);
        paramIndex++;
      }
    }

    values.push(taskId);
    const result = await query(
      `UPDATE agent_tasks SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  }

  /**
   * Retry a failed or rejected task by resetting it to queued.
   */
  async retryTask(taskId) {
    const result = await query(
      `UPDATE agent_tasks
       SET status = 'queued', result = NULL, error = NULL, tokens_used = NULL,
           execution_time_ms = NULL, started_at = NULL, completed_at = NULL,
           reviewed_by = NULL, reviewed_at = NULL
       WHERE id = $1 AND status IN ('failed', 'rejected')
       RETURNING *`,
      [taskId]
    );
    return result.rows[0] || null;
  }

  /**
   * Emit WebSocket update if the websocket module is available.
   */
  _emitUpdate(data) {
    try {
      const { emitTaskUpdate } = require('../websocket');
      emitTaskUpdate(data);
    } catch (e) {
      // websocket module not initialized - skip silently
    }
  }
}

// Route-compatible aliases
const instance = new AgentExecutionService();
instance.getTaskById = instance.getTask.bind(instance);
module.exports = instance;

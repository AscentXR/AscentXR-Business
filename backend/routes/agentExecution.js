const express = require('express');
const router = express.Router();
const agentExecutionService = require('../services/agentExecutionService');

// POST /api/agent-execution/execute - Create and queue a task
router.post('/execute', async (req, res, next) => {
  try {
    const { agent_id, title, prompt } = req.body;

    if (!agent_id || !title || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'agent_id, title, and prompt are required'
      });
    }

    const data = await agentExecutionService.createTask(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/agent-execution/tasks - List tasks
router.get('/tasks', async (req, res, next) => {
  try {
    const { status, agent_id, business_area } = req.query;
    const data = await agentExecutionService.getTasks({ status, agent_id, business_area });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/agent-execution/tasks/:id - Get task detail
router.get('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await agentExecutionService.getTaskById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/agent-execution/tasks/:id/review - Review task
router.put('/tasks/:id/review', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!action || !['approved', 'rejected'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'action is required and must be "approved" or "rejected"'
      });
    }

    const data = await agentExecutionService.reviewTask(id, { status: action, reviewed_by: req.body.reviewed_by, notes: req.body.feedback });

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

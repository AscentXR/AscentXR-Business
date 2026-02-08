const express = require('express');
const router = express.Router();
const salesSkillsService = require('../services/salesSkillsService');

// GET /api/sales/skills - List skills with filtering
router.get('/skills', async (req, res, next) => {
  try {
    const data = await salesSkillsService.getSkills(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/sales/skills/categories - Skill categories with counts
router.get('/skills/categories', async (req, res, next) => {
  try {
    const data = await salesSkillsService.getCategories();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/sales/skills/:id - Skill detail
router.get('/skills/:id', async (req, res, next) => {
  try {
    const data = await salesSkillsService.getSkillById(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Skill not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/sales/skills/:id/execute - Execute a single skill as agent task
router.post('/skills/:id/execute', async (req, res, next) => {
  try {
    const skill = await salesSkillsService.getSkillById(req.params.id);
    if (!skill) return res.status(404).json({ error: { message: 'Skill not found', status: 404 } });

    const prompt = salesSkillsService.buildSkillPrompt(skill, req.body.context || {});
    const agentId = skill.applicable_agents?.[0] || 'sdr-agent';

    const agentExecutionService = require('../services/agentExecutionService');
    const task = await agentExecutionService.executeTaskAsync({
      agent_id: agentId,
      title: `[Skill] ${skill.name}`,
      prompt: prompt,
      business_area: 'sales',
      context: { skill_id: skill.id, skill_slug: skill.skill_id }
    });

    res.json({ success: true, data: { task_id: task.id, skill: skill.name, agent_id: agentId } });
  } catch (err) { next(err); }
});

// GET /api/sales/workflows - List workflow templates
router.get('/workflows', async (req, res, next) => {
  try {
    const data = await salesSkillsService.getWorkflows(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/sales/workflows/:id - Workflow detail with steps
router.get('/workflows/:id', async (req, res, next) => {
  try {
    const data = await salesSkillsService.getWorkflowById(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Workflow not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/sales/workflows/:id/run - Start a workflow run
router.post('/workflows/:id/run', async (req, res, next) => {
  try {
    const data = await salesSkillsService.startWorkflowRun(req.params.id, {
      context: req.body.context || {},
      created_by: req.body.created_by || req.user?.username || 'system'
    });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/sales/workflow-runs - List runs
router.get('/workflow-runs', async (req, res, next) => {
  try {
    const data = await salesSkillsService.getWorkflowRuns(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/sales/workflow-runs/:id - Run detail with step statuses
router.get('/workflow-runs/:id', async (req, res, next) => {
  try {
    const data = await salesSkillsService.getWorkflowRun(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Workflow run not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/sales/workflow-runs/:id/advance - Advance to next step
router.post('/workflow-runs/:id/advance', async (req, res, next) => {
  try {
    const data = await salesSkillsService.advanceWorkflowRun(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/sales/workflow-runs/:id/cancel - Cancel a run
router.post('/workflow-runs/:id/cancel', async (req, res, next) => {
  try {
    const data = await salesSkillsService.cancelWorkflowRun(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;

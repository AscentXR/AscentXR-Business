const express = require('express');
const router = express.Router();
const marketingSkillsService = require('../services/marketingSkillsService');

// GET /api/marketing/skills - List skills with filtering
router.get('/skills', async (req, res, next) => {
  try {
    const data = await marketingSkillsService.getSkills(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/marketing/skills/categories - Skill categories with counts
router.get('/skills/categories', async (req, res, next) => {
  try {
    const data = await marketingSkillsService.getCategories();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/marketing/skills/:id - Skill detail
router.get('/skills/:id', async (req, res, next) => {
  try {
    const data = await marketingSkillsService.getSkillById(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Skill not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/marketing/skills/:id/execute - Execute a single skill as agent task
router.post('/skills/:id/execute', async (req, res, next) => {
  try {
    const skill = await marketingSkillsService.getSkillById(req.params.id);
    if (!skill) return res.status(404).json({ error: { message: 'Skill not found', status: 404 } });

    const prompt = marketingSkillsService.buildSkillPrompt(skill, req.body.context || {});
    const agentId = skill.applicable_agents?.[0] || 'content-creator';

    const agentExecutionService = require('../services/agentExecutionService');
    const task = await agentExecutionService.executeTaskAsync({
      agent_id: agentId,
      title: `[Skill] ${skill.name}`,
      prompt: prompt,
      business_area: 'marketing',
      context: { skill_id: skill.id, skill_slug: skill.skill_id }
    });

    res.json({ success: true, data: { task_id: task.id, skill: skill.name, agent_id: agentId } });
  } catch (err) { next(err); }
});

// GET /api/marketing/workflows - List workflow templates
router.get('/workflows', async (req, res, next) => {
  try {
    const data = await marketingSkillsService.getWorkflows(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/marketing/workflows/:id - Workflow detail with steps
router.get('/workflows/:id', async (req, res, next) => {
  try {
    const data = await marketingSkillsService.getWorkflowById(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Workflow not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/marketing/workflows/:id/run - Start a workflow run
router.post('/workflows/:id/run', async (req, res, next) => {
  try {
    const data = await marketingSkillsService.startWorkflowRun(req.params.id, {
      context: req.body.context || {},
      created_by: req.body.created_by || req.user?.email || 'system'
    });
    res.status(201).json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/marketing/workflow-runs - List runs
router.get('/workflow-runs', async (req, res, next) => {
  try {
    const data = await marketingSkillsService.getWorkflowRuns(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// GET /api/marketing/workflow-runs/:id - Run detail with step statuses
router.get('/workflow-runs/:id', async (req, res, next) => {
  try {
    const data = await marketingSkillsService.getWorkflowRun(req.params.id);
    if (!data) return res.status(404).json({ error: { message: 'Workflow run not found', status: 404 } });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/marketing/workflow-runs/:id/advance - Advance to next step
router.post('/workflow-runs/:id/advance', async (req, res, next) => {
  try {
    const data = await marketingSkillsService.advanceWorkflowRun(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// POST /api/marketing/workflow-runs/:id/cancel - Cancel a run
router.post('/workflow-runs/:id/cancel', async (req, res, next) => {
  try {
    const data = await marketingSkillsService.cancelWorkflowRun(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

module.exports = router;

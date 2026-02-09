const express = require('express');
const router = express.Router();
const agentTeamService = require('../services/agentTeamService');
const taskSchedulerService = require('../services/taskSchedulerService');
const { requireAdmin } = require('../middleware/firebaseAuth');

// GET /api/agent-teams - List all teams with stats
router.get('/', async (req, res, next) => {
  try {
    const teams = await agentTeamService.getTeams();
    res.json({ success: true, data: teams });
  } catch (err) {
    next(err);
  }
});

// GET /api/agent-teams/daily-briefing - Daily briefing for current user
router.get('/daily-briefing', async (req, res, next) => {
  try {
    const { date } = req.query;
    const briefing = await taskSchedulerService.getDailyBriefing(req.user?.uid, date);
    res.json({ success: true, data: briefing });
  } catch (err) {
    next(err);
  }
});

// GET /api/agent-teams/daily-runs - All runs for a date
router.get('/daily-runs', async (req, res, next) => {
  try {
    const { date } = req.query;
    const runs = await taskSchedulerService.getDailyRuns(date);
    res.json({ success: true, data: runs });
  } catch (err) {
    next(err);
  }
});

// GET /api/agent-teams/schedules - All recurring schedules
router.get('/schedules', async (req, res, next) => {
  try {
    const { team_id } = req.query;
    const schedules = await taskSchedulerService.getSchedules(team_id);
    res.json({ success: true, data: schedules });
  } catch (err) {
    next(err);
  }
});

// POST /api/agent-teams/trigger-daily - Manual trigger (admin only)
router.post('/trigger-daily', requireAdmin, async (req, res, next) => {
  try {
    const { date } = req.body;
    const results = await taskSchedulerService.generateDailyTasks(date);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});

// GET /api/agent-teams/daily-tasks - All tasks for a date across all teams
router.get('/daily-tasks', async (req, res, next) => {
  try {
    const { date, status, page, limit } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const { query: dbQuery } = require('../db/connection');
    const conditions = ['at.run_date = $1'];
    const params = [targetDate];
    let paramIndex = 2;

    if (status) {
      conditions.push(`at.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const offset = ((parseInt(page) || 1) - 1) * (parseInt(limit) || 50);
    params.push(parseInt(limit) || 50, offset);

    const result = await dbQuery(`
      SELECT at.*, a.name AS agent_name, atm.name AS team_name,
             rts.requires_review
      FROM agent_tasks at
      LEFT JOIN agents a ON at.agent_id = a.id
      LEFT JOIN agent_teams atm ON at.team_id = atm.id
      LEFT JOIN recurring_task_schedules rts ON at.schedule_id = rts.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY at.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

    const countResult = await dbQuery(
      `SELECT COUNT(*) FROM agent_tasks at WHERE ${conditions.join(' AND ')}`,
      params.slice(0, -2)
    );

    res.json({
      success: true,
      data: {
        tasks: result.rows,
        total: parseInt(countResult.rows[0].count),
        date: targetDate
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/agent-teams/:id - Team detail with members
router.get('/:id', async (req, res, next) => {
  try {
    const team = await agentTeamService.getTeamById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, error: 'Team not found' });
    }
    res.json({ success: true, data: team });
  } catch (err) {
    next(err);
  }
});

// GET /api/agent-teams/:id/tasks - Team's tasks (default: today)
router.get('/:id/tasks', async (req, res, next) => {
  try {
    const { date, status, page, limit } = req.query;
    const result = await agentTeamService.getTeamTasks(req.params.id, {
      date: date || new Date().toISOString().split('T')[0],
      status,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/agent-teams/:id/schedules - Recurring schedules for team
router.get('/:id/schedules', async (req, res, next) => {
  try {
    const schedules = await taskSchedulerService.getSchedules(req.params.id);
    res.json({ success: true, data: schedules });
  } catch (err) {
    next(err);
  }
});

// POST /api/agent-teams/:id/schedules - Create schedule (admin only)
router.post('/:id/schedules', requireAdmin, async (req, res, next) => {
  try {
    const data = { ...req.body, team_id: req.params.id };
    if (!data.agent_id || !data.title || !data.prompt || !data.schedule_type) {
      return res.status(400).json({
        success: false,
        error: 'agent_id, title, prompt, and schedule_type are required'
      });
    }
    const schedule = await taskSchedulerService.createSchedule(data);
    res.status(201).json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
});

// PUT /api/agent-teams/schedules/:id - Update schedule (admin only)
router.put('/schedules/:id', requireAdmin, async (req, res, next) => {
  try {
    const schedule = await taskSchedulerService.updateSchedule(req.params.id, req.body);
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    res.json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const goalService = require('../services/goalService');

// GET /api/goals - List goals
router.get('/', async (req, res, next) => {
  try {
    const { quarter, business_area } = req.query;
    const data = await goalService.getGoals({ quarter, business_area });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/goals/tree - Get OKR tree with hierarchy
router.get('/tree', async (req, res, next) => {
  try {
    const { quarter } = req.query;
    const data = await goalService.getGoalTree({ quarter });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/goals/:id - Get goal with children
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await goalService.getGoalById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/goals - Create goal
router.post('/', async (req, res, next) => {
  try {
    const { title, goal_type } = req.body;

    if (!title || !goal_type) {
      return res.status(400).json({
        success: false,
        error: 'title and goal_type are required'
      });
    }

    const data = await goalService.createGoal(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/goals/:id - Update goal (including progress)
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await goalService.updateGoal(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/goals/:id - Delete goal
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await goalService.deleteGoal(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

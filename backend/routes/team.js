const express = require('express');
const router = express.Router();
const teamService = require('../services/teamService');

// GET /api/team - List team members
router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query;
    const data = await teamService.getMembers({ type });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// GET /api/team/:id - Get team member
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await teamService.getMemberById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// POST /api/team - Create team member
router.post('/', async (req, res, next) => {
  try {
    const data = await teamService.createMember(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/team/:id - Update team member
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await teamService.updateMember(id, req.body);

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

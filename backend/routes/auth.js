const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userService = require('../services/userService');

// POST /api/auth/logout - Acknowledgment endpoint
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// GET /api/auth/session - Verify token and return user profile
router.get('/session', authenticateToken, async (req, res, next) => {
  try {
    // Try to get full user from database
    const dbUser = await userService.getUserByUid(req.user.uid);
    res.json({
      success: true,
      user: {
        uid: req.user.uid,
        email: req.user.email,
        name: dbUser?.display_name || req.user.name,
        role: dbUser?.role || req.user.role
      }
    });
  } catch (err) {
    // Fallback to token data if DB is unavailable
    res.json({
      success: true,
      user: {
        uid: req.user.uid,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      }
    });
  }
});

// POST /api/auth/session/sync - Sync Firebase user to app_users on login
router.post('/session/sync', authenticateToken, async (req, res, next) => {
  try {
    const user = await userService.syncUser({
      uid: req.user.uid,
      email: req.user.email,
      displayName: req.user.name
    });
    res.json({
      success: true,
      user: {
        uid: user.firebase_uid,
        email: user.email,
        name: user.display_name,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

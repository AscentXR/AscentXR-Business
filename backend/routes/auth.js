const express = require('express');
const router = express.Router();
const {
  authenticateToken,
  checkRateLimit,
  recordLoginAttempt,
  authenticateUser,
  generateToken
} = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required'
    });
  }

  // Check rate limit
  if (checkRateLimit(ip)) {
    return res.status(429).json({
      success: false,
      error: 'Too many login attempts. Please try again in 15 minutes.'
    });
  }

  // Record this attempt
  recordLoginAttempt(ip);

  const user = await authenticateUser(username, password);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  const token = generateToken(user);

  res.json({
    success: true,
    token,
    user: {
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  // In a full implementation, we'd blacklist the token
  // For now, the client simply discards the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// GET /api/auth/session
router.get('/session', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      username: req.user.username,
      name: req.user.name,
      role: req.user.role
    }
  });
});

module.exports = router;

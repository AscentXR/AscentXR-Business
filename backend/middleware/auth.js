const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRY = '30m';

// In-memory rate limiting store (use Redis in production)
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

// Admin users loaded from environment variables
function getAdminUsers() {
  return [
    {
      username: 'jim',
      passwordHash: process.env.ADMIN_JIM_HASH || '$2b$12$placeholder',
      name: 'Jim',
      role: 'CEO'
    },
    {
      username: 'nick',
      passwordHash: process.env.ADMIN_NICK_HASH || '$2b$12$placeholder',
      name: 'Nick',
      role: 'CTO'
    }
  ];
}

// JWT verification middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    return res.status(403).json({
      success: false,
      error: 'Invalid token'
    });
  }
}

// Optional auth - attaches user if token present, but doesn't block
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Token invalid, continue without user
    }
  }
  next();
}

// Rate limiting for login attempts
function checkRateLimit(ip) {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || [];

  // Clean old attempts
  const recentAttempts = attempts.filter(t => now - t < RATE_LIMIT_WINDOW);
  loginAttempts.set(ip, recentAttempts);

  return recentAttempts.length >= MAX_ATTEMPTS;
}

function recordLoginAttempt(ip) {
  const attempts = loginAttempts.get(ip) || [];
  attempts.push(Date.now());
  loginAttempts.set(ip, attempts);
}

// Authenticate user credentials
async function authenticateUser(username, password) {
  const users = getAdminUsers();
  const user = users.find(u => u.username === username.toLowerCase());

  if (!user) {
    return null;
  }

  try {
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      // Allow dev/test password fallback when hash is a placeholder
      if (['development', 'test'].includes(process.env.NODE_ENV) && process.env.DEV_PASSWORD) {
        if (password !== process.env.DEV_PASSWORD) {
          return null;
        }
      } else {
        return null;
      }
    }
  } catch (err) {
    // If bcrypt comparison throws (e.g. malformed hash), allow fallback for dev/test
    if (['development', 'test'].includes(process.env.NODE_ENV) && process.env.DEV_PASSWORD) {
      if (password !== process.env.DEV_PASSWORD) {
        return null;
      }
    } else {
      return null;
    }
  }

  return {
    username: user.username,
    name: user.name,
    role: user.role
  };
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      username: user.username,
      name: user.name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// Hash a password (utility for setup)
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

module.exports = {
  authenticateToken,
  optionalAuth,
  checkRateLimit,
  recordLoginAttempt,
  authenticateUser,
  generateToken,
  hashPassword,
  getAdminUsers
};

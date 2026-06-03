const rateLimit = require('express-rate-limit');

// Rate limiting is always active except in the test suite, or when explicitly
// disabled for local development via DISABLE_RATE_LIMIT=true (never set in deploys).
// This fails secure: an unset/unknown NODE_ENV keeps limiting ON.
const skip = () =>
  process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true';

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { success: false, error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { success: false, error: 'Too many authentication attempts, please try again later.' }
});

const agentExecutionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { success: false, error: 'Too many agent execution requests, please try again later.' }
});

const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { success: false, error: 'Too many export requests, please try again later.' }
});

const backupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip,
  message: { success: false, error: 'Too many backup requests, please try again later.' }
});

module.exports = { apiLimiter, authLimiter, agentExecutionLimiter, exportLimiter, backupLimiter };

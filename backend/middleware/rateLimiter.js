const rateLimit = require('express-rate-limit');

const skip = () => process.env.NODE_ENV === 'test';

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

module.exports = { apiLimiter, authLimiter, agentExecutionLimiter, exportLimiter };

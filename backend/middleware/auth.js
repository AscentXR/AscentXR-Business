// Firebase Auth middleware - delegates to firebaseAuth.js
// Old JWT-based auth code archived below for rollback reference
const { authenticateToken, optionalAuth, requireAdmin } = require('./firebaseAuth');

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin
};

/*
 * ARCHIVED: Original JWT-based auth code
 * ========================================
 * const jwt = require('jsonwebtoken');
 * const bcrypt = require('bcrypt');
 * const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
 * const JWT_EXPIRY = '30m';
 * ...
 * See git history for full original implementation.
 */

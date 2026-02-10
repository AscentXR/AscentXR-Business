const { getAuth } = require('../config/firebase');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  try {
    const decoded = await getAuth().verifyIdToken(token, true);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email,
      role: decoded.role || 'viewer'
    };
    next();
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    if (err.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        error: 'Token revoked. Please sign in again.'
      });
    }
    if (err.code === 'auth/user-disabled') {
      return res.status(401).json({
        success: false,
        error: 'Account has been disabled'
      });
    }
    console.error('[Auth] Token verification failed:', err.code, err.message);
    return res.status(403).json({
      success: false,
      error: 'Invalid token'
    });
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  getAuth().verifyIdToken(token, true)
    .then(decoded => {
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || decoded.email,
        role: decoded.role || 'viewer'
      };
      next();
    })
    .catch(() => {
      next();
    });
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
}

module.exports = { authenticateToken, optionalAuth, requireAdmin };

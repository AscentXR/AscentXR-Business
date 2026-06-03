const { getAuth } = require('../config/firebase');

// INSECURE local-dev auth bypass. Decodes the Firebase JWT WITHOUT verifying its
// signature, so it must NEVER be reachable in a deployed environment. It requires
// BOTH an explicit positive opt-in (ALLOW_INSECURE_AUTH=true) AND a non-production
// NODE_ENV, and fails secure when NODE_ENV is unset/unknown unless explicitly opted in.
const ALLOW_INSECURE_AUTH =
  process.env.ALLOW_INSECURE_AUTH === 'true' && process.env.NODE_ENV !== 'production';

if (ALLOW_INSECURE_AUTH) {
  console.warn(
    '[Auth] ⚠️  INSECURE DEV AUTH ENABLED: JWT signatures are NOT verified. ' +
    'This must never be enabled in a deployed environment.'
  );
}

// Decode a JWT payload without signature verification (dev only)
function decodeTokenUnsafe(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return null;
  }
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Dev bypass: decode Firebase JWT without admin SDK verification (opt-in, non-prod only)
  if (ALLOW_INSECURE_AUTH) {
    const payload = decodeTokenUnsafe(token);
    if (payload) {
      req.user = {
        uid: payload.user_id || payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
        role: payload.role || 'admin'
      };
      return next();
    }
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

  if (ALLOW_INSECURE_AUTH) {
    const payload = decodeTokenUnsafe(token);
    if (payload) {
      req.user = {
        uid: payload.user_id || payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
        role: payload.role || 'admin'
      };
    }
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

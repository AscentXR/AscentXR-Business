const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const http = require('http');
require('dotenv').config();

const { authenticateToken, optionalAuth } = require('./middleware/auth');
const { requireAdmin } = require('./middleware/firebaseAuth');
const { readOnlyForViewers } = require('./middleware/rbac');
const { apiLimiter, authLimiter, agentExecutionLimiter, exportLimiter, backupLimiter } = require('./middleware/rateLimiter');
const { auditLog } = require('./middleware/auditLogger');
const { initWebSocket } = require('./websocket');
const { initCron } = require('./cron');
const { initFirebase, validateFirebaseCredentials } = require('./config/firebase');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Railway/reverse proxy (required for rate limiting and secure cookies)
app.set('trust proxy', 1);

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Initialize WebSocket
initWebSocket(server);

// Environment validation
if (process.env.NODE_ENV === 'production') {
  const warnings = [];
  if (!process.env.CORS_ALLOWED_ORIGINS) warnings.push('CORS_ALLOWED_ORIGINS not set - using defaults');
  if (process.env.DEV_PASSWORD) {
    console.error('FATAL: DEV_PASSWORD must not be set in production');
    process.exit(1);
  }
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIREBASE_PROJECT_ID) {
    warnings.push('Firebase credentials not configured');
  }
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('password@localhost')) {
    warnings.push('Database appears to use default credentials');
  }
  warnings.forEach(w => console.warn(`[SECURITY WARNING] ${w}`));
}

// Firebase Auth proxy - must be before helmet/body parsing/static files
// Proxies /__/auth/* to Firebase so OAuth flows are same-origin
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use(createProxyMiddleware({
  target: 'https://ascentxr-business.firebaseapp.com',
  changeOrigin: true,
  secure: true,
  pathFilter: '/__/**',
  on: {
    proxyRes(proxyRes) {
      delete proxyRes.headers['x-frame-options'];
    }
  }
}));

// Middleware - Helmet with security headers
const isDev = process.env.NODE_ENV !== 'production';
app.use(helmet({
  contentSecurityPolicy: isDev ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://apis.google.com", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://www.googleapis.com", "https://firebase.googleapis.com", "https://firebaseinstallations.googleapis.com"],
      fontSrc: ["'self'"],
      frameSrc: ["'self'", "https://ascentxr-business.firebaseapp.com", "https://accounts.google.com"],
      frameAncestors: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// CORS lockdown
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, curl, server-to-server)
    // Allow explicitly listed origins and the app's own production URL
    const selfOrigin = process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null;
    if (!origin || allowedOrigins.includes(origin) || (selfOrigin && origin === selfOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));

// Body parsing with size limit
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Global rate limiter
app.use('/api/', apiLimiter);

// Audit logging for write operations
app.use(auditLog);

// Serve React frontend build if it exists, otherwise fall back to legacy dashboard
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  // Hashed assets (JS/CSS) get long cache; index.html must never be cached
  app.use('/assets', express.static(path.join(frontendDist, 'assets'), {
    maxAge: '1y',
    immutable: true
  }));
  app.use(express.static(frontendDist, {
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    }
  }));
} else {
  app.use(express.static(path.join(__dirname, '..'), {
    extensions: ['html'],
    index: 'dashboard_v19.html'
  }));
}

// Health check endpoints (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Ascent XR Control Center',
    version: '20.1'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Ascent XR Backend API',
    version: '3.1.0',
    uptime: process.uptime()
  });
});

// Temporary migration endpoint - run migrations on demand
app.post('/api/run-migrations', async (req, res) => {
  try {
    const { runMigrations } = require('./db/connection');
    await runMigrations();
    res.json({ success: true, message: 'Migrations complete' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Auth Routes (rate-limited, no token required - these handle login/session)
app.use('/api/auth', authLimiter, require('./routes/auth'));

// Admin Routes - require admin role
app.use('/api/admin/users', authenticateToken, requireAdmin, require('./routes/admin/users'));
app.use('/api/admin/backup', authenticateToken, requireAdmin, backupLimiter, require('./routes/admin/backup'));

// ============================================================
// Protected API Routes - require authentication + RBAC
// ============================================================

// Existing routes
app.use('/api/linkedin', authenticateToken, readOnlyForViewers, require('./routes/linkedin'));
app.use('/api/crm', authenticateToken, readOnlyForViewers, require('./routes/crm'));
app.use('/api/documents', authenticateToken, readOnlyForViewers, require('./routes/documents'));
app.use('/api/export', authenticateToken, readOnlyForViewers, exportLimiter, require('./routes/export'));
// Agent execution routes (must be before /agents to avoid /:id catch-all conflict)
app.use('/api/agents', authenticateToken, readOnlyForViewers, agentExecutionLimiter, require('./routes/agentExecution'));
app.use('/api/agents', authenticateToken, readOnlyForViewers, require('./routes/agents'));
app.use('/api/metrics', authenticateToken, require('./routes/metrics'));

// New Control Center routes
app.use('/api/products', authenticateToken, readOnlyForViewers, require('./routes/products'));
app.use('/api/finance', authenticateToken, readOnlyForViewers, require('./routes/finance'));
app.use('/api/goals', authenticateToken, readOnlyForViewers, require('./routes/goals'));
app.use('/api/marketing', authenticateToken, readOnlyForViewers, require('./routes/marketing'));
app.use('/api/marketing', authenticateToken, readOnlyForViewers, require('./routes/marketingSkills'));
app.use('/api/sales', authenticateToken, readOnlyForViewers, require('./routes/salesSkills'));
app.use('/api/taxes', authenticateToken, readOnlyForViewers, require('./routes/taxes'));
app.use('/api/legal', authenticateToken, readOnlyForViewers, require('./routes/legal'));
app.use('/api/team', authenticateToken, readOnlyForViewers, require('./routes/team'));
app.use('/api/brand', authenticateToken, readOnlyForViewers, require('./routes/brand'));
app.use('/api/customer-success', authenticateToken, readOnlyForViewers, require('./routes/customerSuccess'));
app.use('/api/partnerships', authenticateToken, readOnlyForViewers, require('./routes/partnerships'));
app.use('/api/notifications', authenticateToken, readOnlyForViewers, require('./routes/notifications'));
app.use('/api/search', authenticateToken, require('./routes/search'));
app.use('/api/knowledge-base', authenticateToken, readOnlyForViewers, require('./routes/knowledgeBase'));
app.use('/api/business-activities', authenticateToken, readOnlyForViewers, require('./routes/businessActivities'));
app.use('/api/forecasts', authenticateToken, readOnlyForViewers, require('./routes/forecasts'));
app.use('/api/agent-teams', authenticateToken, readOnlyForViewers, require('./routes/agentTeams'));
app.use('/api/skill-calendar', authenticateToken, readOnlyForViewers, require('./routes/skillCalendar'));
app.use('/api/sales-dashboard', authenticateToken, require('./routes/salesDashboard'));
app.use('/api/marketing-dashboard', authenticateToken, require('./routes/marketingDashboard'));

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(err.stack);

  if (status >= 500 && process.env.NODE_ENV === 'production') {
    return res.status(status).json({
      error: {
        message: 'Internal server error',
        status
      }
    });
  }

  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      status
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'API route not found',
      status: 404
    }
  });
});

// SPA fallback - serve React index.html or legacy dashboard (no arbitrary file serving)
app.get('*', (req, res) => {
  const reactIndex = path.join(frontendDist, 'index.html');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  if (fs.existsSync(reactIndex)) {
    res.sendFile(reactIndex);
  } else {
    res.sendFile(path.join(__dirname, '..', 'dashboard_v19.html'));
  }
});

// Start server
if (require.main === module) {
  const { runMigrations } = require('./db/connection');
  runMigrations()
    .then(() => console.log('Migrations complete'))
    .catch(err => console.error('Migration error:', err.message));

  // Initialize Firebase and validate credentials before starting server
  initFirebase();
  validateFirebaseCredentials();

  server.listen(PORT, () => {
    console.log(`Ascent XR Control Center running on port ${PORT}`);
    console.log(`Dashboard: http://localhost:${PORT}/`);
    console.log(`API Health: http://localhost:${PORT}/api/health`);
    console.log(`WebSocket: ws://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // Initialize cron jobs
    initCron();
  });
}

module.exports = app;

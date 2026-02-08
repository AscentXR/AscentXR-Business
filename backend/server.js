const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const http = require('http');
require('dotenv').config();

const { authenticateToken, optionalAuth } = require('./middleware/auth');
const { initWebSocket } = require('./websocket');
const { initCron } = require('./cron');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Initialize WebSocket
initWebSocket(server);

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve React frontend build if it exists, otherwise fall back to legacy dashboard
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
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
    version: '20.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Ascent XR Backend API',
    version: '3.0.0',
    uptime: process.uptime()
  });
});

// Auth Routes (no auth required - these handle login)
app.use('/api/auth', require('./routes/auth'));

// ============================================================
// Protected API Routes - require JWT authentication
// ============================================================

// Existing routes
app.use('/api/linkedin', authenticateToken, require('./routes/linkedin'));
app.use('/api/crm', authenticateToken, require('./routes/crm'));
app.use('/api/documents', authenticateToken, require('./routes/documents'));
app.use('/api/export', authenticateToken, require('./routes/export'));
// Agent execution routes (must be before /agents to avoid /:id catch-all conflict)
app.use('/api/agents', authenticateToken, require('./routes/agentExecution'));
app.use('/api/agents', authenticateToken, require('./routes/agents'));
app.use('/api/metrics', authenticateToken, require('./routes/metrics'));

// New Control Center routes
app.use('/api/products', authenticateToken, require('./routes/products'));
app.use('/api/finance', authenticateToken, require('./routes/finance'));
app.use('/api/goals', authenticateToken, require('./routes/goals'));
app.use('/api/marketing', authenticateToken, require('./routes/marketing'));
app.use('/api/taxes', authenticateToken, require('./routes/taxes'));
app.use('/api/legal', authenticateToken, require('./routes/legal'));
app.use('/api/team', authenticateToken, require('./routes/team'));
app.use('/api/brand', authenticateToken, require('./routes/brand'));
app.use('/api/customer-success', authenticateToken, require('./routes/customerSuccess'));
app.use('/api/partnerships', authenticateToken, require('./routes/partnerships'));
app.use('/api/notifications', authenticateToken, require('./routes/notifications'));
app.use('/api/search', authenticateToken, require('./routes/search'));
app.use('/api/knowledge-base', authenticateToken, require('./routes/knowledgeBase'));
app.use('/api/business-activities', authenticateToken, require('./routes/businessActivities'));
app.use('/api/forecasts', authenticateToken, require('./routes/forecasts'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
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

// SPA fallback - serve React index.html or legacy dashboard
app.get('*', (req, res) => {
  const reactIndex = path.join(frontendDist, 'index.html');
  if (fs.existsSync(reactIndex)) {
    res.sendFile(reactIndex);
  } else {
    const requestedFile = path.join(__dirname, '..', req.path);
    if (fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()) {
      res.sendFile(requestedFile);
    } else {
      res.sendFile(path.join(__dirname, '..', 'dashboard_v19.html'));
    }
  }
});

// Start server
if (require.main === module) {
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

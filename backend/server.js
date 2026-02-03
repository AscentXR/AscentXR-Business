const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Create necessary directories
const directories = [
  process.env.UPLOAD_DIR || './uploads',
  process.env.DOCUMENTS_DIR || './documents',
  process.env.EXPORT_DIR || './exports'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Health check endpoint (for Railway)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Ascent XR Dashboard',
    version: '18.4'
  });
});

// API Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Ascent XR Backend API',
    version: '1.0.0'
  });
});

// LinkedIn API Routes
app.use('/api/linkedin', require('./routes/linkedin'));

// CRM API Routes
app.use('/api/crm', require('./routes/crm'));

// Documents API Routes
app.use('/api/documents', require('./routes/documents'));

// Export API Routes
app.use('/api/export', require('./routes/export'));

// Agent Tracking API Routes
app.use('/api/agents', require('./routes/agents'));

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Ascent XR Backend API running on port ${PORT}`);
    console.log(`📊 API Documentation: http://localhost:${PORT}/api/health`);
    console.log(`🔗 LinkedIn API: http://localhost:${PORT}/api/linkedin`);
    console.log(`📈 CRM API: http://localhost:${PORT}/api/crm`);
    console.log(`📄 Documents API: http://localhost:${PORT}/api/documents`);
    console.log(`📦 Export API: http://localhost:${PORT}/api/export`);
    console.log(`🤖 Agent Tracking: http://localhost:${PORT}/api/agents`);
  });
}

module.exports = app;
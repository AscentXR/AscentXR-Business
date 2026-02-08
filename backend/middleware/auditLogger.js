const winston = require('winston');
const path = require('path');

const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '..', 'logs', 'audit.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5
    })
  ]
});

function auditLog(req, res, next) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const start = Date.now();
    const originalEnd = res.end;
    res.end = function (...args) {
      const duration = Date.now() - start;
      auditLogger.info({
        action: req.method,
        path: req.originalUrl,
        user: req.user?.email || req.user?.uid || 'anonymous',
        role: req.user?.role || 'unknown',
        statusCode: res.statusCode,
        duration,
        ip: req.ip
      });
      originalEnd.apply(res, args);
    };
  }
  next();
}

module.exports = { auditLog, auditLogger };

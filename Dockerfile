# ASCENT XR DASHBOARD - PRODUCTION DOCKERFILE
# Multi-stage build for optimized production deployment

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application source
COPY backend/ ./

# Stage 2: Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app /app

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 3000, path: '/api/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]

# Labels for better maintainability
LABEL org.label-schema.name="ascent-xr-dashboard" \
      org.label-schema.description="Ascent XR Dashboard Backend API" \
      org.label-schema.vendor="Ascent XR" \
      org.label-schema.version="1.0.0" \
      org.label-schema.schema-version="1.0" \
      maintainer="Ascent XR Team <team@ascentxr.com>"
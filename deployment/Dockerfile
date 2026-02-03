# ASCENT XR DASHBOARD - Production Dockerfile
# Multi-stage build for optimal performance

# Stage 1: Build environment
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Copy frontend dashboard
COPY ascent_xr_dashboard_dark_with_ai.html ./public/
COPY agent_progress_tracker.py ./
COPY agent_progress_data.json ./

# Stage 2: Production runtime
FROM node:18-alpine

WORKDIR /app

# Install system dependencies for Python support
RUN apk add --no-cache python3 py3-pip

# Copy built artifacts from builder
COPY --from=builder /app /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if(r.statusCode!==200)throw new Error()})"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
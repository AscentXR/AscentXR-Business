# ASCENT XR CONTROL CENTER - PRODUCTION DOCKERFILE
# Multi-stage build: frontend + backend

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

# Firebase client config (public values, baked into frontend at build time)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID

WORKDIR /frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend with env vars available to Vite
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Stage 3: Production
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend from builder
COPY --from=backend-builder --chown=nodejs:nodejs /app /app

# Copy frontend build to where Express expects it: path.join(__dirname, '..', 'frontend', 'dist')
COPY --from=frontend-builder --chown=nodejs:nodejs /frontend/dist /frontend/dist

# Create required directories and ensure ownership
RUN mkdir -p /app/uploads /app/exports /app/documents && \
    chown -R nodejs:nodejs /app /frontend

# Switch to non-root user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = { host: 'localhost', port: 3000, path: '/api/health', timeout: 2000 }; const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]

# Labels
LABEL org.label-schema.name="ascent-xr-control-center" \
      org.label-schema.description="Ascent XR Business Control Center" \
      org.label-schema.vendor="Ascent XR" \
      org.label-schema.version="3.0.0" \
      org.label-schema.schema-version="1.0" \
      maintainer="Ascent XR Team <team@ascentxr.com>"

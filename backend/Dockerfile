# =============================================================================
# Multi-stage Dockerfile for NestJS Backend
# =============================================================================

# =============================================================================
# Base Stage - Common dependencies
# =============================================================================
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# =============================================================================
# Dependencies Stage - Install all dependencies
# =============================================================================
FROM base AS dependencies

# Install all dependencies (including dev dependencies)
RUN npm ci --only=production --silent && npm cache clean --force

# =============================================================================
# Development Stage - For local development with hot reload
# =============================================================================
FROM base AS development

# Install all dependencies including dev dependencies
RUN npm ci --silent && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3001
EXPOSE 9229

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the application in development mode
CMD ["dumb-init", "npm", "run", "start:debug"]

# =============================================================================
# Build Stage - Build the application
# =============================================================================
FROM dependencies AS build

# Copy source code
COPY . .

# Build the application
RUN npm run build

# =============================================================================
# Production Stage - Optimized for production
# =============================================================================
FROM base AS production

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["dumb-init", "node", "dist/main.js"]

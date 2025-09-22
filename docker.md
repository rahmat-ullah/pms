# Containerization & Deployment Architecture (Docker, Kubernetes)

## 1. Executive Summary

This document defines the comprehensive containerization strategy and deployment architecture for the Project Management Software (PMS), designed to support scalable, reliable, and maintainable deployments across development, staging, and production environments. The architecture leverages Docker for containerization and provides pathways for both Docker Compose and Kubernetes orchestration.

### 1.1 Containerization Goals

#### Primary Objectives
* **Environment Consistency**: Identical runtime environments across development, staging, and production
* **Scalability**: Horizontal scaling capabilities for high-traffic scenarios
* **Reliability**: Self-healing deployments with automatic recovery mechanisms
* **Security**: Container-level security with minimal attack surface
* **Maintainability**: Simplified deployment processes and infrastructure management
* **Cost Efficiency**: Optimized resource utilization and infrastructure costs

#### Deployment Strategy
* **Development**: Docker Compose for local development with hot reloading
* **Staging**: Docker Compose or lightweight Kubernetes for testing
* **Production**: Kubernetes orchestration with enterprise-grade features
* **CI/CD Integration**: Automated build, test, and deployment pipelines

### 1.2 Architecture Principles

#### Microservices-Ready Design
* **Service Isolation**: Each component runs in dedicated containers
* **Loose Coupling**: Services communicate via well-defined APIs
* **Independent Scaling**: Individual services can scale based on demand
* **Fault Isolation**: Service failures don't cascade to other components

#### Infrastructure as Code
* **Declarative Configuration**: All infrastructure defined in version-controlled files
* **Reproducible Deployments**: Consistent deployments across environments
* **Automated Provisioning**: Infrastructure provisioning through automation
* **Configuration Management**: Centralized configuration with environment-specific overrides

## 2. Service Architecture & Container Design

### 2.1 Service Composition Overview

The application is decomposed into the following containerized services:

#### Core Application Services
* **frontend**: Next.js application serving the user interface
* **backend**: NestJS API server handling business logic and data operations
* **worker**: Background job processor for async operations (optional)

#### Data & Storage Services
* **mongodb**: Primary database for application data
* **redis**: Caching and session storage (optional but recommended)
* **minio**: S3-compatible object storage for file management

#### Supporting Services
* **nginx**: Reverse proxy and load balancer
* **mongo-express**: Database administration interface (development only)
* **minio-mc**: MinIO client for bucket initialization
* **prometheus**: Metrics collection (production)
* **grafana**: Monitoring dashboards (production)

### 2.2 Container Design Principles

#### Multi-Stage Builds
```dockerfile
# Example multi-stage build for optimized production images
FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
EXPOSE 3000
USER node
CMD ["npm", "start"]
```

#### Security Hardening
* **Non-root User**: All containers run as non-root users
* **Minimal Base Images**: Alpine Linux for reduced attack surface
* **Read-only Filesystems**: Containers run with read-only root filesystems where possible
* **Resource Limits**: CPU and memory limits defined for all containers
* **Security Scanning**: Automated vulnerability scanning in CI/CD pipeline

#### Performance Optimization
* **Layer Caching**: Optimized Dockerfile layer ordering for build cache efficiency
* **Image Size**: Minimized image sizes through multi-stage builds and .dockerignore
* **Startup Time**: Optimized container startup times through efficient initialization
* **Resource Efficiency**: Right-sized containers with appropriate resource allocations

## 3. Project Structure & Organization

### 3.1 Directory Layout

```
project-root/
├── .github/
│   └── workflows/              # GitHub Actions CI/CD pipelines
│       ├── build-and-test.yml
│       ├── deploy-staging.yml
│       └── deploy-production.yml
├── infra/                      # Infrastructure and deployment configurations
│   ├── docker/                 # Docker-related configurations
│   │   ├── docker-compose.yml  # Development environment
│   │   ├── docker-compose.staging.yml
│   │   ├── docker-compose.prod.yml
│   │   └── nginx/
│   │       ├── nginx.conf      # Main nginx configuration
│   │       ├── default.conf    # Default site configuration
│   │       └── ssl/            # SSL certificates
│   ├── kubernetes/             # Kubernetes manifests
│   │   ├── namespace.yaml
│   │   ├── configmaps/
│   │   ├── secrets/
│   │   ├── deployments/
│   │   ├── services/
│   │   ├── ingress/
│   │   └── monitoring/
│   ├── terraform/              # Infrastructure as Code (optional)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── modules/
│   └── scripts/                # Deployment and utility scripts
│       ├── init-minio.sh
│       ├── setup-dev.sh
│       ├── backup-db.sh
│       └── deploy.sh
├── frontend/                   # Next.js application
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── .dockerignore
│   └── ...
├── backend/                    # NestJS API
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── .dockerignore
│   └── ...
├── shared/                     # Shared types and utilities
│   └── types/
├── docs/                       # Documentation
│   ├── api/
│   ├── deployment/
│   └── architecture/
├── .env.example               # Environment variables template
├── .env.development           # Development environment variables
├── docker-compose.yml         # Main development compose file
├── docker-compose.override.yml # Local overrides
└── README.md
```

### 3.2 Configuration Management Strategy

#### Environment-Specific Configurations
```yaml
# Base docker-compose.yml
version: '3.9'
services:
  backend:
    build: ./backend
    environment:
      - NODE_ENV=${NODE_ENV:-development}
    env_file:
      - .env.${NODE_ENV:-development}

# docker-compose.staging.yml (override)
version: '3.9'
services:
  backend:
    image: registry.company.com/pms-backend:${VERSION}
    environment:
      - NODE_ENV=staging
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

#### Secret Management
```yaml
# Development: .env files
# Staging/Production: External secret management
secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
  s3_credentials:
    external: true

services:
  backend:
    secrets:
      - db_password
      - jwt_secret
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
```

## 4. Environment Configuration & Variables

### 4.1 Environment Variable Strategy

#### Configuration Hierarchy
1. **Default Values**: Hardcoded defaults in application code
2. **Environment Files**: `.env` files for development
3. **Container Environment**: Environment variables in container runtime
4. **External Secrets**: Secret management systems for production
5. **Runtime Configuration**: Dynamic configuration from external sources

#### Environment-Specific Variable Files

##### Development Environment (`.env.development`)
```bash
# Application Environment
NODE_ENV=development
TZ=Asia/Dhaka
LOG_LEVEL=debug

# Application Ports
FRONTEND_PORT=3000
BACKEND_PORT=8080
NGINX_PORT=8088

# Database Configuration
MONGODB_URI=mongodb://mongodb:27017/pm_dev
MONGODB_DB=pm_dev
MONGODB_AUTH_SOURCE=admin

# Redis Configuration (optional)
REDIS_URL=redis://redis:6379
REDIS_DB=0

# Authentication & Security
JWT_SECRET=development-secret-change-in-production
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=1209600
REFRESH_COOKIE_NAME=pm_refresh
BCRYPT_ROUNDS=10

# Object Storage (MinIO for development)
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=pm-docs-dev
S3_USE_PATH_STYLE=true

# MinIO Configuration
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_CONSOLE_PORT=9001

# Email Configuration (development)
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@pms-dev.local

# Monitoring & Observability
ENABLE_METRICS=true
METRICS_PORT=9090
ENABLE_TRACING=false

# Feature Flags
ENABLE_REGISTRATION=true
ENABLE_FILE_UPLOAD=true
ENABLE_NOTIFICATIONS=true
```

##### Staging Environment (`.env.staging`)
```bash
# Application Environment
NODE_ENV=staging
TZ=Asia/Dhaka
LOG_LEVEL=info

# Application Configuration
FRONTEND_URL=https://pms-staging.company.com
BACKEND_URL=https://api-staging.pms.company.com
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://mongodb-staging:27017/pm_staging
MONGODB_DB=pm_staging
MONGODB_AUTH_SOURCE=admin
MONGODB_SSL=true

# Redis Configuration
REDIS_URL=redis://redis-staging:6379
REDIS_DB=0
REDIS_PASSWORD=${REDIS_PASSWORD}

# Authentication & Security
JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=1209600
REFRESH_COOKIE_NAME=pm_refresh_staging
BCRYPT_ROUNDS=12

# Object Storage (AWS S3)
S3_ENDPOINT=https://s3.amazonaws.com
S3_REGION=us-east-1
S3_ACCESS_KEY=${AWS_ACCESS_KEY_ID}
S3_SECRET_KEY=${AWS_SECRET_ACCESS_KEY}
S3_BUCKET=pm-docs-staging
S3_USE_PATH_STYLE=false

# Email Configuration
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
EMAIL_FROM=noreply@company.com

# Monitoring & Observability
ENABLE_METRICS=true
METRICS_PORT=9090
ENABLE_TRACING=true
JAEGER_ENDPOINT=${JAEGER_ENDPOINT}

# External Services
SENTRY_DSN=${SENTRY_DSN}
ANALYTICS_ID=${ANALYTICS_ID}

# Feature Flags
ENABLE_REGISTRATION=false
ENABLE_FILE_UPLOAD=true
ENABLE_NOTIFICATIONS=true
```

##### Production Environment (`.env.production`)
```bash
# Application Environment
NODE_ENV=production
TZ=Asia/Dhaka
LOG_LEVEL=warn

# Application Configuration
FRONTEND_URL=https://pms.company.com
BACKEND_URL=https://api.pms.company.com
API_VERSION=v1

# Database Configuration (from secrets)
MONGODB_URI=${MONGODB_URI}
MONGODB_DB=pm_production
MONGODB_AUTH_SOURCE=admin
MONGODB_SSL=true
MONGODB_REPLICA_SET=rs0

# Redis Configuration (from secrets)
REDIS_URL=${REDIS_URL}
REDIS_DB=0
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_CLUSTER_MODE=true

# Authentication & Security (from secrets)
JWT_SECRET=${JWT_SECRET}
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=1209600
REFRESH_COOKIE_NAME=pm_refresh
BCRYPT_ROUNDS=12

# Object Storage (AWS S3 from secrets)
S3_ENDPOINT=https://s3.amazonaws.com
S3_REGION=us-east-1
S3_ACCESS_KEY=${AWS_ACCESS_KEY_ID}
S3_SECRET_KEY=${AWS_SECRET_ACCESS_KEY}
S3_BUCKET=pm-docs-production
S3_USE_PATH_STYLE=false
S3_CLOUDFRONT_DOMAIN=${CLOUDFRONT_DOMAIN}

# Email Configuration (from secrets)
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
EMAIL_FROM=noreply@company.com

# Monitoring & Observability
ENABLE_METRICS=true
METRICS_PORT=9090
ENABLE_TRACING=true
JAEGER_ENDPOINT=${JAEGER_ENDPOINT}
PROMETHEUS_ENDPOINT=${PROMETHEUS_ENDPOINT}

# External Services (from secrets)
SENTRY_DSN=${SENTRY_DSN}
ANALYTICS_ID=${ANALYTICS_ID}
SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}

# Security Configuration
CORS_ORIGINS=${CORS_ORIGINS}
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
HELMET_ENABLED=true

# Performance Configuration
CLUSTER_MODE=true
CLUSTER_WORKERS=0  # Use all available CPUs
CACHE_TTL=3600
COMPRESSION_ENABLED=true

# Feature Flags
ENABLE_REGISTRATION=false
ENABLE_FILE_UPLOAD=true
ENABLE_NOTIFICATIONS=true
MAINTENANCE_MODE=false
```

### 4.2 Secret Management Strategy

#### Development Secrets
```bash
# .env.development.local (not committed to version control)
JWT_SECRET=dev-secret-key-change-me
MONGODB_ROOT_PASSWORD=dev-password
REDIS_PASSWORD=dev-redis-password
```

#### Production Secret Management
```yaml
# Kubernetes Secrets
apiVersion: v1
kind: Secret
metadata:
  name: pms-secrets
type: Opaque
data:
  jwt-secret: <base64-encoded-secret>
  mongodb-uri: <base64-encoded-uri>
  redis-password: <base64-encoded-password>
  aws-access-key: <base64-encoded-key>
  aws-secret-key: <base64-encoded-secret>
  smtp-password: <base64-encoded-password>
```

#### Environment Variable Validation
```typescript
// Environment variable validation schema
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().default(8080),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  S3_BUCKET: z.string().min(1),
  // ... other validations
});

export const env = envSchema.parse(process.env);
```

## 5. Optimized Dockerfile Configurations

### 5.1 Frontend Dockerfile (Next.js)

#### Production Dockerfile (`/frontend/Dockerfile`)
```dockerfile
# Multi-stage build for optimized production image
FROM node:20-alpine AS dependencies
LABEL stage=dependencies

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Build stage
FROM node:20-alpine AS builder
LABEL stage=builder

RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source code and build
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner
LABEL stage=runner

# Install security updates and dumb-init for proper signal handling
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port and set environment
EXPOSE 3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

#### Development Dockerfile (`/frontend/Dockerfile.dev`)
```dockerfile
FROM node:20-alpine

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy package files
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Set ownership and switch to non-root user
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Development command with hot reloading
CMD ["npm", "run", "dev"]
```

### 5.2 Backend Dockerfile (NestJS)

#### Production Dockerfile (`/backend/Dockerfile`)
```dockerfile
# Dependencies stage
FROM node:20-alpine AS dependencies
LABEL stage=dependencies

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# Build stage
FROM node:20-alpine AS builder
LABEL stage=builder

RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy source code and build
COPY . .
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner
LABEL stage=runner

# Install security updates and dumb-init
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init curl && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy production dependencies and built application
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Copy any additional runtime files
COPY --from=builder /app/prisma ./prisma 2>/dev/null || true

# Set ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port and set environment
EXPOSE 8080
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

#### Development Dockerfile (`/backend/Dockerfile.dev`)
```dockerfile
FROM node:20-alpine

# Install security updates and development tools
RUN apk update && apk upgrade && \
    apk add --no-cache libc6-compat dumb-init curl && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy package files
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Set ownership and switch to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 8080

# Development command with hot reloading
CMD ["npm", "run", "start:dev"]
```

### 5.3 Dockerfile Best Practices

#### Security Hardening
```dockerfile
# Security best practices applied to all Dockerfiles

# 1. Use specific base image versions
FROM node:20.11.0-alpine

# 2. Run as non-root user
RUN addgroup --system --gid 1001 appuser && \
    adduser --system --uid 1001 appuser
USER appuser

# 3. Use read-only root filesystem (where possible)
# Add to docker-compose.yml or Kubernetes deployment:
# read_only: true
# tmpfs:
#   - /tmp
#   - /var/cache

# 4. Set resource limits
# Add to docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 512M
#       cpus: '0.5'

# 5. Use HEALTHCHECK for container health monitoring
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# 6. Use proper signal handling
ENTRYPOINT ["dumb-init", "--"]
```

#### Performance Optimization
```dockerfile
# Performance optimization techniques

# 1. Optimize layer caching by copying package files first
COPY package*.json ./
RUN npm ci

# 2. Use .dockerignore to exclude unnecessary files
# .dockerignore content:
# node_modules
# .git
# .env*
# *.md
# .vscode
# coverage
# .nyc_output

# 3. Multi-stage builds to reduce final image size
FROM node:20-alpine AS builder
# ... build steps ...

FROM node:20-alpine AS runner
COPY --from=builder /app/dist ./dist

# 4. Clean package manager cache
RUN npm ci --only=production && npm cache clean --force

# 5. Remove unnecessary packages after installation
RUN apk del .build-deps
```

## 6. Docker Compose Configurations

### 6.1 Development Environment (`docker-compose.yml`)

```yaml
version: '3.9'

# Define custom networks for service isolation
networks:
  pms-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

# Define named volumes for data persistence
volumes:
  mongodb_data:
    driver: local
  minio_data:
    driver: local
  redis_data:
    driver: local

services:
  # Database Services
  mongodb:
    image: mongo:7.0
    container_name: pms_mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_ROOT_USER:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_ROOT_PASSWORD:-password}
      MONGO_INITDB_DATABASE: ${MONGODB_DB:-pm_dev}
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./infra/mongodb/init-scripts:/docker-entrypoint-initdb.d:ro
    networks:
      - pms-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  redis:
    image: redis:7.2-alpine
    container_name: pms_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-devpassword}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - pms-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 3s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 128M
          cpus: '0.25'

  # Object Storage
  minio:
    image: quay.io/minio/minio:RELEASE.2024-01-16T16-07-38Z
    container_name: pms_minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
      MINIO_BROWSER_REDIRECT_URL: http://localhost:9001
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    networks:
      - pms-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'

  # MinIO Client for bucket initialization
  minio-mc:
    image: minio/mc:latest
    container_name: pms_minio_mc
    depends_on:
      minio:
        condition: service_healthy
    networks:
      - pms-network
    entrypoint: >
      /bin/sh -c "
      echo 'Waiting for MinIO to be ready...';
      sleep 10;
      mc alias set local http://minio:9000 ${MINIO_ROOT_USER:-minioadmin} ${MINIO_ROOT_PASSWORD:-minioadmin};
      mc mb -p local/${S3_BUCKET:-pm-docs-dev} || true;
      mc anonymous set none local/${S3_BUCKET:-pm-docs-dev};
      mc policy set public local/${S3_BUCKET:-pm-docs-dev}/public || true;
      echo 'MinIO bucket setup complete';
      "
    restart: "no"

  # Application Services
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: pms_backend
    restart: unless-stopped
    environment:
      NODE_ENV: development
      PORT: 8080
      MONGODB_URI: mongodb://${MONGODB_ROOT_USER:-admin}:${MONGODB_ROOT_PASSWORD:-password}@mongodb:27017/${MONGODB_DB:-pm_dev}?authSource=admin
      REDIS_URL: redis://:${REDIS_PASSWORD:-devpassword}@redis:6379
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: ${MINIO_ROOT_USER:-minioadmin}
      S3_SECRET_KEY: ${MINIO_ROOT_PASSWORD:-minioadmin}
      S3_BUCKET: ${S3_BUCKET:-pm-docs-dev}
      S3_USE_PATH_STYLE: "true"
      JWT_SECRET: ${JWT_SECRET:-development-secret-key}
    ports:
      - "8080:8080"
      - "9229:9229"  # Debug port
    volumes:
      - ./backend:/app
      - /app/node_modules
      - ./shared:/app/shared:ro
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio-mc:
        condition: service_completed_successfully
    networks:
      - pms-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: pms_frontend
    restart: unless-stopped
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_BASE_URL: http://localhost:8080
      NEXT_PUBLIC_S3_BUCKET_URL: http://localhost:9000
      WATCHPACK_POLLING: "true"  # Enable polling for file changes in Docker
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
      - ./shared:/app/shared:ro
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - pms-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'

  # Development Tools
  mongo-express:
    image: mongo-express:1.0.2-20
    container_name: pms_mongo_express
    restart: unless-stopped
    environment:
      ME_CONFIG_MONGODB_SERVER: mongodb
      ME_CONFIG_MONGODB_PORT: 27017
      ME_CONFIG_MONGODB_ADMINUSERNAME: ${MONGODB_ROOT_USER:-admin}
      ME_CONFIG_MONGODB_ADMINPASSWORD: ${MONGODB_ROOT_PASSWORD:-password}
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: ${MONGO_EXPRESS_PASSWORD:-admin}
    ports:
      - "8081:8081"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - pms-network
    profiles:
      - dev-tools

  # Reverse Proxy (Optional)
  nginx:
    image: nginx:1.25-alpine
    container_name: pms_nginx
    restart: unless-stopped
    ports:
      - "${NGINX_PORT:-8088}:80"
    volumes:
      - ./infra/nginx/development.conf:/etc/nginx/conf.d/default.conf:ro
      - ./infra/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      frontend:
        condition: service_healthy
      backend:
        condition: service_healthy
    networks:
      - pms-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    profiles:
      - nginx
```

### 6.2 Staging Environment (`docker-compose.staging.yml`)

```yaml
version: '3.9'

# Override for staging environment
services:
  mongodb:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGODB_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGODB_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGODB_DB}
    volumes:
      - mongodb_staging_data:/data/db
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'

  redis:
    image: redis:7.2-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_staging_data:/data
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  backend:
    image: ${DOCKER_REGISTRY}/pms-backend:${VERSION}
    environment:
      NODE_ENV: staging
      MONGODB_URI: ${MONGODB_URI}
      REDIS_URL: ${REDIS_URL}
      S3_ENDPOINT: https://s3.amazonaws.com
      S3_ACCESS_KEY: ${AWS_ACCESS_KEY_ID}
      S3_SECRET_KEY: ${AWS_SECRET_ACCESS_KEY}
      S3_BUCKET: ${S3_BUCKET}
      S3_USE_PATH_STYLE: "false"
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3

  frontend:
    image: ${DOCKER_REGISTRY}/pms-frontend:${VERSION}
    environment:
      NODE_ENV: staging
      NEXT_PUBLIC_API_BASE_URL: ${FRONTEND_API_URL}
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'

  nginx:
    image: nginx:1.25-alpine
    volumes:
      - ./infra/nginx/staging.conf:/etc/nginx/conf.d/default.conf:ro
      - ./infra/ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'

volumes:
  mongodb_staging_data:
    external: true
  redis_staging_data:
    external: true

# Remove development tools
profiles:
  - staging
```

### 6.3 Nginx Configuration

#### Development Configuration (`infra/nginx/development.conf`)
```nginx
upstream backend {
    server pms_backend:8080;
}

upstream frontend {
    server pms_frontend:3000;
}

server {
    listen 80;
    server_name localhost;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # API routes
    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;

        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Frontend routes
    location / {
        proxy_pass http://frontend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support for Next.js hot reloading
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### Production Configuration (`infra/nginx/production.conf`)
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

# Upstream definitions
upstream backend {
    least_conn;
    server backend-1:8080 max_fails=3 fail_timeout=30s;
    server backend-2:8080 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream frontend {
    least_conn;
    server frontend-1:3000 max_fails=3 fail_timeout=30s;
    server frontend-2:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# SSL configuration
server {
    listen 80;
    server_name pms.company.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pms.company.com;

    # SSL configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # API routes with rate limiting
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://backend/auth/login;
        include /etc/nginx/proxy_params;
    }

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend/;
        include /etc/nginx/proxy_params;
    }

    # Static assets with caching
    location /_next/static/ {
        proxy_pass http://frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Frontend routes
    location / {
        proxy_pass http://frontend/;
        include /etc/nginx/proxy_params;
    }
}
```

## 7. Development Workflow & Automation

### 7.1 Makefile for Development Convenience

```makefile
# Project Management System - Development Makefile

# Variables
COMPOSE_FILE := docker-compose.yml
COMPOSE_DEV := docker-compose.yml
COMPOSE_STAGING := docker-compose.staging.yml
PROJECT_NAME := pms

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

.PHONY: help build up down logs clean test lint format seed backup restore

# Default target
help: ## Show this help message
	@echo "$(BLUE)Project Management System - Development Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development Environment
build: ## Build all containers
	@echo "$(YELLOW)Building containers...$(NC)"
	docker compose -f $(COMPOSE_DEV) build --no-cache

up: ## Start development environment
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker compose -f $(COMPOSE_DEV) up -d
	@echo "$(GREEN)Services started successfully!$(NC)"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:8080"
	@echo "MongoDB Express: http://localhost:8081"
	@echo "MinIO Console: http://localhost:9001"

up-build: ## Build and start development environment
	@echo "$(YELLOW)Building and starting development environment...$(NC)"
	docker compose -f $(COMPOSE_DEV) up -d --build

down: ## Stop development environment
	@echo "$(RED)Stopping development environment...$(NC)"
	docker compose -f $(COMPOSE_DEV) down

down-volumes: ## Stop and remove volumes
	@echo "$(RED)Stopping and removing volumes...$(NC)"
	docker compose -f $(COMPOSE_DEV) down -v

restart: down up ## Restart development environment

# Logging and Monitoring
logs: ## Show logs for all services
	docker compose -f $(COMPOSE_DEV) logs -f --tail=100

logs-backend: ## Show backend logs
	docker compose -f $(COMPOSE_DEV) logs -f backend

logs-frontend: ## Show frontend logs
	docker compose -f $(COMPOSE_DEV) logs -f frontend

logs-db: ## Show database logs
	docker compose -f $(COMPOSE_DEV) logs -f mongodb

# Development Tools
shell-backend: ## Open shell in backend container
	docker compose -f $(COMPOSE_DEV) exec backend sh

shell-frontend: ## Open shell in frontend container
	docker compose -f $(COMPOSE_DEV) exec frontend sh

shell-db: ## Open MongoDB shell
	docker compose -f $(COMPOSE_DEV) exec mongodb mongosh

# Database Operations
seed: ## Seed database with sample data
	@echo "$(YELLOW)Seeding database...$(NC)"
	docker compose -f $(COMPOSE_DEV) exec backend npm run seed

backup: ## Backup database
	@echo "$(YELLOW)Creating database backup...$(NC)"
	mkdir -p ./backups
	docker compose -f $(COMPOSE_DEV) exec mongodb mongodump --out /tmp/backup
	docker compose -f $(COMPOSE_DEV) cp mongodb:/tmp/backup ./backups/$(shell date +%Y%m%d_%H%M%S)

restore: ## Restore database from backup (specify BACKUP_DIR)
	@if [ -z "$(BACKUP_DIR)" ]; then \
		echo "$(RED)Please specify BACKUP_DIR: make restore BACKUP_DIR=./backups/20240115_143000$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Restoring database from $(BACKUP_DIR)...$(NC)"
	docker compose -f $(COMPOSE_DEV) cp $(BACKUP_DIR) mongodb:/tmp/restore
	docker compose -f $(COMPOSE_DEV) exec mongodb mongorestore /tmp/restore

# Code Quality
test: ## Run tests
	@echo "$(YELLOW)Running tests...$(NC)"
	docker compose -f $(COMPOSE_DEV) exec backend npm test
	docker compose -f $(COMPOSE_DEV) exec frontend npm test

test-e2e: ## Run end-to-end tests
	@echo "$(YELLOW)Running E2E tests...$(NC)"
	docker compose -f $(COMPOSE_DEV) exec frontend npm run test:e2e

lint: ## Run linting
	@echo "$(YELLOW)Running linting...$(NC)"
	docker compose -f $(COMPOSE_DEV) exec backend npm run lint
	docker compose -f $(COMPOSE_DEV) exec frontend npm run lint

format: ## Format code
	@echo "$(YELLOW)Formatting code...$(NC)"
	docker compose -f $(COMPOSE_DEV) exec backend npm run format
	docker compose -f $(COMPOSE_DEV) exec frontend npm run format

# Cleanup
clean: ## Clean up containers, images, and volumes
	@echo "$(RED)Cleaning up...$(NC)"
	docker compose -f $(COMPOSE_DEV) down -v --remove-orphans
	docker system prune -f
	docker volume prune -f

clean-all: ## Clean everything including images
	@echo "$(RED)Cleaning everything...$(NC)"
	docker compose -f $(COMPOSE_DEV) down -v --remove-orphans --rmi all
	docker system prune -af
	docker volume prune -f

# Staging Environment
staging-up: ## Start staging environment
	@echo "$(GREEN)Starting staging environment...$(NC)"
	docker compose -f $(COMPOSE_STAGING) up -d

staging-down: ## Stop staging environment
	@echo "$(RED)Stopping staging environment...$(NC)"
	docker compose -f $(COMPOSE_STAGING) down

staging-logs: ## Show staging logs
	docker compose -f $(COMPOSE_STAGING) logs -f

# Health Checks
health: ## Check service health
	@echo "$(BLUE)Checking service health...$(NC)"
	@docker compose -f $(COMPOSE_DEV) ps
	@echo ""
	@echo "$(BLUE)Backend Health:$(NC)"
	@curl -s http://localhost:8080/health || echo "Backend not responding"
	@echo ""
	@echo "$(BLUE)Frontend Health:$(NC)"
	@curl -s http://localhost:3000/api/health || echo "Frontend not responding"

# Security
security-scan: ## Run security scans on containers
	@echo "$(YELLOW)Running security scans...$(NC)"
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
		aquasec/trivy image $(PROJECT_NAME)_backend:latest
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
		aquasec/trivy image $(PROJECT_NAME)_frontend:latest
```

### 7.2 Development Scripts

#### Setup Script (`infra/scripts/setup-dev.sh`)
```bash
#!/bin/bash

# Development Environment Setup Script
set -e

echo "🚀 Setting up PMS Development Environment..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Create environment file if it doesn't exist
if [ ! -f .env.development ]; then
    echo "📝 Creating .env.development file..."
    cp .env.example .env.development
    echo "✅ Please review and update .env.development with your settings"
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p backups
mkdir -p infra/ssl

# Build and start services
echo "🔨 Building containers..."
docker compose build

echo "🚀 Starting services..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Initialize MinIO buckets
echo "🪣 Initializing MinIO buckets..."
docker compose exec minio-mc sh -c "
    mc alias set local http://minio:9000 minioadmin minioadmin
    mc mb -p local/pm-docs-dev || true
    mc policy set public local/pm-docs-dev/public || true
"

# Seed database
echo "🌱 Seeding database..."
docker compose exec backend npm run seed

echo "✅ Development environment setup complete!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:8080"
echo "   API Docs: http://localhost:8080/docs"
echo "   MongoDB Express: http://localhost:8081"
echo "   MinIO Console: http://localhost:9001"
echo ""
echo "🔧 Useful commands:"
echo "   make logs          - View all logs"
echo "   make shell-backend - Backend shell"
echo "   make shell-frontend - Frontend shell"
echo "   make down          - Stop services"
```

## 8. Production Deployment Strategy

### 8.1 Kubernetes Migration Path

#### Namespace Configuration
```yaml
# infra/kubernetes/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: pms-production
  labels:
    name: pms-production
    environment: production
```

#### ConfigMap for Application Configuration
```yaml
# infra/kubernetes/configmaps/app-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pms-config
  namespace: pms-production
data:
  NODE_ENV: "production"
  TZ: "Asia/Dhaka"
  LOG_LEVEL: "warn"
  FRONTEND_URL: "https://pms.company.com"
  BACKEND_URL: "https://api.pms.company.com"
  S3_REGION: "us-east-1"
  S3_BUCKET: "pm-docs-production"
  REDIS_DB: "0"
```

#### Secret Management
```yaml
# infra/kubernetes/secrets/app-secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: pms-secrets
  namespace: pms-production
type: Opaque
data:
  mongodb-uri: <base64-encoded-uri>
  jwt-secret: <base64-encoded-secret>
  redis-password: <base64-encoded-password>
  aws-access-key: <base64-encoded-key>
  aws-secret-key: <base64-encoded-secret>
```

### 8.2 CI/CD Pipeline Integration

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push Backend
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-backend:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Build and push Frontend
      uses: docker/build-push-action@v5
      with:
        context: ./frontend
        push: true
        tags: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}-frontend:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Deploy to Production
      run: |
        # Update Kubernetes manifests with new image tags
        # Deploy using kubectl or ArgoCD
        echo "Deploying to production..."
```

### 8.3 Monitoring & Observability

#### Prometheus Configuration
```yaml
# infra/kubernetes/monitoring/prometheus-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    scrape_configs:
    - job_name: 'pms-backend'
      static_configs:
      - targets: ['backend-service:8080']
      metrics_path: /metrics
    - job_name: 'pms-frontend'
      static_configs:
      - targets: ['frontend-service:3000']
      metrics_path: /api/metrics
```

---

## 9. Security & Compliance

### 9.1 Container Security Best Practices

#### Security Scanning Pipeline
```bash
# Security scanning in CI/CD
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image --severity HIGH,CRITICAL \
  pms-backend:latest

# Runtime security monitoring
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  falcosecurity/falco:latest
```

#### Network Security
```yaml
# Network policies for Kubernetes
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: pms-network-policy
spec:
  podSelector:
    matchLabels:
      app: pms
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: nginx-ingress
    ports:
    - protocol: TCP
      port: 8080
```

### 9.2 Backup & Disaster Recovery

#### Automated Backup Strategy
```bash
#!/bin/bash
# infra/scripts/backup-production.sh

# MongoDB backup
kubectl exec -n pms-production deployment/mongodb -- \
  mongodump --out /tmp/backup-$(date +%Y%m%d)

# S3 backup verification
aws s3 sync s3://pm-docs-production s3://pm-docs-backup-$(date +%Y%m%d)

# Backup retention (keep 30 days)
find /backups -name "backup-*" -mtime +30 -delete
```

---
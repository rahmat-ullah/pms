# 🚀 Development Environment Setup Guide

## Prerequisites

- **Node.js**: Version 18+ 
- **Docker**: Latest version with Docker Compose
- **Git**: For version control

## 🔧 Quick Start

### 1. Clone and Setup Environment

```bash
# Navigate to project directory
cd f:\Projects\pms

# Copy environment variables
cp .env.example .env

# Edit .env file with your local settings (optional for development)
```

### 2. Start Infrastructure Services

```bash
# Start MongoDB, Redis, and MinIO
docker-compose up -d mongodb redis minio

# Verify services are running
docker-compose ps
```

### 3. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 4. Build and Start Applications

#### Backend (Terminal 1)
```bash
cd backend

# Build the application first
npm run build

# Start in development mode with hot reload
npm run start:dev
```

#### Frontend (Terminal 2)
```bash
cd frontend

# Start in development mode with hot reload
npm run dev
```

## 🌐 Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/v1/health
- **MinIO Console**: http://localhost:9001 (admin/password123)

## 🛠 Development Commands

### Backend Commands
```bash
# Development with hot reload
npm run start:dev

# Build for production
npm run build

# Start production build
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Frontend Commands
```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Start production build
npm run start

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## 🐛 Troubleshooting

### Issue: "Cannot find module 'dist/main'"
**Solution**: Build the backend first
```bash
cd backend
npm run build
npm run start:dev
```

### Issue: Frontend dependency errors
**Solution**: Clean install dependencies
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Docker services not starting
**Solution**: Check Docker and restart services
```bash
docker-compose down
docker-compose up -d mongodb redis minio
```

### Issue: Port already in use
**Solution**: Kill processes using the ports
```bash
# Kill process on port 3000 (frontend)
npx kill-port 3000

# Kill process on port 3001 (backend)
npx kill-port 3001
```

## 📊 Service Health Checks

### Check MongoDB
```bash
# Connect to MongoDB
docker exec -it pms-mongodb mongosh -u admin -p password --authenticationDatabase admin
```

### Check Redis
```bash
# Connect to Redis
docker exec -it pms-redis redis-cli ping
```

### Check MinIO
```bash
# Access MinIO console at http://localhost:9001
# Username: admin
# Password: password123
```

## 🔄 Development Workflow

1. **Start Infrastructure**: `docker-compose up -d mongodb redis minio`
2. **Backend Development**: `cd backend && npm run start:dev`
3. **Frontend Development**: `cd frontend && npm run dev`
4. **Make Changes**: Edit code with hot reload
5. **Test Changes**: Run tests and check health endpoints
6. **Commit Changes**: Use Git for version control

## 📝 Environment Variables

Key environment variables in `.env`:

```env
# Application
NODE_ENV=development
APP_PORT=3001
APP_VERSION=1.0.0

# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/pms?authSource=admin

# Authentication (for future use)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# File Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123

# Redis
REDIS_URL=redis://localhost:6379
```

## 🎯 Next Steps

Once the development environment is running:

1. **Verify Health**: Check http://localhost:3001/api/v1/health
2. **Explore API**: Visit http://localhost:3001/api/docs
3. **Test Frontend**: Navigate to http://localhost:3000
4. **Start Development**: Begin implementing Sprint 2 features

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify all services are running with `docker-compose ps`
3. Check application logs in the terminal
4. Ensure all dependencies are installed correctly

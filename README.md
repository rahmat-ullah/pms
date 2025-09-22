# Project Management Software (PMS)

A comprehensive enterprise-grade project management system built with modern technologies and best practices.

## 🏗️ Architecture Overview

- **Backend**: NestJS with TypeScript, MongoDB with Mongoose ODM
- **Frontend**: Next.js 14+ with App Router, React, TypeScript
- **Database**: MongoDB 7+ with document-oriented design
- **Storage**: S3-compatible storage (MinIO for dev, AWS S3 for prod)
- **Authentication**: JWT with access/refresh tokens, RBAC
- **Containerization**: Docker with multi-stage builds, Docker Compose for development
- **State Management**: TanStack Query for server state, Zustand for client state
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Testing**: Jest for unit testing, Playwright for E2E testing

## 🚀 Quick Start

### Prerequisites

- Docker Desktop 4.0+
- Node.js 18+ (for local development)
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pms
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

4. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs
   - MinIO Console: http://localhost:9001 (admin/password123)
   - MongoDB: localhost:27017

### Development Workflow

1. **Install dependencies** (for IDE support)
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd frontend && npm install
   ```

2. **Run tests**
   ```bash
   # All tests
   docker-compose exec backend npm test
   docker-compose exec frontend npm test
   
   # Watch mode
   docker-compose exec backend npm run test:watch
   docker-compose exec frontend npm run test:watch
   ```

3. **Code quality checks**
   ```bash
   # Lint and format
   npm run lint
   npm run format
   
   # Type checking
   npm run type-check
   ```

## 📁 Project Structure

```
pms/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── modules/        # Feature modules
│   │   ├── shared/         # Shared utilities and services
│   │   ├── config/         # Configuration management
│   │   └── main.ts         # Application entry point
│   ├── test/               # Test files
│   └── Dockerfile
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App Router pages and layouts
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utility functions and configurations
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── Dockerfile
├── shared/                # Shared TypeScript types and utilities
│   ├── types/             # Common type definitions
│   └── utils/             # Shared utility functions
├── infra/                 # Infrastructure and deployment
│   ├── docker/            # Docker configurations
│   ├── k8s/               # Kubernetes manifests
│   └── scripts/           # Deployment and utility scripts
├── docs/                  # Project documentation
├── .github/               # GitHub Actions workflows
└── docker-compose.yml     # Development environment
```

## 🧪 Testing

### Unit Testing
- **Backend**: Jest with NestJS testing utilities
- **Frontend**: Jest with React Testing Library
- **Coverage**: Minimum 70% coverage required

### Integration Testing
- API integration tests
- Database integration tests
- Service communication tests

### End-to-End Testing
- Playwright for full user journey testing
- Automated testing in CI/CD pipeline

## 🔧 Development Tools

### Code Quality
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality enforcement
- **TypeScript**: Static type checking

### API Documentation
- **Swagger/OpenAPI**: Auto-generated API documentation
- **Postman Collection**: API testing collection

### Monitoring & Logging
- **Pino**: Structured logging
- **Health Checks**: Application health monitoring
- **Performance Monitoring**: Response time tracking

## 🚢 Deployment

### Staging Environment
- Automatic deployment on main branch merge
- GitHub Actions CI/CD pipeline
- Container registry: GitHub Container Registry

### Production Environment
- Kubernetes deployment
- Blue-green deployment strategy
- Monitoring and alerting

## 📚 Documentation

- [Backend Architecture](./backend.md)
- [Frontend Architecture](./frontend.md)
- [Database Design](./database-and-storage.md)
- [Docker & Deployment](./docker.md)
- [Sprint Planning](./sprints/sprint-overview.md)

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes following coding standards
3. Write tests for new functionality
4. Ensure all tests pass and code quality checks succeed
5. Create a pull request with detailed description
6. Code review and approval required before merge

### Coding Standards
- Follow TypeScript best practices
- Use meaningful variable and function names
- Write comprehensive tests
- Document complex logic
- Follow established patterns and conventions

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For development support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting documentation

---

**Development Status**: Sprint 1 - Development Environment & Project Setup

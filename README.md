# Valliance Resource Management System

A value-based resource management application for Valliance, a PE-backed AI consultancy. This system manages employees and contractors across client engagements with a focus on comparing **value created** against **delivery costs**.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (NextJS 14)                         │
│  App Router · Tailwind CSS · shadcn/ui · TanStack Query · Zustand  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (NestJS)                            │
│                    REST + GraphQL (Apollo)                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │ People Service  │ │ Project Service │ │Scheduling Service│
    │    (NestJS)     │ │    (NestJS)     │ │    (NestJS)     │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SHARED INFRASTRUCTURE                           │
│  PostgreSQL · Redis · Prisma ORM · BullMQ · Claude API              │
└─────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend**: NextJS 14 (App Router), React 18, Tailwind CSS, shadcn/ui
- **State Management**: Zustand (client), TanStack Query (server state)
- **API Gateway**: NestJS with REST + GraphQL (Apollo)
- **Microservices**: NestJS (People, Project, Scheduling, Reporting)
- **Database**: PostgreSQL 16 with Prisma ORM
- **Events/Queues**: Redis + BullMQ
- **AI**: Anthropic Claude API
- **Containerization**: Docker + Docker Compose
- **Monorepo**: Turborepo + Yarn workspaces
- **Language**: TypeScript end-to-end

## Prerequisites

- Node.js 20+
- Yarn 4+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis (or use Docker)

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
cd valliant

# Copy environment variables
cp .env.example .env

# Install dependencies
yarn install
```

### 2. Configure Environment

Edit [.env](.env) with your configuration:

```env
DATABASE_URL="postgresql://valliance:localdev@localhost:5432/valliance_rm"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key-change-in-production"
ANTHROPIC_API_KEY="sk-ant-your-api-key-here"
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL and Redis with Docker
yarn docker:up

# Or run them separately if you have local installations
```

### 4. Setup Database

```bash
# Generate Prisma client
yarn db:generate

# Run migrations
yarn db:migrate

# Seed initial data
yarn db:seed

# (Optional) Open Prisma Studio
yarn db:studio
```

### 5. Start Development

```bash
# Start all services in development mode
yarn dev

# Services will be available at:
# - Frontend: http://localhost:3000
# - API Gateway: http://localhost:4000
# - GraphQL Playground: http://localhost:4000/graphql
# - People Service: http://localhost:4001
# - Project Service: http://localhost:4002
# - Scheduling Service: http://localhost:4003
# - Reporting Service: http://localhost:4004
```

### 6. Access Development Tools

- **Adminer** (Database UI): http://localhost:8080
- **Redis Commander**: http://localhost:8081
- **Prisma Studio**: `yarn db:studio`

## Project Structure

```
valliance-resource-management/
├── apps/
│   ├── web/                    # NextJS frontend
│   ├── api-gateway/            # NestJS API Gateway
│   ├── people-service/         # People microservice
│   ├── project-service/        # Project microservice
│   ├── scheduling-service/     # Scheduling microservice
│   └── reporting-service/      # Reporting microservice
├── packages/
│   ├── database/               # Prisma schema & client
│   ├── shared-types/           # Shared TypeScript types
│   ├── events/                 # Event definitions & handlers
│   └── ui/                     # Shared UI components
├── infrastructure/
│   ├── docker/                 # Docker Compose configs
│   ├── kubernetes/             # K8s manifests
│   └── terraform/              # Infrastructure as Code
└── scripts/                    # Utility scripts
```

## Key Features

### 1. People Management
- Manage employees and contractors
- Assign to multiple practices (Agentic, Palantir, Sierra)
- Track skills with proficiency levels
- Individual utilisation targets
- Cost rate management (role-restricted visibility)

### 2. Project Management
- Value-based commercial model tracking
- Phase-level budgeting with rollup to project totals
- Multi-practice project ownership via Value Partners
- 3-in-the-box team model enforcement
- Project hierarchy: Bootcamps → Pilots → Use Case Rollouts

### 3. Scheduling & Allocation
- Drag-and-drop resource allocation
- Visual capacity indicators
- Tentative vs Confirmed allocations
- Overallocation warnings

### 4. Time Tracking
- Pre-filled timesheets based on allocations
- Approval workflow: DRAFT → SUBMITTED → APPROVED → LOCKED
- ISO 27001 compliance with full audit trail

### 5. Reporting
- Utilisation reports (respecting individual targets)
- Value vs Cost analysis
- Phase budget status with alerts
- Board-ready margin reports

### 6. AI-Assisted Features (Phase 3)
- Claude API integration for scheduling recommendations
- Natural language queries
- Budget optimisation suggestions
- Skill gap analysis

## Development Commands

```bash
# Install dependencies
yarn install

# Development
yarn dev                  # Start all services
yarn workspace @vrm/web dev          # Start frontend only
yarn workspace @vrm/api-gateway dev  # Start API gateway only

# Build
yarn build                # Build all packages
yarn workspace @vrm/web build        # Build frontend only

# Database
yarn db:generate          # Generate Prisma client
yarn db:migrate           # Run migrations
yarn db:seed              # Seed database
yarn db:studio            # Open Prisma Studio
yarn db:reset             # Reset database (caution!)

# Docker
yarn docker:up            # Start infrastructure
yarn docker:down          # Stop infrastructure
yarn docker:logs          # View logs

# Linting & Testing
yarn lint                 # Lint all packages
yarn test                 # Run all tests
yarn format               # Format code with Prettier

# Clean
yarn clean                # Clean all build artifacts
```

## Database Schema

See [CLAUDE.md](CLAUDE.md) for complete domain model and schema documentation.

Key entities:
- **Person**: Employees and contractors with skills, practices, and cost rates
- **Project**: Engagements with value-based commercial tracking
- **Phase**: SDLC phases within projects with individual budgets
- **Allocation**: Resource assignments to projects/phases
- **TimeEntry**: Time tracking with approval workflow
- **User**: Authentication and RBAC

## API Endpoints

### REST API (API Gateway)

```
POST   /api/auth/login          # Authentication
GET    /api/health              # Health check
```

### Microservices

```
# People Service (4001)
GET    /people                  # List all people
GET    /people/:id              # Get person details
POST   /people                  # Create person
PUT    /people/:id              # Update person
DELETE /people/:id              # Delete person

# Project Service (4002)
GET    /projects                # List all projects
GET    /projects/:id            # Get project details
POST   /projects                # Create project
```

### GraphQL (API Gateway)

```graphql
# Access at http://localhost:4000/graphql

query {
  people {
    id
    name
    email
    role {
      name
    }
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRATION` | JWT expiration time | `7d` |
| `ANTHROPIC_API_KEY` | Claude API key | - |
| `NODE_ENV` | Environment | `development` |
| `PORT` | API Gateway port | `4000` |
| `NEXT_PUBLIC_API_URL` | Frontend API URL | `http://localhost:4000` |

## User Roles & Permissions

| Role | Description | Permissions |
|------|-------------|-------------|
| **Partner** | Full access including cost rates | All operations, board reports |
| **Ops Lead** | Operations management | Full scheduling, cost visibility |
| **Practice Lead** | Practice management | Practice-level operations |
| **Project Manager** | Project management | Project allocations, time approval |
| **Team Member** | Consultant/Engineer | Own time, view assignments |
| **Contractor** | External resource | Limited visibility |
| **Read-Only** | External stakeholder | View schedules (no costs) |

## Security & Compliance

- **Authentication**: JWT-based with secure password hashing (bcrypt)
- **Authorization**: Role-based access control (RBAC)
- **Data Sensitivity**: Cost rates restricted by role
- **Audit Trail**: Full change history for ISO 27001 compliance
- **Time Entry Locking**: Immutable entries after approval for audit trail

## Development Phases

See [CLAUDE.md](CLAUDE.md) for detailed phase breakdown.

- ✅ **Phase 1**: Foundation (MVP) - Core scheduling and time tracking
- 🚧 **Phase 2**: Commercial Model - Value-based tracking
- 📋 **Phase 3**: AI Integration - Claude-powered recommendations
- 📋 **Phase 4**: Compliance & Polish - Production-ready features
- 📋 **Phase 5**: Stretch Goals - Advanced features

## Deployment

### Docker Compose (Development/Staging)

```bash
# Build and start all services
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```

### Kubernetes (Production)

```bash
# Apply Kubernetes manifests
kubectl apply -k infrastructure/kubernetes/overlays/production/
```

### Terraform (AWS Infrastructure)

```bash
# Provision AWS resources (EKS, RDS, ElastiCache)
cd infrastructure/terraform/environments/prod
terraform init
terraform plan
terraform apply
```

## Monitoring & Observability

(To be implemented in Phase 4)
- Health checks on all services
- Prometheus metrics
- Grafana dashboards
- Structured logging with Winston
- Distributed tracing with OpenTelemetry

## Contributing

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Ensure tests pass: `yarn test`
4. Ensure linting passes: `yarn lint`
5. Submit a pull request

## Documentation

- [CLAUDE.md](CLAUDE.md) - Complete system specification
- [API Documentation](docs/api.md) - REST & GraphQL API reference
- [Database Schema](docs/schema.md) - Prisma schema documentation
- [Deployment Guide](docs/deployment.md) - Production deployment

## Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/valliance/vrm/issues)
- Internal Slack: #vrm-support

## License

Proprietary - © 2025 Valliance AI Ltd

---

**Built with ❤️ by the Valliance team**

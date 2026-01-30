# CLAUDE.md — Valliance Resource Management System

## Project Overview

### Purpose
A value-based resource management application for Valliance, a PE-backed AI consultancy specialising in enterprise AI transformation, agentic business operating systems, and Palantir implementations. The system manages ~14 employees plus contractors across client engagements, with a focus on comparing **value created** against **delivery costs** rather than traditional T&M billing.

### Key Differentiators
1. **Value-Based Commercial Model**: Projects priced on percentage of value created for clients, not time × rate
2. **Multi-Level Project Hierarchy**: Bootcamps → Pilots → Use Case Rollouts, each containing SDLC phases
3. **3-in-the-Box Delivery Model**: Preferred staffing of Consultant + Engineer + Orchestrator per engagement
4. **Practice-Based Organisation**: Agentic Practice, Palantir Practice, (future) Sierra Practice
5. **AI-Assisted Scheduling**: Claude API integration for recommendations and insights
6. **Board-Ready Reporting**: Value vs. cost analysis for investor/board reporting
7. **Phase-Level Budgeting**: Individual phase budgets that roll up to project totals
8. **Value Partner Ownership**: Multi-practice projects owned by assigned value partner for margin attribution

---

## Technology Stack

### Overview

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | NextJS 14+ (App Router) | React-based web application |
| Styling | Tailwind CSS + shadcn/ui | Utility-first CSS with accessible components |
| State | Zustand + TanStack Query | Client state and server state management |
| API Gateway | NestJS | REST + GraphQL (Apollo) |
| Microservices | NestJS | Domain-specific services |
| Database | PostgreSQL 16 | Shared relational database |
| ORM | Prisma | Type-safe database access |
| Events/Queues | Redis + BullMQ | Pub/sub and job queues |
| AI | Anthropic Claude API | Recommendations and NL queries |
| Containerisation | Docker | All services containerised |
| Orchestration | Kubernetes (AWS EKS) | Production deployment |
| DevOps | Terraform, Github Actions, Snyk | IaC, pipelines and vulnerability | 
| Testing | ViTest, Playwright | Unit and e2e testing |
| Local Dev | Docker Compose | Development environment |
| Language | TypeScript | End-to-end type safety |
| Monorepo | Turborepo + yarn | Workspace management |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                       │
│  NextJS 14+ (App Router) · TypeScript · Tailwind CSS · shadcn/ui            │
│  TanStack Query · Zustand · Apollo Client (GraphQL)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY / BFF                                 │
│                    NestJS · REST + GraphQL (Apollo)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│   PEOPLE SERVICE    │ │  PROJECT SERVICE    │ │ SCHEDULING SERVICE  │
│      (NestJS)       │ │     (NestJS)        │ │      (NestJS)       │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SHARED INFRASTRUCTURE                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │   PostgreSQL    │  │     Redis       │  │    Anthropic Claude API     │  │
│  │   (Primary DB)  │  │ (Events/Queues) │  │    (AI Recommendations)     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Domain Model

### Core Entities

#### Person
```typescript
Person {
  id: UUID
  name: string
  email: string
  type: enum [EMPLOYEE, CONTRACTOR]
  status: enum [ACTIVE, BENCH, OFFBOARDED]
  practice: Practice[]                    // Can belong to multiple practices
  role: Role                              // Primary role
  department: Department?
  costRate: Money                         // Internal cost per day (confidential)
  defaultHoursPerWeek: number             // Default 40, configurable
  workingDays: DayOfWeek[]                // Mon-Fri default
  skills: Skill[]
  seniority: enum [JUNIOR, MID, SENIOR, PRINCIPAL, PARTNER]
  utilisationTarget: number               // Default 80% for employees, configurable for contractors
  startDate: Date
  endDate: Date?
  notes: string?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Skill
```typescript
Skill {
  id: UUID
  name: string
  category: SkillCategory
  description: string?
}

SkillCategory: enum [
  PLATFORM,           // Palantir Foundry, Palantir AIP, Sierra, etc.
  PROGRAMMING,        // Python, TypeScript, SQL, Prolog, etc.
  FRAMEWORK,          // LangGraph, LangChain, NextJS, etc.
  DOMAIN,             // Life Sciences, Finance, Insurance, etc.
  METHODOLOGY,        // Agile, Design Thinking, etc.
  SOFT_SKILL          // Stakeholder Management, Facilitation, etc.
]

PersonSkill {
  personId: UUID
  skillId: UUID
  proficiency: enum [LEARNING, COMPETENT, PROFICIENT, EXPERT]
  yearsExperience: number?
  lastUsed: Date?
}
```

#### Practice
```typescript
Practice {
  id: UUID
  name: string                            // "Agentic", "Palantir", "Sierra"
  description: string?
  lead: Person?
  members: Person[]
  createdAt: DateTime
}
```

Note: Sierra Practice will follow the same structure as Palantir Practice when established.

#### Role
```typescript
Role {
  id: UUID
  name: string                            // "Consultant", "Engineer", "Orchestrator", etc.
  description: string?
  defaultCostRate: Money?                 // Fallback if person has no rate
  isBillable: boolean
}
```

#### Client
```typescript
Client {
  id: UUID
  name: string                            // "UBS", "Heineken", etc.
  industry: string?
  primaryContact: string?
  contactEmail: string?
  notes: string?
  projects: Project[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Project (Engagement Level)
```typescript
Project {
  id: UUID
  name: string
  code: string                            // e.g., "UBS-2025-001"
  client: Client
  practice: Practice                      // Primary practice
  practices: Practice[]                   // All practices involved (for multi-practice)
  valuePartner: Person                    // Owns margin for multi-practice projects
  status: ProjectStatus
  
  // Value-Based Commercial Model
  estimatedValueCreated: Money?           // Total value to be created for client
  valueSharePercentage: number?           // Valliance's % of value (e.g., 15%)
  agreedFee: Money?                       // For fixed-price initial builds
  commercialModel: enum [VALUE_SHARE, FIXED_PRICE, HYBRID]
  
  // Cost Tracking (rolls up from phases)
  estimatedCost: Money?                   // Sum of phase estimates + contingency
  actualCost: Money?                      // Calculated from allocations
  contingencyPercentage: number?          // e.g., 20%
  
  // Timing
  startDate: Date
  endDate: Date?
  
  // Structure
  projectType: enum [BOOTCAMP, PILOT, USE_CASE_ROLLOUT]
  parentProject: Project?                 // For rollouts that spawn from pilots
  phases: Phase[]
  
  // Team
  teamModel: enum [THREE_IN_BOX, FLEXIBLE]
  requiredRoles: ProjectRole[]
  
  // Metadata
  tags: string[]
  notes: string?
  createdAt: DateTime
  updatedAt: DateTime
}

ProjectStatus: enum [
  PROSPECT,           // In pipeline, not yet confirmed
  DISCOVERY,          // Scoping/estimating
  CONFIRMED,          // Signed, not yet started
  ACTIVE,             // In delivery
  ON_HOLD,            // Paused
  COMPLETED,          // Delivered
  CANCELLED
]
```

#### Phase (SDLC Stage within a Project)
```typescript
Phase {
  id: UUID
  projectId: UUID
  name: string                            // "Discovery", "Design", "Build", "Hypercare"
  phaseType: PhaseType
  status: enum [NOT_STARTED, IN_PROGRESS, COMPLETED, BLOCKED]
  startDate: Date
  endDate: Date?
  
  // Phase-Level Budget (rolls up to project)
  estimatedHours: number?
  estimatedCostCents: BigInt?             // Phase budget in pence/cents
  actualCostCents: BigInt?                // Calculated from allocations
  budgetAlertThreshold: number?           // Percentage to trigger warning (e.g., 80%)
  
  tasks: Task[]
  order: number                           // Sequence within project
  createdAt: DateTime
  updatedAt: DateTime
}

PhaseType: enum [
  DISCOVERY,
  DESIGN,
  BUILD,
  TEST,
  DEPLOY,
  HYPERCARE,
  CUSTOM
]
```

#### Task
```typescript
Task {
  id: UUID
  phaseId: UUID
  name: string
  description: string?
  estimatedHours: number?
  requiredSkills: Skill[]
  requiredRole: Role?
  status: enum [TODO, IN_PROGRESS, DONE, BLOCKED]
  priority: enum [LOW, MEDIUM, HIGH, CRITICAL]
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Allocation
```typescript
Allocation {
  id: UUID
  personId: UUID
  projectId: UUID
  phaseId: UUID?
  taskId: UUID?
  
  // Timing
  startDate: Date
  endDate: Date
  hoursPerDay: number                     // Or percentage of capacity
  
  // Classification
  allocationType: enum [BILLABLE, NON_BILLABLE, INTERNAL, BENCH]
  status: enum [TENTATIVE, CONFIRMED, COMPLETED]
  
  // Role on this allocation (may differ from person's default)
  role: Role?
  
  // Calculated
  totalScheduledHours: number             // Computed
  costAtAllocation: Money                 // Snapshot of person's rate × hours
  
  notes: string?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### TimeEntry
```typescript
TimeEntry {
  id: UUID
  personId: UUID
  allocationId: UUID?                     // Can be unallocated time
  projectId: UUID?
  phaseId: UUID?
  taskId: UUID?
  
  date: Date
  hours: number
  entryType: enum [BILLABLE, NON_BILLABLE, INTERNAL, BENCH, LEAVE]
  
  description: string?
  
  // Approval Workflow
  status: enum [DRAFT, SUBMITTED, APPROVED, REJECTED, LOCKED]
  approvedBy: UUID?                       // Project Manager or Ops Team member
  approvedAt: DateTime?
  rejectionReason: string?
  
  // For ISO compliance
  createdAt: DateTime
  updatedAt: DateTime
  createdBy: UUID
  updatedBy: UUID?
  lockedAt: DateTime?
}
```

#### ProjectRole (Team Composition)
```typescript
ProjectRole {
  id: UUID
  projectId: UUID
  role: Role
  requiredCount: number                   // e.g., 1 Consultant, 2 Engineers
  assignedPersons: Person[]
  isRequired: boolean                     // Required for 3-in-the-box compliance
}
```

---

## Core Features

### 1. People Management

#### Capabilities
- Add/edit/archive people (employees and contractors)
- Assign to practices (can be multiple)
- Set individual cost rates (confidential, role-restricted visibility)
- Configure working hours and days
- Set individual utilisation targets (default 80% for employees, configurable for contractors)
- Track skills with proficiency levels
- View availability calendar
- Bulk import from CSV

#### Utilisation Targets
| Person Type | Default Target | Configurable |
|-------------|----------------|--------------|
| Employee (Engineer) | 80% | Yes |
| Employee (Consultant) | 80% | Yes |
| Contractor | 100% | Yes (per-person) |

#### Skills Taxonomy
Pre-configured categories with ability to add custom skills:
- **Platforms**: Palantir Foundry, Palantir AIP, Sierra, Anthropic Claude, AWS, Azure, GCP
- **Programming**: Python, TypeScript, SQL, Prolog, Java, Rust
- **Frameworks**: LangGraph, LangChain, NextJS, React, FastAPI
- **Domains**: Financial Services, Life Sciences, Insurance, Manufacturing, Retail
- **Methodologies**: Agile, Scrum, Design Thinking, SDLC

### 2. Project Management

#### Project Hierarchy
```
Client
└── Project (Engagement)
    ├── Type: BOOTCAMP | PILOT | USE_CASE_ROLLOUT
    ├── Commercial Model: VALUE_SHARE | FIXED_PRICE | HYBRID
    ├── Value Partner: Person (owns margin attribution)
    └── Phases (each with own budget)
        ├── Discovery
        │   ├── Budget: £X
        │   └── Tasks
        ├── Design
        │   ├── Budget: £Y
        │   └── Tasks
        ├── Build
        │   ├── Budget: £Z
        │   └── Tasks
        └── Hypercare
            ├── Budget: £W
            └── Tasks
```

#### Phase-Level Budgeting
Each phase can have:
1. **Estimated Cost**: Budget allocated to this phase
2. **Actual Cost**: Calculated from time entries and allocations
3. **Variance**: Estimated - Actual
4. **Alert Threshold**: Percentage at which to warn (e.g., 80% consumed)

Phase budgets roll up to project totals:
```typescript
project.estimatedCost = sum(phase.estimatedCost) * (1 + project.contingencyPercentage)
project.actualCost = sum(phase.actualCost)
```

#### Value-Based Commercial Tracking
For each project, capture:
1. **Estimated Value Created**: Total value the solution will generate for the client
2. **Value Share %**: Valliance's percentage of that value
3. **Implied Revenue**: Calculated as Value × Share %
4. **Delivery Cost**: Sum of phase costs + Contingency
5. **Gross Margin**: Revenue - Cost
6. **Margin %**: (Revenue - Cost) / Revenue

For fixed-price initial builds:
1. **Agreed Fee**: The fixed price
2. **Delivery Cost**: As above
3. **Margin**: Fee - Cost

#### Multi-Practice Project Ownership
When a project spans multiple practices (e.g., Palantir + Agentic):
- One **Value Partner** is assigned to the project
- That Value Partner owns the margin attribution
- All practices involved are tracked for reporting
- Resource utilisation attributed to person's primary practice

#### 3-in-the-Box Enforcement
- When `teamModel = THREE_IN_BOX`, system flags if Consultant, Engineer, and Orchestrator roles are not all assigned
- Soft warning, not blocking
- Dashboard indicator for compliance

### 3. Scheduling & Allocation

#### Schedule View
- **People View**: Rows = People, Columns = Time (day/week/month)
- **Project View**: Rows = Projects/Phases, Columns = Time
- Drag-and-drop allocation
- Visual capacity indicators (under/at/over capacity)
- Colour coding by project, allocation type, or status

#### Allocation Types
| Type | Description | Counted in Utilisation |
|------|-------------|------------------------|
| BILLABLE | Client-facing project work | Yes (billable) |
| NON_BILLABLE | Client work not charged | Yes (non-billable) |
| INTERNAL | Valliance internal projects | No |
| BENCH | Unallocated, available | No |

#### Capacity Calculation
```typescript
// Weekly utilisation
const weeklyCapacity = person.defaultHoursPerWeek - leaveHours - holidayHours;
const billableHours = timeEntries.filter(t => t.entryType === 'BILLABLE').sum('hours');
const nonBillableHours = timeEntries.filter(t => t.entryType === 'NON_BILLABLE').sum('hours');
const utilisationRate = (billableHours + nonBillableHours) / weeklyCapacity;

// Compare against target
const target = person.utilisationTarget; // 80% default, varies for contractors
const variance = utilisationRate - target;
```

#### Tentative vs Confirmed
- **Tentative**: Pipeline projects, displayed with outline/hatched styling
- **Confirmed**: Signed engagements, solid display
- Tentative allocations don't trigger overallocation warnings

### 4. Time Tracking

#### Entry Methods
1. **Pre-filled Timesheets**: Based on scheduled allocations
2. **Manual Entry**: Log against project/phase/task
3. **Timer**: Real-time tracking (stretch goal)

#### Timesheet Workflow
```
DRAFT → SUBMITTED → APPROVED → LOCKED
                  ↘ REJECTED → DRAFT
```

1. Team member creates entries (DRAFT)
2. Team member submits week (SUBMITTED)
3. Project Manager or Ops Team reviews
4. Approved entries move to APPROVED
5. Rejected entries return to DRAFT with reason
6. Weekly batch job locks approved entries (LOCKED)
7. Locked entries immutable for audit trail

#### Approval Permissions
| Role | Can Approve |
|------|-------------|
| Partner | All timesheets |
| Ops Lead | All timesheets |
| Practice Lead | Practice timesheets |
| Project Manager | Project timesheets |

#### ISO 27001 Compliance
- Full audit trail: who created/modified, when
- Immutable after lock
- Export capability for compliance evidence
- Rejection reasons stored

### 5. Reporting

#### People Reports
- **Utilisation Report**: Actual vs. target (respecting per-person targets), by person/practice/role
- **Availability Report**: Who's available when, with skill filters
- **Bench Report**: People without allocations
- **Timesheet Compliance**: Who's logged vs. not logged, approval status

#### Project Reports
- **Project Health**: Schedule vs. budget, RAG status
- **Cost vs. Value**: For each project, the core value-based analysis
- **Phase Budget Status**: Hours/cost consumed vs. estimated per phase with alerts
- **Resource Allocation**: Who's on what, gaps in coverage
- **Value Partner Dashboard**: Margin performance by Value Partner

#### Board Reports
- **Practice Performance**: Revenue, cost, margin by practice
- **Pipeline vs. Delivery**: Tentative vs. confirmed value
- **Utilisation Trends**: Rolling 12-week trend
- **Value Realisation**: Projects where value share is being tracked
- **Contractor vs. Employee Mix**: Cost and utilisation comparison

#### Export Formats
- PDF (formatted reports)
- CSV (raw data)
- Excel (with charts)

### 6. AI-Assisted Features

The AI assistant has full access to cost data to provide accurate recommendations.

#### Scheduling Recommendations
Integration with Claude API for:
1. **Smart Assignment**: Given a project's required skills, roles, and budget, recommend best-fit available people considering cost rates
2. **Conflict Resolution**: When overallocated, suggest redistributions
3. **Capacity Forecasting**: Based on pipeline, predict when to hire/contract
4. **Skill Gap Analysis**: Identify missing skills for upcoming work
5. **Budget Optimisation**: Suggest team compositions that meet skill requirements within budget

#### Natural Language Queries
Allow users to ask:
- "Who's available next week with Palantir AIP experience?"
- "What's our margin on the Heineken engagement?"
- "Which engineers are below 80% utilisation this month?"
- "What's the most cost-effective team for a Palantir pilot?"
- "Show me phase budget status for active projects"

#### Implementation Approach
```typescript
// Example: AI Recommendation Request
interface AIRecommendationRequest {
  type: 'ASSIGNMENT' | 'REBALANCE' | 'FORECAST' | 'QUERY' | 'BUDGET_OPTIMISE';
  context: {
    projectId?: string;
    requiredSkills?: string[];
    requiredRole?: string;
    dateRange?: { start: Date; end: Date };
    budgetConstraint?: Money;
    query?: string;  // For natural language
  };
  includeConfidential: boolean;  // Always true for AI - has cost access
}

// Call Anthropic API with structured context including costs
// Parse response and surface in UI
```

---

## User Roles & Permissions (RBAC)

### Role Hierarchy
```
Partner
├── Full access to all data including cost rates
├── Can manage users and roles
├── Can approve/reject all time entries
└── Can view board reports

Operations Lead
├── Full scheduling access
├── Can view cost rates for planning
├── Can manage projects and allocations
├── Can approve/reject all time entries
└── Cannot manage user roles

Practice Lead
├── Full access within their practice
├── Can view team cost rates
├── Can manage practice projects
├── Can approve/reject practice time entries
└── Limited cross-practice visibility

Project Manager
├── Full access to assigned projects
├── Can view project team cost rates
├── Can approve/reject project time entries
└── Cannot view other projects' financials

Consultant / Engineer / Orchestrator
├── View own schedule and allocations
├── Log own time
├── View project details (not costs)
└── Request time off

Contractor
├── View own schedule and allocations
├── Log own time
└── Limited project visibility

Read-Only (External)
├── View schedules (no costs)
├── View project status
└── No edit capabilities
```

### Permission Matrix
| Action | Partner | Ops Lead | Practice Lead | Project Mgr | Team Member | Contractor | Read-Only |
|--------|---------|----------|---------------|-------------|-------------|------------|-----------|
| View all people | ✓ | ✓ | Practice only | Project only | Own | Own | ✓ |
| View cost rates | ✓ | ✓ | Practice only | Project only | ✗ | ✗ | ✗ |
| Edit allocations | ✓ | ✓ | Practice only | Project only | Own tentative | ✗ | ✗ |
| Create projects | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| View project costs | ✓ | ✓ | Practice only | Own projects | ✗ | ✗ | ✗ |
| Log time | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Approve timesheets | ✓ | ✓ | Practice only | Project only | ✗ | ✗ | ✗ |
| View board reports | ✓ | ✓ | Limited | ✗ | ✗ | ✗ | ✗ |
| Manage users | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## Technical Architecture

### Monorepo Structure (Turborepo)

```
valliance-resource-management/
├── apps/
│   ├── web/                          # NextJS frontend
│   │   ├── src/
│   │   │   ├── app/                  # App Router pages
│   │   │   ├── components/           # React components
│   │   │   │   ├── ui/               # shadcn/ui components
│   │   │   │   ├── schedule/         # Schedule-specific components
│   │   │   │   ├── projects/         # Project-specific components
│   │   │   │   └── reports/          # Report components
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   ├── lib/                  # Utilities, API clients
│   │   │   ├── stores/               # Zustand stores
│   │   │   └── graphql/              # Generated types, queries, mutations
│   │   ├── public/
│   │   ├── Dockerfile
│   │   ├── next.config.js
│   │   └── package.json
│   │
│   ├── api-gateway/                  # NestJS API Gateway / BFF
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── graphql/              # GraphQL resolvers, schema
│   │   │   ├── rest/                 # REST controllers
│   │   │   ├── auth/                 # Authentication module
│   │   │   ├── common/               # Guards, interceptors, filters
│   │   │   └── config/               # Configuration module
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── people-service/               # NestJS microservice
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── people/               # People module
│   │   │   ├── skills/               # Skills module
│   │   │   ├── practices/            # Practices module
│   │   │   └── roles/                # Roles module
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── project-service/              # NestJS microservice
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── projects/             # Projects module
│   │   │   ├── phases/               # Phases module
│   │   │   ├── tasks/                # Tasks module
│   │   │   ├── clients/              # Clients module
│   │   │   └── commercial/           # Value/cost calculations
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── scheduling-service/           # NestJS microservice
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── allocations/          # Allocations module
│   │   │   ├── time-entries/         # Time tracking module
│   │   │   ├── availability/         # Availability calculations
│   │   │   ├── approval/             # Timesheet approval workflow
│   │   │   └── ai/                   # Claude API integration
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── reporting-service/            # NestJS microservice
│       ├── src/
│       │   ├── main.ts
│       │   ├── utilisation/          # Utilisation reports
│       │   ├── financial/            # Margin/value reports
│       │   ├── compliance/           # ISO audit reports
│       │   └── exports/              # PDF, CSV, Excel generation
│       ├── Dockerfile
│       └── package.json
│
├── packages/
│   ├── database/                     # Prisma schema & migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── client.ts             # Prisma client export
│   │   └── package.json
│   │
│   ├── shared-types/                 # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── entities/             # Domain entity types
│   │   │   ├── dto/                  # Data transfer objects
│   │   │   ├── events/               # Event payload types
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── events/                       # Event definitions & handlers
│   │   ├── src/
│   │   │   ├── definitions/          # Event type definitions
│   │   │   ├── publishers/           # Redis pub utilities
│   │   │   └── subscribers/          # Redis sub utilities
│   │   └── package.json
│   │
│   └── ui/                           # Shared UI components (optional)
│       ├── src/
│       └── package.json
│
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml        # Local development
│   │   ├── docker-compose.test.yml   # Integration tests
│   │   └── Dockerfile.base           # Base Node image
│   │
│   ├── kubernetes/
│   │   ├── base/                     # Kustomize base
│   │   │   ├── namespace.yaml
│   │   │   ├── configmap.yaml
│   │   │   ├── secrets.yaml          # Template (not committed)
│   │   │   ├── web-deployment.yaml
│   │   │   ├── api-gateway-deployment.yaml
│   │   │   ├── people-service-deployment.yaml
│   │   │   ├── project-service-deployment.yaml
│   │   │   ├── scheduling-service-deployment.yaml
│   │   │   ├── reporting-service-deployment.yaml
│   │   │   ├── postgres-statefulset.yaml
│   │   │   ├── redis-deployment.yaml
│   │   │   └── ingress.yaml
│   │   │
│   │   ├── overlays/
│   │   │   ├── development/          # Dev cluster overrides
│   │   │   ├── staging/              # Staging overrides
│   │   │   └── production/           # Production overrides
│   │   │
│   │   └── helm/                     # Alternative: Helm charts
│   │       └── valliance-rm/
│   │           ├── Chart.yaml
│   │           ├── values.yaml
│   │           └── templates/
│   │
│   └── terraform/                    # AWS infrastructure
│       ├── modules/
│       │   ├── eks/
│       │   ├── rds/
│       │   └── elasticache/
│       ├── environments/
│       │   ├── dev/
│       │   ├── staging/
│       │   └── prod/
│       └── main.tf
│
├── scripts/
│   ├── setup.sh                      # Initial setup
│   ├── seed.sh                       # Database seeding
│   └── generate-types.sh             # GraphQL codegen
│
├── turbo.json                        # Turborepo config
├── package.json                      # Root package.json
├── pnpm-workspace.yaml               # pnpm workspace config
├── .env.example                      # Environment template
└── README.md
```

### Service Communication

#### Synchronous (Request/Response)
- **REST**: CRUD operations, simple queries
- **GraphQL**: Complex queries, frontend data aggregation

#### Asynchronous (Events via Redis)
```typescript
// Event Types (packages/events/src/definitions)
enum EventType {
  // People Events
  PERSON_CREATED = 'person.created',
  PERSON_UPDATED = 'person.updated',
  PERSON_ARCHIVED = 'person.archived',
  
  // Project Events
  PROJECT_CREATED = 'project.created',
  PROJECT_STATUS_CHANGED = 'project.status_changed',
  PROJECT_TEAM_UPDATED = 'project.team_updated',
  
  // Phase Events
  PHASE_BUDGET_WARNING = 'phase.budget_warning',
  PHASE_BUDGET_EXCEEDED = 'phase.budget_exceeded',
  
  // Allocation Events
  ALLOCATION_CREATED = 'allocation.created',
  ALLOCATION_UPDATED = 'allocation.updated',
  ALLOCATION_DELETED = 'allocation.deleted',
  OVERALLOCATION_DETECTED = 'allocation.overallocation_detected',
  
  // Time Entry Events
  TIME_ENTRY_SUBMITTED = 'time_entry.submitted',
  TIME_ENTRY_APPROVED = 'time_entry.approved',
  TIME_ENTRY_REJECTED = 'time_entry.rejected',
  TIMESHEET_LOCKED = 'timesheet.locked',
  
  // AI Events
  AI_RECOMMENDATION_REQUESTED = 'ai.recommendation_requested',
  AI_RECOMMENDATION_COMPLETED = 'ai.recommendation_completed',
}

// Event Payload Example
interface AllocationCreatedEvent {
  type: EventType.ALLOCATION_CREATED;
  payload: {
    allocationId: string;
    personId: string;
    projectId: string;
    phaseId: string;
    startDate: string;
    endDate: string;
    hoursPerDay: number;
    costRateCentsSnapshot: number;
  };
  metadata: {
    timestamp: string;
    correlationId: string;
    userId: string;
  };
}
```

#### Job Queues (BullMQ via Redis)
```typescript
// Queue Definitions
enum QueueName {
  REPORT_GENERATION = 'report-generation',
  AI_PROCESSING = 'ai-processing',
  NOTIFICATION = 'notification',
  DATA_EXPORT = 'data-export',
  AUDIT_LOG = 'audit-log',
  TIMESHEET_LOCK = 'timesheet-lock',
  BUDGET_CHECK = 'budget-check',
}

// Example: Report Generation Job
interface ReportGenerationJob {
  reportType: 'utilisation' | 'financial' | 'compliance' | 'phase-budget';
  parameters: {
    dateRange: { start: string; end: string };
    filters: Record<string, unknown>;
    format: 'pdf' | 'csv' | 'xlsx';
  };
  requestedBy: string;
  callbackUrl?: string;
}
```

### Database Schema (Prisma)

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============== PEOPLE ==============

model Person {
  id                  String            @id @default(uuid())
  name                String
  email               String            @unique
  type                PersonType
  status              PersonStatus      @default(ACTIVE)
  roleId              String
  role                Role              @relation(fields: [roleId], references: [id])
  departmentId        String?
  department          Department?       @relation(fields: [departmentId], references: [id])
  costRateCents       Int               // Stored in pence/cents for precision
  costRateCurrency    String            @default("GBP")
  defaultHoursPerWeek Decimal           @default(40)
  workingDays         Int[]             @default([1, 2, 3, 4, 5]) // 1=Mon, 7=Sun
  seniority           Seniority
  utilisationTarget   Decimal           @default(0.80) // 80% default, configurable
  startDate           DateTime
  endDate             DateTime?
  notes               String?
  
  // Relations
  practices           PracticeMember[]
  skills              PersonSkill[]
  allocations         Allocation[]
  timeEntries         TimeEntry[]
  projectRoles        ProjectRoleAssignment[]
  valuePartnerProjects Project[]        @relation("ValuePartner")
  approvedTimeEntries TimeEntry[]       @relation("Approver")
  
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
  createdBy           String?
  updatedBy           String?
  
  @@index([status])
  @@index([type])
  @@index([roleId])
}

enum PersonType {
  EMPLOYEE
  CONTRACTOR
}

enum PersonStatus {
  ACTIVE
  BENCH
  OFFBOARDED
}

enum Seniority {
  JUNIOR
  MID
  SENIOR
  PRINCIPAL
  PARTNER
}

model Role {
  id                  String            @id @default(uuid())
  name                String            @unique
  description         String?
  defaultCostRateCents Int?
  isBillable          Boolean           @default(true)
  
  people              Person[]
  projectRoles        ProjectRole[]
  allocations         Allocation[]
  tasks               Task[]
  
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
}

model Department {
  id                  String            @id @default(uuid())
  name                String            @unique
  description         String?
  managerId           String?
  
  people              Person[]
  
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
}

model Practice {
  id                  String            @id @default(uuid())
  name                String            @unique  // "Agentic", "Palantir", "Sierra"
  description         String?
  leadId              String?
  
  members             PracticeMember[]
  primaryProjects     Project[]         @relation("PrimaryPractice")
  projects            ProjectPractice[]
  
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
}

model PracticeMember {
  id                  String            @id @default(uuid())
  personId            String
  person              Person            @relation(fields: [personId], references: [id])
  practiceId          String
  practice            Practice          @relation(fields: [practiceId], references: [id])
  isPrimary           Boolean           @default(false)
  
  @@unique([personId, practiceId])
}

// ============== SKILLS ==============

model Skill {
  id                  String            @id @default(uuid())
  name                String            @unique
  category            SkillCategory
  description         String?
  
  personSkills        PersonSkill[]
  taskSkills          TaskSkill[]
  
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
}

enum SkillCategory {
  PLATFORM
  PROGRAMMING
  FRAMEWORK
  DOMAIN
  METHODOLOGY
  SOFT_SKILL
}

model PersonSkill {
  id                  String            @id @default(uuid())
  personId            String
  person              Person            @relation(fields: [personId], references: [id])
  skillId             String
  skill               Skill             @relation(fields: [skillId], references: [id])
  proficiency         Proficiency
  yearsExperience     Decimal?
  lastUsed            DateTime?
  
  @@unique([personId, skillId])
}

enum Proficiency {
  LEARNING
  COMPETENT
  PROFICIENT
  EXPERT
}

// ============== CLIENTS & PROJECTS ==============

model Client {
  id                  String            @id @default(uuid())
  name                String            @unique
  industry            String?
  primaryContact      String?
  contactEmail        String?
  notes               String?
  
  projects            Project[]
  
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
}

model Project {
  id                  String            @id @default(uuid())
  name                String
  code                String            @unique
  clientId            String
  client              Client            @relation(fields: [clientId], references: [id])
  primaryPracticeId   String
  primaryPractice     Practice          @relation("PrimaryPractice", fields: [primaryPracticeId], references: [id])
  practices           ProjectPractice[]
  valuePartnerId      String
  valuePartner        Person            @relation("ValuePartner", fields: [valuePartnerId], references: [id])
  status              ProjectStatus     @default(PROSPECT)
  
  // Commercial Model
  commercialModel     CommercialModel
  estimatedValueCents BigInt?           // Value created for client
  valueSharePct       Decimal?          // Valliance's percentage (e.g., 0.15 for 15%)
  agreedFeeCents      BigInt?           // For fixed-price
  contingencyPct      Decimal?          @default(0.20)
  currency            String            @default("GBP")
  
  // Timing
  startDate           DateTime
  endDate             DateTime?
  
  // Hierarchy
  projectType         ProjectType
  parentProjectId     String?
  parentProject       Project?          @relation("ProjectHierarchy", fields: [parentProjectId], references: [id])
  childProjects       Project[]         @relation("ProjectHierarchy")
  
  // Team Model
  teamModel           TeamModel         @default(THREE_IN_BOX)
  
  // Relations
  phases              Phase[]
  allocations         Allocation[]
  timeEntries         TimeEntry[]
  projectRoles        ProjectRole[]
  tags                ProjectTag[]
  
  notes               String?
  
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
  createdBy           String?
  updatedBy           String?
  
  @@index([status])
  @@index([clientId])
  @@index([primaryPracticeId])
  @@index([valuePartnerId])
}

model ProjectPractice {
  id                  String            @id @default(uuid())
  projectId           String
  project             Project           @relation(fields: [projectId], references: [id])
  practiceId          String
  practice            Practice          @relation(fields: [practiceId], references: [id])
  
  @@unique([projectId, practiceId])
}

enum ProjectStatus {
  PROSPECT
  DISCOVERY
  CONFIRMED
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

enum CommercialModel {
  VALUE_SHARE
  FIXED_PRICE
  HYBRID
}

enum ProjectType {
  BOOTCAMP
  PILOT
  USE_CASE_ROLLOUT
}

enum TeamModel {
  THREE_IN_BOX
  FLEXIBLE
}

model ProjectTag {
  id                  String            @id @default(uuid())
  projectId           String
  project             Project           @relation(fields: [projectId], references: [id])
  tag                 String
  
  @@unique([projectId, tag])
  @@index([tag])
}

// ============== PHASES & TASKS ==============

model Phase {
  id                  String            @id @default(uuid())
  projectId           String
  project             Project           @relation(fields: [projectId], references: [id])
  name                String
  phaseType           PhaseType
  status              PhaseStatus       @default(NOT_STARTED)
  startDate           DateTime
  endDate             DateTime?
  
  // Phase-Level Budget
  estimatedHours      Decimal?
  estimatedCostCents  BigInt?           // Phase budget
  budgetAlertPct      Decimal?          @default(0.80) // Alert at 80%
  
  sortOrder           Int
  
  tasks               Task[]
  allocations         Allocation[]
  timeEntries         TimeEntry[]
  
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
  
  @@index([projectId])
}

enum PhaseType {
  DISCOVERY
  DESIGN
  BUILD
  TEST
  DEPLOY
  HYPERCARE
  CUSTOM
}

enum PhaseStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  BLOCKED
}

model Task {
  id                  String            @id @default(uuid())
  phaseId             String
  phase               Phase             @relation(fields: [phaseId], references: [id])
  name                String
  description         String?
  estimatedHours      Decimal?
  status              TaskStatus        @default(TODO)
  priority            TaskPriority      @default(MEDIUM)
  requiredRoleId      String?
  requiredRole        Role?             @relation(fields: [requiredRoleId], references: [id])
  sortOrder           Int
  
  requiredSkills      TaskSkill[]
  allocations         Allocation[]
  timeEntries         TimeEntry[]
  
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
  
  @@index([phaseId])
}

model TaskSkill {
  id                  String            @id @default(uuid())
  taskId              String
  task                Task              @relation(fields: [taskId], references: [id])
  skillId             String
  skill               Skill             @relation(fields: [skillId], references: [id])
  
  @@unique([taskId, skillId])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
  BLOCKED
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

// ============== PROJECT ROLES (3-in-the-box) ==============

model ProjectRole {
  id                  String            @id @default(uuid())
  projectId           String
  project             Project           @relation(fields: [projectId], references: [id])
  roleId              String
  role                Role              @relation(fields: [roleId], references: [id])
  requiredCount       Int               @default(1)
  isRequired          Boolean           @default(true) // For 3-in-box compliance
  
  assignments         ProjectRoleAssignment[]
  
  @@unique([projectId, roleId])
}

model ProjectRoleAssignment {
  id                  String            @id @default(uuid())
  projectRoleId       String
  projectRole         ProjectRole       @relation(fields: [projectRoleId], references: [id])
  personId            String
  person              Person            @relation(fields: [personId], references: [id])
  
  @@unique([projectRoleId, personId])
}

// ============== ALLOCATIONS ==============

model Allocation {
  id                  String            @id @default(uuid())
  personId            String
  person              Person            @relation(fields: [personId], references: [id])
  projectId           String
  project             Project           @relation(fields: [projectId], references: [id])
  phaseId             String?
  phase               Phase?            @relation(fields: [phaseId], references: [id])
  taskId              String?
  task                Task?             @relation(fields: [taskId], references: [id])
  
  startDate           DateTime
  endDate             DateTime
  hoursPerDay         Decimal
  
  allocationType      AllocationType
  status              AllocationStatus  @default(TENTATIVE)
  
  roleId              String?           // Role for this allocation (may differ from person default)
  role                Role?             @relation(fields: [roleId], references: [id])
  
  // Snapshot at creation for historical accuracy
  costRateCentsSnapshot Int
  
  notes               String?
  
  timeEntries         TimeEntry[]
  
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
  createdBy           String?
  updatedBy           String?
  
  @@index([personId])
  @@index([projectId])
  @@index([phaseId])
  @@index([startDate, endDate])
  @@index([status])
}

enum AllocationType {
  BILLABLE
  NON_BILLABLE
  INTERNAL
  BENCH
}

enum AllocationStatus {
  TENTATIVE
  CONFIRMED
  COMPLETED
}

// ============== TIME TRACKING ==============

model TimeEntry {
  id                  String            @id @default(uuid())
  personId            String
  person              Person            @relation(fields: [personId], references: [id])
  allocationId        String?
  allocation          Allocation?       @relation(fields: [allocationId], references: [id])
  projectId           String?
  project             Project?          @relation(fields: [projectId], references: [id])
  phaseId             String?
  phase               Phase?            @relation(fields: [phaseId], references: [id])
  taskId              String?
  task                Task?             @relation(fields: [taskId], references: [id])
  
  date                DateTime          @db.Date
  hours               Decimal
  entryType           TimeEntryType
  
  description         String?
  
  // Approval workflow
  status              TimeEntryStatus   @default(DRAFT)
  approvedById        String?
  approvedBy          Person?           @relation("Approver", fields: [approvedById], references: [id])
  approvedAt          DateTime?
  rejectionReason     String?
  lockedAt            DateTime?         // For ISO compliance
  
  // Audit trail
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
  createdBy           String
  updatedBy           String?
  
  @@index([personId])
  @@index([date])
  @@index([projectId])
  @@index([phaseId])
  @@index([status])
}

enum TimeEntryType {
  BILLABLE
  NON_BILLABLE
  INTERNAL
  BENCH
  LEAVE
}

enum TimeEntryStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  LOCKED
}

// ============== USERS & AUTH ==============

model User {
  id                  String            @id @default(uuid())
  email               String            @unique
  passwordHash        String?           // Null if SSO-only
  personId            String?           @unique
  role                UserRole          @default(TEAM_MEMBER)
  isActive            Boolean           @default(true)
  
  lastLoginAt         DateTime?
  
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
  
  @@index([role])
}

enum UserRole {
  PARTNER
  OPS_LEAD
  PRACTICE_LEAD
  PROJECT_MANAGER
  TEAM_MEMBER
  CONTRACTOR
  READ_ONLY
}

// ============== AUDIT LOG ==============

model AuditLog {
  id                  String            @id @default(uuid())
  entityType          String            // "Project", "Allocation", "TimeEntry", etc.
  entityId            String
  action              String            // "CREATE", "UPDATE", "DELETE", "APPROVE", "REJECT", "LOCK"
  changes             Json              // { field: { old: x, new: y } }
  userId              String
  userEmail           String
  ipAddress           String?
  userAgent           String?
  
  createdAt           DateTime          @default(now())
  
  @@index([entityType, entityId])
  @@index([userId])
  @@index([createdAt])
}
```

### Docker Compose (Local Development)

```yaml
# infrastructure/docker/docker-compose.yml

version: '3.8'

services:
  # ============== DATABASES ==============
  postgres:
    image: postgres:16-alpine
    container_name: vrm-postgres
    environment:
      POSTGRES_USER: valliance
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-localdev}
      POSTGRES_DB: valliance_rm
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U valliance -d valliance_rm"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: vrm-redis
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ============== SERVICES ==============
  api-gateway:
    build:
      context: ../../
      dockerfile: apps/api-gateway/Dockerfile
    container_name: vrm-api-gateway
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://valliance:${POSTGRES_PASSWORD:-localdev}@postgres:5432/valliance_rm
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:-dev-secret-change-me}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      PORT: 4000
    ports:
      - "4000:4000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ../../apps/api-gateway/src:/app/apps/api-gateway/src
      - ../../packages:/app/packages
    command: pnpm --filter api-gateway dev

  people-service:
    build:
      context: ../../
      dockerfile: apps/people-service/Dockerfile
    container_name: vrm-people-service
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://valliance:${POSTGRES_PASSWORD:-localdev}@postgres:5432/valliance_rm
      REDIS_URL: redis://redis:6379
      PORT: 4001
    ports:
      - "4001:4001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ../../apps/people-service/src:/app/apps/people-service/src
      - ../../packages:/app/packages
    command: pnpm --filter people-service dev

  project-service:
    build:
      context: ../../
      dockerfile: apps/project-service/Dockerfile
    container_name: vrm-project-service
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://valliance:${POSTGRES_PASSWORD:-localdev}@postgres:5432/valliance_rm
      REDIS_URL: redis://redis:6379
      PORT: 4002
    ports:
      - "4002:4002"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ../../apps/project-service/src:/app/apps/project-service/src
      - ../../packages:/app/packages
    command: pnpm --filter project-service dev

  scheduling-service:
    build:
      context: ../../
      dockerfile: apps/scheduling-service/Dockerfile
    container_name: vrm-scheduling-service
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://valliance:${POSTGRES_PASSWORD:-localdev}@postgres:5432/valliance_rm
      REDIS_URL: redis://redis:6379
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      PORT: 4003
    ports:
      - "4003:4003"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ../../apps/scheduling-service/src:/app/apps/scheduling-service/src
      - ../../packages:/app/packages
    command: pnpm --filter scheduling-service dev

  reporting-service:
    build:
      context: ../../
      dockerfile: apps/reporting-service/Dockerfile
    container_name: vrm-reporting-service
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://valliance:${POSTGRES_PASSWORD:-localdev}@postgres:5432/valliance_rm
      REDIS_URL: redis://redis:6379
      PORT: 4004
    ports:
      - "4004:4004"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ../../apps/reporting-service/src:/app/apps/reporting-service/src
      - ../../packages:/app/packages
    command: pnpm --filter reporting-service dev

  web:
    build:
      context: ../../
      dockerfile: apps/web/Dockerfile
    container_name: vrm-web
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_API_URL: http://localhost:4000
      NEXT_PUBLIC_GRAPHQL_URL: http://localhost:4000/graphql
    ports:
      - "3000:3000"
    depends_on:
      - api-gateway
    volumes:
      - ../../apps/web/src:/app/apps/web/src
      - ../../packages:/app/packages
    command: pnpm --filter web dev

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment (Production)

```yaml
# infrastructure/kubernetes/base/api-gateway-deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  labels:
    app: api-gateway
    tier: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
        tier: backend
    spec:
      containers:
        - name: api-gateway
          image: ${ECR_REGISTRY}/vrm-api-gateway:${IMAGE_TAG}
          ports:
            - containerPort: 4000
          envFrom:
            - configMapRef:
                name: vrm-config
            - secretRef:
                name: vrm-secrets
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
spec:
  selector:
    app: api-gateway
  ports:
    - protocol: TCP
      port: 4000
      targetPort: 4000
  type: ClusterIP
```

### AI Integration

```typescript
// apps/scheduling-service/src/ai/ai.service.ts

import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '@vrm/database';

interface RecommendationContext {
  projectId?: string;
  requiredSkills: string[];
  requiredRole?: string;
  dateRange: { start: Date; end: Date };
  budgetConstraintCents?: number;
  excludePersonIds?: string[];
}

interface AssignmentRecommendation {
  personId: string;
  personName: string;
  matchScore: number;
  reasoning: string;
  availableHours: number;
  dailyCostCents: number;
  totalCostCents: number;
  skillMatch: {
    skill: string;
    proficiency: string;
  }[];
}

@Injectable()
export class AIService {
  private anthropic: Anthropic;

  constructor(private prisma: PrismaService) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async getAssignmentRecommendations(
    context: RecommendationContext
  ): Promise<AssignmentRecommendation[]> {
    // Fetch available people with their skills and cost rates
    const availablePeople = await this.prisma.person.findMany({
      where: {
        status: 'ACTIVE',
        id: { notIn: context.excludePersonIds || [] },
      },
      include: {
        skills: { include: { skill: true } },
        role: true,
        allocations: {
          where: {
            OR: [
              { startDate: { lte: context.dateRange.end }, endDate: { gte: context.dateRange.start } },
            ],
            status: 'CONFIRMED',
          },
        },
      },
    });

    // Calculate availability and cost for each person
    const peopleWithAvailability = availablePeople.map(person => {
      const totalAllocatedHours = person.allocations.reduce((sum, a) => {
        const days = this.getBusinessDaysBetween(
          new Date(Math.max(a.startDate.getTime(), context.dateRange.start.getTime())),
          new Date(Math.min(a.endDate.getTime(), context.dateRange.end.getTime()))
        );
        return sum + days * Number(a.hoursPerDay);
      }, 0);

      const totalDays = this.getBusinessDaysBetween(context.dateRange.start, context.dateRange.end);
      const totalCapacity = totalDays * (Number(person.defaultHoursPerWeek) / 5);
      const availableHours = Math.max(0, totalCapacity - totalAllocatedHours);
      const totalCostCents = (availableHours / 8) * person.costRateCents;

      return {
        ...person,
        availableHours,
        utilisationDuringPeriod: totalAllocatedHours / totalCapacity,
        utilisationTarget: Number(person.utilisationTarget),
        totalCostCents,
        dailyCostCents: person.costRateCents,
      };
    });

    // Build prompt for Claude with full cost visibility
    const prompt = this.buildRecommendationPrompt(context, peopleWithAvailability);

    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    return this.parseRecommendations(response.content[0].text);
  }

  private buildRecommendationPrompt(
    context: RecommendationContext,
    people: any[]
  ): string {
    const budgetLine = context.budgetConstraintCents 
      ? `- Budget Constraint: £${(context.budgetConstraintCents / 100).toFixed(2)}`
      : '';

    return `You are an AI assistant helping with resource allocation for a consultancy.

## Task
Recommend the best people to assign to a project based on skill match, availability, cost efficiency, and utilisation balance.

## Requirements
- Required Skills: ${context.requiredSkills.join(', ')}
- Required Role: ${context.requiredRole || 'Any'}
- Date Range: ${context.dateRange.start.toISOString().split('T')[0]} to ${context.dateRange.end.toISOString().split('T')[0]}
${budgetLine}

## Available People (with confidential cost data)
${people.map(p => `
- ${p.name} (${p.role.name}, ${p.seniority}, ${p.type})
  - Skills: ${p.skills.map(s => `${s.skill.name} (${s.proficiency})`).join(', ')}
  - Available Hours: ${p.availableHours.toFixed(1)}
  - Daily Cost: £${(p.dailyCostCents / 100).toFixed(2)}
  - Total Cost for Period: £${(p.totalCostCents / 100).toFixed(2)}
  - Current Utilisation: ${(p.utilisationDuringPeriod * 100).toFixed(0)}%
  - Target Utilisation: ${(p.utilisationTarget * 100).toFixed(0)}%
`).join('\n')}

## Instructions
Return a JSON array of recommendations, ordered by best fit. Consider:
1. Skill match (highest priority)
2. Availability
3. Cost efficiency (prefer cost-effective options within budget)
4. Utilisation balance (prefer people below their target)
5. Employee vs Contractor (prefer employees when equivalent)

Include:
- personId
- personName
- matchScore (0-100)
- reasoning (brief explanation including cost consideration)
- availableHours
- dailyCostCents
- totalCostCents
- skillMatch (array of matching skills)

Return ONLY valid JSON, no additional text.`;
  }

  private parseRecommendations(text: string): AssignmentRecommendation[] {
    try {
      return JSON.parse(text);
    } catch {
      return [];
    }
  }

  private getBusinessDaysBetween(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }
}
```

### Data Sensitivity
```
CONFIDENTIAL (Partner/Ops Lead only):
- Person.costRate
- Person.utilisationTarget (for contractors)
- Project.estimatedCost, actualCost
- Phase.estimatedCostCents, actualCostCents
- Allocation.costAtAllocation
- All margin calculations
- AI recommendation cost reasoning

RESTRICTED (Practice Lead+):
- Project.estimatedValueCreated
- Project.valueSharePercentage
- Cross-practice utilisation

GENERAL:
- Schedules, allocations (without costs)
- Skills, availability
- Project status and timeline
- Approval status
```

### API Design Principles
- RESTful endpoints for CRUD operations
- GraphQL for complex reporting queries and frontend data aggregation
- Pagination for large datasets
- Rate limiting
- Audit logging on all mutations
- Cost data filtered by RBAC at API layer

---

## Integration Points

### Current Priority
1. **Notion** (export/sync project data)
2. **Excel** (import/export)

### Future Consideration
- **Xero**: Invoice generation, cost reconciliation
- **Google/Outlook Calendar**: Read-only sync for visibility
- **Slack**: Notifications, time logging reminders, approval requests

### API for External Integration
```
Public API (authenticated):
GET  /api/projects
GET  /api/people
GET  /api/allocations
POST /api/time-entries
GET  /api/reports/utilisation
GET  /api/reports/phase-budget

Webhooks:
- project.created
- project.status_changed
- allocation.created
- timeentry.submitted
- timeentry.approved
- timeentry.rejected
- phase.budget_warning
```

---

## Development Phases

### Phase 1: Foundation (MVP)
**Goal**: Core scheduling and time tracking with approval workflow
- People management (CRUD, skills, practices, utilisation targets)
- Project/Phase/Task hierarchy with phase budgets
- Basic allocation (drag-drop schedule)
- Time entry with approval workflow (PM/Ops approval)
- Utilisation report (respecting individual targets)
- Core RBAC (Partner, Ops Lead, Practice Lead, Project Manager, Team Member)

**Duration**: 4-6 weeks

### Phase 2: Commercial Model
**Goal**: Value-based tracking with Value Partner ownership
- Value/cost fields on projects
- Phase-level budget tracking with alerts
- Value Partner assignment and margin attribution
- Margin calculations
- Project health dashboard
- Cost visibility controls (full RBAC)
- Board-level reports

**Duration**: 3-4 weeks

### Phase 3: AI Integration
**Goal**: Smart scheduling with cost awareness
- Claude API integration with full cost access
- Assignment recommendations (skill + cost optimised)
- Natural language queries
- Skill gap analysis
- Budget optimisation suggestions

**Duration**: 3-4 weeks

### Phase 4: Compliance & Polish
**Goal**: Production-ready
- Full audit trail implementation
- ISO reports with approval history
- Read-only external access
- Data export (CSV, PDF, Excel)
- Performance optimisation
- Automated timesheet locking

**Duration**: 2-3 weeks

### Phase 5: Stretch Goals
- Timer-based time tracking
- Calendar integrations
- Xero integration
- Mobile app
- Revenue/cash flow forecasting
- Slack notifications for approvals

---

## Key Metrics & Calculations

### Utilisation
```typescript
// Weekly utilisation for a person
const weeklyCapacity = person.defaultHoursPerWeek - leaveHours - holidayHours;
const billableHours = timeEntries.filter(t => t.entryType === 'BILLABLE').sum('hours');
const nonBillableHours = timeEntries.filter(t => t.entryType === 'NON_BILLABLE').sum('hours');
const utilisationRate = (billableHours + nonBillableHours) / weeklyCapacity;

// Compare against individual target (80% default, varies for contractors)
const target = person.utilisationTarget;
const variance = utilisationRate - target;
const isUnderUtilised = utilisationRate < target;
```

### Project Margin (Value-Based)
```typescript
// For VALUE_SHARE model
const impliedRevenue = project.estimatedValueCreated * project.valueSharePercentage;
const phaseCosts = project.phases.sum(p => p.actualCostCents || 0);
const deliveryCost = phaseCosts * (1 + project.contingencyPercentage);
const grossMargin = impliedRevenue - deliveryCost;
const marginPercentage = grossMargin / impliedRevenue;

// For FIXED_PRICE model
const grossMargin = project.agreedFee - deliveryCost;
const marginPercentage = grossMargin / project.agreedFee;

// Margin attributed to Value Partner
const valuePartnerMargin = grossMargin; // Full margin to assigned Value Partner
```

### Phase Budget Status
```typescript
// Phase budget tracking
const estimatedCost = phase.estimatedCostCents;
const actualCost = phase.timeEntries
  .filter(t => t.status === 'APPROVED' || t.status === 'LOCKED')
  .sum(t => t.hours * (t.person.costRateCents / 8)); // Convert daily to hourly

const consumedPercentage = actualCost / estimatedCost;
const alertThreshold = phase.budgetAlertPct; // Default 80%

const status = consumedPercentage >= 1.0 ? 'EXCEEDED'
             : consumedPercentage >= alertThreshold ? 'WARNING'
             : 'ON_TRACK';
```

### 3-in-the-Box Compliance
```typescript
const requiredRoles = ['Consultant', 'Engineer', 'Orchestrator'];
const assignedRoles = project.projectRoles
  .filter(pr => pr.assignedPersons.length > 0)
  .map(pr => pr.role.name);
const isCompliant = requiredRoles.every(r => assignedRoles.includes(r));
```

---

## Glossary

| Term | Definition |
|------|------------|
| Allocation | A scheduled block of a person's time assigned to a project/phase |
| Bench | Available capacity not allocated to any project |
| Bootcamp | Initial engagement type, typically fixed-price discovery |
| Contingency | Percentage buffer added to cost estimates |
| Pilot | Proof-of-value engagement following a bootcamp |
| Practice | Business unit specialising in a technology (Agentic, Palantir, Sierra) |
| 3-in-the-Box | Required team composition: Consultant + Engineer + Orchestrator |
| Use Case Rollout | Full implementation following successful pilot |
| Utilisation | Percentage of available time allocated to billable/non-billable work |
| Utilisation Target | Individual target percentage (80% default, configurable for contractors) |
| Value Partner | Person who owns margin attribution for a project |
| Value Share | Commercial model where fee = percentage of value created for client |
| Phase Budget | Cost allocation to a specific SDLC phase within a project |

---

*Version: 1.1.0*
*Last Updated: 2025-01-28*
*Author: Claude (for Valliance)*
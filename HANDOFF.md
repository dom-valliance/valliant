# Valliance Project Management - Work Handoff Document

**Date**: 2026-01-30
**Phase**: Project Management Backend & Frontend (Option 1)
**Status**: Backend APIs Complete, Frontend API Clients In Progress

---

## 🎯 Current Status

### ✅ Completed Work

#### 1. People Management (100% Complete)
- **Backend**: Full CRUD API in people-service
  - People, Roles, Practices, Skills endpoints
  - All at `http://localhost:4001/`
- **Frontend**: Complete CRUD UI
  - List page: `/people`
  - Detail page: `/people/[id]`
  - Create page: `/people/new`
  - Edit page: `/people/[id]/edit`
  - Delete functionality with confirmation dialog
  - React hooks: `usePeople`, `usePerson`, `useCreatePerson`, `useUpdatePerson`, `useDeletePerson`

#### 2. Project Management Backend (100% Complete)
All services created in `apps/project-service/src/`:

- **Clients Module** ✅
  - `clients/clients.service.ts` - Full CRUD with project counts
  - `clients/clients.controller.ts` - REST endpoints
  - `clients/clients.module.ts`
  - Endpoints: GET/POST/PUT/DELETE at `http://localhost:4002/clients`

- **Projects Module** ✅
  - `projects/projects.service.ts` - Full CRUD with update/delete added
  - `projects/projects.controller.ts` - REST endpoints with PUT/DELETE
  - `projects/projects.module.ts`
  - Endpoints: GET/POST/PUT/DELETE at `http://localhost:4002/projects`

- **Phases Module** ✅
  - `phases/phases.service.ts` - Full CRUD with BigInt handling for budgets
  - `phases/phases.controller.ts` - REST endpoints with query filters
  - `phases/phases.module.ts`
  - Endpoints: GET/POST/PUT/DELETE at `http://localhost:4002/phases?projectId=X`

- **Tasks Module** ✅
  - `tasks/tasks.service.ts` - Full CRUD
  - `tasks/tasks.controller.ts` - REST endpoints with query filters
  - `tasks/tasks.module.ts`
  - Endpoints: GET/POST/PUT/DELETE at `http://localhost:4002/tasks?phaseId=X`

- **App Module Updated** ✅
  - `app.module.ts` - All modules imported: ClientsModule, ProjectsModule, PhasesModule, TasksModule

#### 3. Frontend API Clients (50% Complete)
Created in `apps/web/src/lib/api/`:

- **clients.ts** ✅
  - `Client` interface
  - `CreateClientDto`, `UpdateClientDto` interfaces
  - `clientsService` with getAll, getById, create, update, delete

- **projects.ts** ✅
  - `Project` interface with all fields (commercial model, value tracking, etc.)
  - `CreateProjectDto`, `UpdateProjectDto` interfaces
  - `projectsService` with getAll, getById, create, update, delete

---

## 🔄 Currently In Progress

### Frontend API Clients (Need to Complete)
Still need to create in `apps/web/src/lib/api/`:

1. **phases.ts** - NOT CREATED YET
   ```typescript
   export interface Phase {
     id: string;
     projectId: string;
     name: string;
     phaseType: 'DISCOVERY' | 'DESIGN' | 'BUILD' | 'TEST' | 'DEPLOY' | 'HYPERCARE' | 'CUSTOM';
     status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
     startDate: string;
     endDate?: string;
     estimatedHours?: number;
     estimatedCostCents?: string;
     budgetAlertPct?: number;
     sortOrder: number;
     // ... include related data
   }

   export const phasesService = {
     getAll, getByProject, getById, create, update, delete
   }
   ```

2. **tasks.ts** - NOT CREATED YET
   ```typescript
   export interface Task {
     id: string;
     phaseId: string;
     name: string;
     description?: string;
     estimatedHours?: number;
     status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
     priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
     sortOrder: number;
     // ... include related data
   }

   export const tasksService = {
     getAll, getByPhase, getById, create, update, delete
   }
   ```

---

## 📋 Next Steps (In Order)

### Step 1: Complete Frontend API Clients (20 min)

Create these two files following the pattern from `clients.ts` and `projects.ts`:

- [ ] `apps/web/src/lib/api/phases.ts`
- [ ] `apps/web/src/lib/api/tasks.ts`

### Step 2: Create React Hooks (30 min)

Create in `apps/web/src/hooks/`:

- [ ] `use-clients.ts`
  ```typescript
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { clientsService } from '@/lib/api/clients';

  export const CLIENTS_QUERY_KEY = ['clients'];

  export function useClients() { ... }
  export function useClient(id: string) { ... }
  export function useCreateClient() { ... }
  export function useUpdateClient() { ... }
  export function useDeleteClient() { ... }
  ```

- [ ] `use-projects.ts` (similar pattern)
- [ ] `use-phases.ts` (similar pattern)
- [ ] `use-tasks.ts` (similar pattern)

**Follow the pattern from** `apps/web/src/hooks/use-people.ts`

### Step 3: Build Clients UI (2-3 hours)

- [ ] `apps/web/src/app/clients/page.tsx` - List page with table
  - Show: Client Name, Industry, Contact, Email, Project Count
  - "Add New Client" button
  - Click row to navigate to detail

- [ ] `apps/web/src/app/clients/[id]/page.tsx` - Detail page
  - Basic info card
  - Projects list (linked to project detail pages)
  - Edit and Delete buttons

- [ ] `apps/web/src/app/clients/new/page.tsx` - Create form
  - Name, Industry, Primary Contact, Contact Email, Notes

- [ ] `apps/web/src/app/clients/[id]/edit/page.tsx` - Edit form
  - Pre-populated with existing data
  - Same fields as create

**Follow the pattern from** `apps/web/src/app/people/` pages

### Step 4: Build Projects UI (4-5 hours)

This is more complex due to value-based commercial model and phase budgeting.

- [ ] `apps/web/src/app/projects/page.tsx` - List page
  - Columns: Code, Name, Client, Status, Type, Value Partner, Start Date
  - Color-coded status badges
  - Filter by status/practice

- [ ] `apps/web/src/app/projects/[id]/page.tsx` - Detail page
  - **Card 1**: Basic Info (name, code, client, status, dates)
  - **Card 2**: Commercial Model
    - Show model type (Value Share / Fixed Price / Hybrid)
    - Estimated Value Created
    - Value Share % or Agreed Fee
    - Implied Revenue calculation
  - **Card 3**: Team & Practices
    - Primary Practice
    - Value Partner
    - Team Model (3-in-the-Box compliance)
  - **Card 4**: Phases List
    - Phase name, type, status, dates
    - Budget: Estimated vs Actual (if available)
    - Click to expand phase details with tasks
  - Edit and Delete buttons

- [ ] `apps/web/src/app/projects/new/page.tsx` - Create form
  - **Section 1**: Basic Information
    - Name, Code, Client (dropdown), Start Date, End Date
  - **Section 2**: Organization
    - Primary Practice (dropdown)
    - Value Partner (dropdown - people with PARTNER seniority)
    - Project Type (Bootcamp/Pilot/Rollout)
    - Team Model (3-in-the-Box/Flexible)
  - **Section 3**: Commercial Model
    - Model selection (Value Share/Fixed Price/Hybrid)
    - Conditional fields based on selection:
      - Value Share: Estimated Value, Value Share %
      - Fixed Price: Agreed Fee
    - Contingency %
  - **Section 4**: Notes

- [ ] `apps/web/src/app/projects/[id]/edit/page.tsx` - Edit form
  - Same structure as create, pre-populated

### Step 5: Add Phases & Tasks to Project Detail (2-3 hours)

Enhance the project detail page:

- [ ] Add "Add Phase" button in phases section
- [ ] Create `apps/web/src/components/projects/phase-card.tsx`
  - Show phase info, budget status
  - Expandable to show tasks list
  - "Add Task" button within phase
- [ ] Inline phase creation modal/form
- [ ] Inline task creation within phase

### Step 6: Testing (1 hour)

- [ ] Test full client CRUD workflow
- [ ] Test full project CRUD workflow
- [ ] Test project with phases and tasks
- [ ] Verify value-based calculations display correctly
- [ ] Test phase budget tracking
- [ ] Verify 3-in-the-Box indicator

---

## 🔑 Key Design Patterns to Follow

### 1. File Structure Pattern
```
apps/web/src/app/[domain]/
├── page.tsx                    # List page
├── [id]/
│   ├── page.tsx               # Detail wrapper (async)
│   ├── [domain]-detail-client.tsx  # Detail client component
│   └── edit/
│       ├── page.tsx           # Edit wrapper (async)
│       └── edit-[domain]-client.tsx  # Edit client component
└── new/
    └── page.tsx               # Create page (client component)
```

### 2. API Client Pattern
```typescript
// Use apiClient from api-client.ts
import { apiClient, API_SERVICES } from './api-client';

export const [domain]Service = {
  async getAll(): Promise<Entity[]> {
    const response = await apiClient.get(`${API_SERVICES.PROJECT}/[domain]`);
    return response.data;
  },
  // ... create, update, delete
};
```

### 3. React Hook Pattern
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const ENTITY_QUERY_KEY = ['entities'];

export function useEntities() {
  return useQuery({
    queryKey: ENTITY_QUERY_KEY,
    queryFn: () => service.getAll(),
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDto) => service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTITY_QUERY_KEY });
    },
  });
}
```

### 4. Form Handling Pattern
```typescript
const [formData, setFormData] = useState({ /* initial values */ });
const [error, setError] = useState<string | null>(null);
const createEntity = useCreateEntity();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  if (!formData.requiredField) {
    setError('Please fill in all required fields');
    return;
  }

  try {
    await createEntity.mutateAsync(formData);
    router.push('/[domain]');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to create');
  }
};
```

---

## 🗄️ Database Schema Reference

### Key Tables for Project Management

```prisma
Client {
  id, name, industry, primaryContact, contactEmail, notes
  projects: Project[]
}

Project {
  id, name, code, status
  clientId, client
  primaryPracticeId, primaryPractice
  valuePartnerId, valuePartner

  // Commercial
  commercialModel: VALUE_SHARE | FIXED_PRICE | HYBRID
  estimatedValueCents: BigInt
  valueSharePct: Decimal
  agreedFeeCents: BigInt
  contingencyPct: Decimal

  // Type & Team
  projectType: BOOTCAMP | PILOT | USE_CASE_ROLLOUT
  teamModel: THREE_IN_BOX | FLEXIBLE

  // Relations
  phases: Phase[]
  practices: ProjectPractice[]
}

Phase {
  id, name, phaseType, status
  projectId, project
  startDate, endDate
  estimatedHours, estimatedCostCents, budgetAlertPct
  sortOrder
  tasks: Task[]
}

Task {
  id, name, description, estimatedHours
  phaseId, phase
  status: TODO | IN_PROGRESS | DONE | BLOCKED
  priority: LOW | MEDIUM | HIGH | CRITICAL
  requiredRoleId, sortOrder
}
```

---

## 🎨 UI Components Already Available

In `apps/web/src/components/ui/`:
- ✅ button, card, table, badge, input, label, select, alert-dialog
- ✅ All shadcn/ui components properly configured

**Color Coding Convention**:
- Status badges:
  - `ACTIVE`, `CONFIRMED` → green (`variant="success"`)
  - `PROSPECT`, `DISCOVERY`, `ON_HOLD` → yellow (`variant="warning"`)
  - `COMPLETED` → blue (`variant="secondary"`)
  - `CANCELLED` → gray (`variant="outline"`)

---

## 💡 Important Context

### Value-Based Commercial Model
This is a **key differentiator**. Projects track:
1. **Estimated Value Created** for the client
2. **Value Share %** that Valliance takes
3. **Implied Revenue** = Value × Share %
4. **Delivery Cost** = sum of phase costs + contingency
5. **Gross Margin** = Revenue - Cost

The UI should prominently display these calculations on project detail pages.

### Phase-Level Budgeting
Each phase has its own budget (`estimatedCostCents`) that rolls up to project total:
```
Project Total Cost = sum(phase.estimatedCostCents) × (1 + contingencyPct)
```

Show budget status per phase with color indicators:
- Green: < 80% consumed
- Yellow: 80-100% consumed (warning)
- Red: > 100% consumed (exceeded)

### 3-in-the-Box Model
When `teamModel = THREE_IN_BOX`, the system should flag if these roles aren't all assigned:
- Consultant
- Engineer
- Orchestrator

Show a visual indicator (badge or icon) on project detail page.

### Multi-Practice Projects
Projects can involve multiple practices, but one **Value Partner** owns the margin attribution. This is important for reporting later.

---

## 🚀 Running the Application

### Start All Services
```bash
# From root directory
yarn dev

# Or individually:
yarn workspace @vrm/web dev          # Frontend: http://localhost:3000
yarn workspace people-service dev     # Backend: http://localhost:4001
yarn workspace project-service dev    # Backend: http://localhost:4002
```

### Database
```bash
# If you need to reset/migrate
yarn db:push
yarn db:seed
```

### Environment
Ensure `.env` exists in root with:
```
DATABASE_URL="postgresql://valliance:localdev@localhost:5432/valliance_rm"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="dev-secret-change-me"
```

---

## 📝 Current Todo List

```
[✅] Create Clients API endpoints in project-service
[✅] Create Projects API endpoints in project-service
[✅] Create Phases API endpoints in project-service
[✅] Create Tasks API endpoints in project-service
[🔄] Create frontend API clients for projects domain (50% - need phases.ts, tasks.ts)
[  ] Create React hooks for projects domain
[  ] Build Clients list and CRUD pages
[  ] Build Projects list and CRUD pages
[  ] Test project management workflow
```

---

## 🎯 Success Criteria

When this phase is complete, you should be able to:

1. ✅ Create a new client
2. ✅ Create a project for that client with:
   - Value-based commercial model
   - Primary practice and value partner
   - Project type and team model
3. ✅ Add phases to the project (Discovery, Design, Build, etc.)
4. ✅ Add tasks within each phase
5. ✅ View project detail showing:
   - Commercial model and value calculations
   - Phase budget status
   - 3-in-the-Box compliance indicator
6. ✅ Edit and delete clients and projects

---

## 📚 Reference Files

### Key Files to Review Before Starting
1. `apps/web/src/app/people/` - Complete CRUD example
2. `apps/web/src/hooks/use-people.ts` - React hooks pattern
3. `apps/web/src/lib/api/clients.ts` - API client pattern (already created)
4. `CLAUDE.md` - Full project specification (lines 1-1521)

### Documentation
- `README.md` - Setup instructions
- `GETTING_STARTED.md` - Step-by-step guide
- `CLAUDE.md` - Complete specification with domain model

---

## 🐛 Known Issues / Notes

1. **BigInt Handling**: Phase budgets use `BigInt` in Prisma. Convert to string when sending to frontend:
   ```typescript
   estimatedCostCents: data.estimatedCostCents ? BigInt(data.estimatedCostCents) : null
   ```

2. **Date Formatting**: Use `formatDate` utility from `@/lib/utils` for consistent date display

3. **Cost Rate Visibility**: Cost rates are confidential - only visible to Partner/Ops Lead roles (RBAC not implemented in Phase 1, but keep in mind for later)

4. **Async Params**: Next.js 14 requires unwrapping params:
   ```typescript
   export default async function Page({ params }: { params: Promise<{ id: string }> }) {
     const { id } = await params;
     return <ClientComponent id={id} />;
   }
   ```

---

## 🤝 Handoff Complete

This document should contain everything needed to continue the work. If you have questions about any specific implementation detail, refer to the existing `people` module code as the reference implementation.

**Estimated Time to Complete Remaining Work**: 8-12 hours

Good luck! 🚀

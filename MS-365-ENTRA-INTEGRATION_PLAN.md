# MS365 Entra ID Integration Plan

## Overview

Integrate Microsoft 365 Entra ID (Azure AD) as the source of truth for people/identity information in the Valliance Resource Management System. This enables SSO authentication and automatic user provisioning while maintaining local override fields for business-specific data.

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     ENTRA ID (Azure AD)                         │
│   Users · Groups · MS Graph API (/users, /groups, delta)        │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ SSO Auth │   │ Periodic │   │ On-Login │
        │  (OIDC)  │   │   Sync   │   │   Sync   │
        └──────────┘   └──────────┘   └──────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                               │
│   EntraModule · OIDCStrategy · EntraSyncService · GraphClient   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                │
│   User (extended) · Person · EntraIdentity (new) · GroupMapping │
└─────────────────────────────────────────────────────────────────┘
```

---

## Field Mapping Strategy

### Synced from Entra (Source of Truth)
| Entra Field | VRM Field | Notes |
|-------------|-----------|-------|
| `id` (objectId) | `EntraIdentity.entraObjectId` | Immutable identifier |
| `userPrincipalName` | `User.email`, `Person.email` | Primary identifier |
| `displayName` | `Person.name` | Auto-updated on sync |
| `department` | `Person.departmentId` | Auto-create Department if new |
| `accountEnabled` | `User.isActive`, `Person.status` | `false` → OFFBOARDED |
| `jobTitle` | Mapped to `Role` | Best-effort matching |
| Group membership | `User.role` | Via configurable mapping |
| `photo` | `Person.photoUrl` | Cached locally |

### Local Override Fields (Never synced from Entra)
- `costRateCents` / `costRateCurrency` (confidential)
- `utilisationTarget`
- `workingDays`
- `defaultHoursPerWeek`
- `seniority`
- `skills` (PersonSkill)
- `practices` (PracticeMember)
- `type` (EMPLOYEE/CONTRACTOR)
- `notes`

---

## Database Schema Changes

### New Models

```prisma
// Track Entra ID sync state
model EntraIdentity {
  id                  String    @id @default(uuid())
  entraObjectId       String    @unique  // Azure AD Object ID
  upn                 String    @unique  // User Principal Name
  displayName         String
  givenName           String?
  surname             String?
  jobTitle            String?
  department          String?
  accountEnabled      Boolean   @default(true)
  photoUrl            String?
  lastSyncedAt        DateTime  @default(now())
  rawData             Json?
  userId              String?   @unique
  user                User?     @relation(fields: [userId], references: [id])
}

// Map Entra groups to application roles
model EntraGroupMapping {
  id                  String    @id @default(uuid())
  entraGroupId        String    @unique
  entraGroupName      String
  applicationRole     UserRole
  priority            Int       @default(0)  // Higher = precedence
  isActive            Boolean   @default(true)
}

// Audit sync operations
model EntraSyncLog {
  id                  String          @id @default(uuid())
  syncType            EntraSyncType   // FULL, DELTA, LOGIN
  status              EntraSyncStatus // STARTED, COMPLETED, FAILED
  usersProcessed      Int             @default(0)
  usersCreated        Int             @default(0)
  usersUpdated        Int             @default(0)
  usersDisabled       Int             @default(0)
  errors              Json?
  startedAt           DateTime        @default(now())
  completedAt         DateTime?
  deltaToken          String?
}
```

### Modified User Model

```prisma
model User {
  // ... existing fields ...
  authProvider        AuthProvider  @default(LOCAL)   // LOCAL | ENTRA
  roleSource          RoleSource    @default(LOCAL)   // LOCAL | ENTRA_GROUP
  roleOverride        UserRole?     // Manual override of Entra-derived role
  entraIdentity       EntraIdentity?
}
```

### Modified Person Model

```prisma
model Person {
  // ... existing fields ...
  photoUrl            String?
  entraProvisioned    Boolean   @default(false)
}
```

---

## Backend Implementation

### New Module Structure

```
apps/api-gateway/src/auth/entra/
├── entra.module.ts
├── entra-auth.strategy.ts      # OIDC/Bearer token validation
├── entra-sync.service.ts       # MS Graph sync logic
├── entra-graph.client.ts       # Graph API wrapper
├── group-role-mapper.service.ts
├── entra.controller.ts         # SSO endpoints, admin sync
├── entra-sync.cron.ts          # Scheduled sync jobs
└── dto/
    ├── entra-callback.dto.ts
    └── group-mapping.dto.ts
```

### Key Dependencies

```json
{
  "@azure/identity": "^4.0.0",
  "@azure/msal-node": "^2.6.0",
  "@microsoft/microsoft-graph-client": "^3.0.7",
  "passport-azure-ad": "^4.3.5"
}
```

### API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/entra/login` | GET | Public | Redirect to Microsoft login |
| `/auth/entra/callback` | GET | Public | OAuth callback, returns JWT |
| `/auth/entra/token` | POST | Entra Bearer | Exchange Entra token for app JWT |
| `/auth/entra/sync` | POST | PARTNER/OPS_LEAD | Trigger manual sync |
| `/auth/entra/sync/logs` | GET | PARTNER/OPS_LEAD | View sync history |
| `/auth/entra/groups/mappings` | GET/POST | PARTNER | Manage group→role mappings |
| `/auth/entra/groups/available` | GET | PARTNER | List Entra groups for mapping |

### Sync Strategy

**Directory Sync (Person records)** - Proactive sync from Entra:
1. **Delta Sync**: Every 6 hours - creates/updates Person records as employees are added/changed in Entra
2. **Full Sync**: Daily at 2 AM - complete reconciliation of all Entra users
3. Person records exist before the employee logs in for the first time

**Auth Sync (User records)** - On-demand:
1. **On First Login**: User record created when employee authenticates via SSO
2. Links to existing Person record (matched by email/UPN)
3. If no Person exists (edge case), creates one from Entra profile

**Key Distinction**:
- Person = directory/HR record (synced proactively from Entra)
- User = authentication account (created on first login)

---

## Frontend Implementation

### Login Page Changes

- Primary: "Sign in with Microsoft" button (Entra SSO)
- Secondary: Collapsible local login form (for contractors)

### New Admin UI

- `/settings/entra` page for Partners
  - View sync status and logs
  - Trigger manual sync
  - Configure group→role mappings

### Auth Store Updates

- Add `loginWithEntra()` method
- Add `handleEntraCallback(token)` for OAuth redirect
- Track `authProvider` ('LOCAL' | 'ENTRA')
- Logout: Also sign out from Microsoft if Entra auth

---

## Implementation Phases

### Phase 1: Preparation (Week 1)
- [ ] Register App in Azure Portal (Entra ID)
- [ ] Configure redirect URIs and API permissions
- [ ] Create Entra groups for role mapping (VRM-Partners, VRM-OpsLeads, etc.)
- [ ] Deploy database migrations

### Phase 2: Backend (Weeks 2-3)
- [ ] Implement EntraModule with all services
- [ ] Add OIDC strategy and dual-auth guard support
- [ ] Build MS Graph client for user/group queries
- [ ] Implement sync service (login, delta, full)
- [ ] Add scheduled sync jobs
- [ ] Write unit and integration tests

### Phase 3: Frontend (Week 3)
- [ ] Update login page with Microsoft SSO
- [ ] Handle OAuth callback and token storage
- [ ] Build admin UI for group mappings and sync
- [ ] Update auth store

### Phase 4: Migration (Week 4)
- [ ] Run initial full sync → creates Person records for all Entra users
- [ ] Link existing Person records to EntraIdentity by email
- [ ] Link existing Users to their Person records
- [ ] Review auto-created Person records, fill in business fields (costRate, seniority, practices)
- [ ] Test all login flows

### Phase 5: Rollout (Week 5)
- [ ] Soft launch: Both auth methods enabled
- [ ] Monitor success/failure rates
- [ ] Full transition: Deprecate local login for employees
- [ ] Keep local auth for contractors

---

## Critical Files to Modify

| File | Changes |
|------|---------|
| [schema.prisma](packages/database/prisma/schema.prisma) | Add EntraIdentity, EntraGroupMapping, EntraSyncLog; modify User, Person |
| [auth.module.ts](apps/api-gateway/src/auth/auth.module.ts) | Import EntraModule, configure strategies |
| [auth.service.ts](apps/api-gateway/src/auth/auth.service.ts) | Add dual-auth support, token generation |
| [auth-store.ts](apps/web/src/stores/auth-store.ts) | Add loginWithEntra, handleEntraCallback |
| [login/page.tsx](apps/web/src/app/(auth)/login/page.tsx) | Add Microsoft SSO button |

### New Files to Create

| File | Purpose |
|------|---------|
| `apps/api-gateway/src/auth/entra/entra.module.ts` | Entra module definition |
| `apps/api-gateway/src/auth/entra/entra-auth.strategy.ts` | Passport OIDC strategy |
| `apps/api-gateway/src/auth/entra/entra-sync.service.ts` | Sync logic |
| `apps/api-gateway/src/auth/entra/entra-graph.client.ts` | MS Graph API client |
| `apps/api-gateway/src/auth/entra/group-role-mapper.service.ts` | Group→role mapping |
| `apps/api-gateway/src/auth/entra/entra.controller.ts` | REST endpoints |
| `apps/api-gateway/src/auth/entra/entra-sync.cron.ts` | Scheduled jobs |
| `apps/web/src/app/(dashboard)/settings/entra/page.tsx` | Admin UI |

---

## Environment Configuration

```env
# Entra ID Configuration
ENTRA_TENANT_ID=your-tenant-id
ENTRA_CLIENT_ID=your-client-id
ENTRA_CLIENT_SECRET=your-client-secret
ENTRA_REDIRECT_URI=http://localhost:4000/api/auth/entra/callback

# Feature Flags
AUTH_ENTRA_ENABLED=true
AUTH_LOCAL_ENABLED=true
AUTH_AUTO_PROVISION_PERSON=true
```

---

## Entra ID App Registration Requirements

### API Permissions (Application)
- `User.Read.All` - Read all user profiles
- `Group.Read.All` - Read group memberships
- `GroupMember.Read.All` - Read group members

### API Permissions (Delegated)
- `User.Read` - Read signed-in user profile
- `openid`, `profile`, `email` - OIDC scopes

### Redirect URIs
- `http://localhost:4000/api/auth/entra/callback` (dev)
- `https://vrm.valliance.ai/api/auth/entra/callback` (prod)

---

## Verification Plan

1. **Unit Tests**: Sync service, group mapper, strategy validation
2. **Integration Tests**: Full OAuth flow, sync endpoints
3. **Manual Testing**:
   - [ ] New employee SSO login → auto-provisions User + Person
   - [ ] Existing employee SSO → links to existing User
   - [ ] Contractor local login → works as before
   - [ ] Entra account disabled → Person status = OFFBOARDED
   - [ ] Group change → role updates on next login
   - [ ] Manual role override → persists after sync
   - [ ] Full sync → completes without errors

---

## Rollback Plan

1. Set `AUTH_ENTRA_ENABLED=false` in environment
2. All users fall back to local login
3. EntraIdentity records preserved but unused
4. Fix issues, re-enable, run delta sync

---

## Sync Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    ENTRA ID DIRECTORY                            │
│                  (Source of Truth for Identity)                  │
└──────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
          ▼                                       ▼
┌──────────────────────┐              ┌──────────────────────┐
│  PERIODIC SYNC JOB   │              │   FIRST SSO LOGIN    │
│  (Every 6h / Daily)  │              │                      │
└──────────────────────┘              └──────────────────────┘
          │                                       │
          ▼                                       ▼
┌──────────────────────┐              ┌──────────────────────┐
│ Create/Update PERSON │              │    Create USER       │
│ records from Entra   │              │ (auth account)       │
│                      │              │                      │
│ • name, email        │              │ • Link to Person     │
│ • department         │              │ • Set role from      │
│ • status             │              │   Entra groups       │
│ • photo              │              │ • Generate JWT       │
└──────────────────────┘              └──────────────────────┘
          │                                       │
          │       ┌───────────────────────────────┘
          ▼       ▼
┌──────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │ EntraIdentity   │───▶│     Person      │◀───│    User      │ │
│  │ (sync metadata) │    │ (employee data) │    │ (auth acct)  │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│                                                                  │
│  Local-only fields (not synced):                                │
│  • costRateCents, utilisationTarget, seniority                  │
│  • skills, practices, workingDays                               │
└──────────────────────────────────────────────────────────────────┘
```

**Timeline Example**:
1. HR adds "Alice Smith" to Entra ID
2. Next sync job runs → Person record created for Alice
3. Admin fills in costRate, seniority, practices for Alice
4. Alice logs in via SSO → User record created, linked to existing Person
5. Alice can now access the system with her assigned role

---

## Design Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| **Hybrid Auth** | Yes - Entra SSO for employees, local login for contractors |
| **Person Sync** | Proactive - Person records synced from Entra as employees are added |
| **User Creation** | On first login - User record created when employee authenticates |
| **Person Type** | Default to EMPLOYEE - contractors are manual with local accounts |
| **Role Override** | Yes - Partners can override Entra-derived roles locally |

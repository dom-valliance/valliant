# Scripts

Utility scripts for managing the Valliance Resource Management system.

## HubSpot Sync Scripts

### Reset HubSpot Sync State

**Purpose:** Reset the HubSpot sync state to allow re-syncing from a specific date.

**When to use:**
- Syncs have failed and the `lastSuccessfulSync` timestamp was still updated
- You need to re-import all HubSpot projects from scratch
- Testing sync functionality

**Usage:**
```bash
yarn hubspot:reset-sync
```

**What it does:**
1. Shows current sync state (last sync time, counts)
2. Resets `lastSuccessfulSync` to January 1, 2025
3. Resets all counters (deals, projects, clients) to 0
4. Shows recent sync logs for debugging

**After running:**
The next sync (via the HubSpot service API endpoint) will fetch all projects/deals modified since January 1, 2025.

**Customizing the reset date:**
Edit the `resetDate` variable in [reset-hubspot-sync.ts](./reset-hubspot-sync.ts):
```typescript
const resetDate = new Date('2025-01-01T00:00:00Z'); // Change this date as needed
```

---

## Other Scripts

### Port Cleanup
```bash
yarn cleanup
```
Kills processes running on common development ports.

### Docker Management
```bash
yarn docker:up    # Start all services
yarn docker:down  # Stop all services
yarn docker:logs  # View logs
```

### Database Management
```bash
yarn db:migrate   # Run migrations
yarn db:push      # Push schema changes
yarn db:generate  # Generate Prisma client
yarn db:seed      # Seed database
yarn db:studio    # Open Prisma Studio
```

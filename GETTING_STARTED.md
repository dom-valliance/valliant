# Getting Started with Valliance Resource Management

This guide will help you get the Valliance Resource Management System up and running on your local machine.

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js 20+ installed ([Download](https://nodejs.org/))
- ✅ Yarn 4+ installed ([Install](https://yarnpkg.com/getting-started/install))
- ✅ Docker Desktop running ([Download](https://www.docker.com/products/docker-desktop/))
- ✅ Git installed

## Step-by-Step Setup

### Step 1: Environment Setup

```bash
# Copy environment variables
cp .env.example .env

# Edit .env and add your Anthropic API key (optional for Phase 1)
# DATABASE_URL is already configured for Docker
```

### Step 2: Install Dependencies

```bash
# Run the setup script (recommended)
./scripts/setup.sh

# Or manually:
yarn install
```

### Step 3: Start Infrastructure

```bash
# Start PostgreSQL and Redis
yarn docker:up

# Verify containers are running
docker ps
# You should see: vrm-postgres, vrm-redis, vrm-adminer, vrm-redis-commander
```

### Step 4: Initialize Database

```bash
# Generate Prisma client
yarn db:generate

# Run database push
yarn db:push

# Run database migrations
yarn db:migrate

# Seed with sample data
yarn db:seed
```

You should see output like:
```
🌱 Seeding database...
✓ Created roles
✓ Created practices
✓ Created skills
✓ Created sample people
✓ Created sample client
✓ Created sample project
✅ Database seeded successfully!
```

### Step 5: Start Development Servers

```bash
# Start all services
yarn dev
```

This will start:
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **GraphQL Playground**: http://localhost:4000/graphql
- **People Service**: http://localhost:4001
- **Project Service**: http://localhost:4002
- **Scheduling Service**: http://localhost:4003
- **Reporting Service**: http://localhost:4004

### Step 6: Explore the Application

Open your browser to http://localhost:3000 and you'll see the home page with navigation to:
- People Management
- Projects
- Schedule
- Time Tracking
- Reports
- AI Assistant

## Sample Data

After seeding, you'll have:

### Sample People
- **Alice Partner** (alice.partner@valliance.ai) - Partner in Agentic Practice
- **Bob Engineer** (bob.engineer@valliance.ai) - Senior Engineer in Palantir Practice

### Sample Client
- **Acme Corporation** - Financial Services client

### Sample Project
- **Acme AI Transformation Pilot** (ACME-2025-001)
  - Type: PILOT
  - Commercial Model: VALUE_SHARE (15% of £5M)
  - Status: ACTIVE
  - Phase: Discovery (In Progress)

## Development Tools

### Database Management

```bash
# Open Prisma Studio (visual database browser)
yarn db:studio
# Access at: http://localhost:5555
```

Or use **Adminer** at http://localhost:8080:
- System: PostgreSQL
- Server: postgres
- Username: valliance
- Password: localdev
- Database: valliance_rm

### Redis Management

**Redis Commander** at http://localhost:8081 lets you inspect:
- Event channels
- Job queues
- Cached data

### GraphQL Playground

Visit http://localhost:4000/graphql to explore the GraphQL API.

Try this query:
```graphql
query {
  # Add queries here once GraphQL resolvers are implemented
}
```

## Common Tasks

### Adding a New Person

```bash
# Via REST API
curl -X POST http://localhost:4001/people \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Charlie Consultant",
    "email": "charlie@valliance.ai",
    "type": "EMPLOYEE",
    "roleId": "<role-id>",
    "costRateCents": 80000,
    "seniority": "SENIOR",
    "startDate": "2025-02-01"
  }'
```

### Viewing All People

```bash
# Via REST API
curl http://localhost:4001/people

# Or visit the frontend at http://localhost:3000/people (when implemented)
```

### Creating a Project

```bash
# Via REST API
curl -X POST http://localhost:4002/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Client Engagement",
    "code": "CLIENT-2025-002",
    "clientId": "<client-id>",
    "primaryPracticeId": "<practice-id>",
    "valuePartnerId": "<person-id>",
    "commercialModel": "VALUE_SHARE",
    "projectType": "BOOTCAMP",
    "startDate": "2025-03-01"
  }'
```

## Troubleshooting

### Port Already in Use

If you see errors about ports being in use:

```bash
# Find process using port
lsof -ti:3000  # or whatever port

# Kill the process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart Docker services
yarn docker:down
yarn docker:up

# Check connection
docker exec -it vrm-postgres psql -U valliance -d valliance_rm -c "SELECT version();"
```

### Prisma Client Not Generated

```bash
# Regenerate Prisma client
yarn db:generate
```

### Reset Everything

```bash
# Stop all services
yarn docker:down

# Clean everything
yarn clean

# Start fresh
./scripts/setup.sh
```

## Next Steps

Now that you have the system running:

1. **Explore the Codebase**
   - Check [apps/web/src/app/page.tsx](apps/web/src/app/page.tsx) for the frontend
   - Review [apps/people-service/src/people/people.service.ts](apps/people-service/src/people/people.service.ts) for backend logic
   - Study [packages/database/prisma/schema.prisma](packages/database/prisma/schema.prisma) for the data model

2. **Read the Documentation**
   - [CLAUDE.md](CLAUDE.md) - Complete system specification
   - [README.md](README.md) - Project overview and commands

3. **Start Building**
   - Phase 1 features are ready to implement
   - Follow the 3-in-the-box delivery model
   - Use the TodoWrite tool to track progress

## Development Workflow

```bash
# Make changes to any service
# Hot reload is enabled, changes will reflect immediately

# For database changes:
1. Edit packages/database/prisma/schema.prisma
2. Run: yarn db:migrate
3. Prisma client auto-regenerates

# For new packages:
1. Create in packages/ or apps/
2. Add to turbo.json pipeline
3. Update package.json workspaces if needed

# Before committing:
yarn lint      # Check code style
yarn test      # Run tests (when implemented)
yarn build     # Ensure everything builds
```

## Support

- **Issues**: Create a GitHub issue
- **Questions**: Ask in #vrm-support Slack channel
- **Documentation**: Check [CLAUDE.md](CLAUDE.md)

## What's Next?

The system is set up with:
- ✅ Complete monorepo structure
- ✅ All microservices scaffolded
- ✅ Database schema defined
- ✅ Event system ready
- ✅ Frontend with NextJS 14 + shadcn/ui
- ✅ Docker Compose for local dev

Ready to implement:
- 📋 Phase 1: Core CRUD operations for all entities
- 📋 GraphQL resolvers
- 📋 Frontend pages (People, Projects, Schedule)
- 📋 Authentication flow
- 📋 Time tracking UI and workflow

Happy coding! 🚀

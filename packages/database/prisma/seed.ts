import { PrismaClient, PersonType, PersonStatus, Seniority, UserRole, SkillCategory, ProjectStatus, CommercialModel, ProjectType, TeamModel, PhaseType, PhaseStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Seeding database...');

  // Create Roles
  const valuePartnerTechRole = await prisma.role.upsert({
    where: { name: 'Value Partner Technology' },
    update: {},
    create: {
      name: 'Value Partner Technology',
      description: 'Technology-focused Value Partner',
      defaultCostRateCents: 120000, // £1200/day
      isBillable: true,
    },
  });

  const seniorValuePartnerRole = await prisma.role.upsert({
    where: { name: 'Senior Value Partner' },
    update: {},
    create: {
      name: 'Senior Value Partner',
      description: 'Senior leadership Value Partner',
      defaultCostRateCents: 150000, // £1500/day
      isBillable: true,
    },
  });

  const valuePartnerRole = await prisma.role.upsert({
    where: { name: 'Value Partner' },
    update: {},
    create: {
      name: 'Value Partner',
      description: 'Value Partner - client engagement lead',
      defaultCostRateCents: 100000, // £1000/day
      isBillable: true,
    },
  });

  const valueEngineerRole = await prisma.role.upsert({
    where: { name: 'Value Engineer' },
    update: {},
    create: {
      name: 'Value Engineer',
      description: 'Technical delivery - Value Engineer',
      defaultCostRateCents: 80000, // £800/day
      isBillable: true,
    },
  });

  const valueConsultantRole = await prisma.role.upsert({
    where: { name: 'Value Consultant' },
    update: {},
    create: {
      name: 'Value Consultant',
      description: 'Client-facing consultant',
      defaultCostRateCents: 70000, // £700/day
      isBillable: true,
    },
  });

  // Also create Orchestrator for 3-in-a-box
  await prisma.role.upsert({
    where: { name: 'Orchestrator' },
    update: {},
    create: {
      name: 'Orchestrator',
      description: 'Project orchestration and delivery management',
      defaultCostRateCents: 75000, // £750/day
      isBillable: true,
    },
  });

  console.log('✓ Created roles');

  // Create Practices
  const agenticPractice = await prisma.practice.upsert({
    where: { name: 'Agentic' },
    update: {},
    create: {
      name: 'Agentic',
      description: 'Agentic AI and autonomous systems practice',
    },
  });

  const palantirPractice = await prisma.practice.upsert({
    where: { name: 'Palantir' },
    update: {},
    create: {
      name: 'Palantir',
      description: 'Palantir Foundry and AIP implementation practice',
    },
  });

  console.log('✓ Created practices');

  // Create Skills
  const skills = [
    { name: 'Python', category: SkillCategory.PROGRAMMING },
    { name: 'TypeScript', category: SkillCategory.PROGRAMMING },
    { name: 'SQL', category: SkillCategory.PROGRAMMING },
    { name: 'Palantir Foundry', category: SkillCategory.PLATFORM },
    { name: 'Palantir AIP', category: SkillCategory.PLATFORM },
    { name: 'AWS', category: SkillCategory.PLATFORM },
    { name: 'Azure', category: SkillCategory.PLATFORM },
    { name: 'LangGraph', category: SkillCategory.FRAMEWORK },
    { name: 'LangChain', category: SkillCategory.FRAMEWORK },
    { name: 'NextJS', category: SkillCategory.FRAMEWORK },
    { name: 'NestJS', category: SkillCategory.FRAMEWORK },
    { name: 'Consumer Goods', category: SkillCategory.DOMAIN },
    { name: 'Life Sciences', category: SkillCategory.DOMAIN },
    { name: 'Financial Services', category: SkillCategory.DOMAIN },
    { name: 'Agile', category: SkillCategory.METHODOLOGY },
    { name: 'Design Thinking', category: SkillCategory.METHODOLOGY },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }

  console.log('✓ Created skills');

  // Create People
  const dom = await prisma.person.upsert({
    where: { email: 'dom@valliance.ai' },
    update: {},
    create: {
      name: 'Dom Selvon',
      email: 'dom@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: valuePartnerTechRole.id,
      costRateCents: 120000,
      seniority: Seniority.PARTNER,
      utilisationTarget: 0.60,
      startDate: new Date('2025-01-01'),
      notes: 'CTO',
    },
  });

  const tarek = await prisma.person.upsert({
    where: { email: 'tarek@valliance.ai' },
    update: {},
    create: {
      name: 'Tarek Nseir',
      email: 'tarek@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: seniorValuePartnerRole.id,
      costRateCents: 150000,
      seniority: Seniority.PARTNER,
      utilisationTarget: 0.50,
      startDate: new Date('2025-01-01'),
      notes: 'CEO',
    },
  });

  const anita = await prisma.person.upsert({
    where: { email: 'anita@valliance.ai' },
    update: {},
    create: {
      name: 'Anita Rajdev',
      email: 'anita@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: seniorValuePartnerRole.id,
      costRateCents: 150000,
      seniority: Seniority.PARTNER,
      utilisationTarget: 0.50,
      startDate: new Date('2025-01-01'),
      notes: 'COO',
    },
  });

  const rad = await prisma.person.upsert({
    where: { email: 'rad@valliance.ai' },
    update: {},
    create: {
      name: 'Rad Parvin',
      email: 'rad@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: seniorValuePartnerRole.id,
      costRateCents: 140000,
      seniority: Seniority.PARTNER,
      utilisationTarget: 0.60,
      startDate: new Date('2025-01-01'),
    },
  });

  const paul = await prisma.person.upsert({
    where: { email: 'paul@valliance.ai' },
    update: {},
    create: {
      name: 'Paul Dawson',
      email: 'paul@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: valuePartnerRole.id,
      costRateCents: 100000,
      seniority: Seniority.PARTNER,
      utilisationTarget: 0.70,
      startDate: new Date('2025-03-01'),
    },
  });

  const alec = await prisma.person.upsert({
    where: { email: 'alec@valliance.ai' },
    update: {},
    create: {
      name: 'Alec Boere',
      email: 'alec@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: valuePartnerRole.id,
      costRateCents: 100000,
      seniority: Seniority.PARTNER,
      utilisationTarget: 0.70,
      startDate: new Date('2025-03-01'),
    },
  });

  const ronan = await prisma.person.upsert({
    where: { email: 'ronan@valliance.ai' },
    update: {},
    create: {
      name: 'Ronan Forker',
      email: 'ronan@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: valueEngineerRole.id,
      costRateCents: 80000,
      seniority: Seniority.PRINCIPAL,
      utilisationTarget: 0.80,
      startDate: new Date('2025-06-01'),
    },
  });

  const volha = await prisma.person.upsert({
    where: { email: 'volha@valliance.ai' },
    update: {},
    create: {
      name: 'Volha Dashkevich',
      email: 'volha@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: valuePartnerRole.id,
      costRateCents: 100000,
      seniority: Seniority.PARTNER,
      utilisationTarget: 0.70,
      startDate: new Date('2025-06-01'),
    },
  });

  const cian = await prisma.person.upsert({
    where: { email: 'cian@valliance.ai' },
    update: {},
    create: {
      name: 'Cian Clinton',
      email: 'cian@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: valueEngineerRole.id,
      costRateCents: 80000,
      seniority: Seniority.JUNIOR,
      utilisationTarget: 0.80,
      startDate: new Date('2025-09-01'),
    },
  });

  const tom = await prisma.person.upsert({
    where: { email: 'tom@valliance.ai' },
    update: {},
    create: {
      name: 'Tom Moran',
      email: 'tom@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: valueConsultantRole.id,
      costRateCents: 70000,
      seniority: Seniority.MID,
      utilisationTarget: 0.80,
      startDate: new Date('2025-09-01'),
    },
  });

  const dan = await prisma.person.upsert({
    where: { email: 'dan@valliance.ai' },
    update: {},
    create: {
      name: 'Dan Bradshaw',
      email: 'dan@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: valueConsultantRole.id,
      costRateCents: 70000,
      seniority: Seniority.MID,
      utilisationTarget: 0.80,
      startDate: new Date('2025-10-01'),
    },
  });

  const julia = await prisma.person.upsert({
    where: { email: 'julia@valliance.ai' },
    update: {},
    create: {
      name: 'Julia Sicot-Carr',
      email: 'julia@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: valueConsultantRole.id,
      costRateCents: 70000,
      seniority: Seniority.MID,
      utilisationTarget: 0.80,
      startDate: new Date('2025-11-01'),
    },
  });

  const lucie = await prisma.person.upsert({
    where: { email: 'lucie@valliance.ai' },
    update: {},
    create: {
      name: 'Lucie Nseir',
      email: 'lucie@valliance.ai',
      type: PersonType.CONTRACTOR,
      status: PersonStatus.ACTIVE,
      roleId: valueConsultantRole.id,
      costRateCents: 70000,
      seniority: Seniority.SENIOR,
      utilisationTarget: 0.80,
      startDate: new Date('2025-11-01'),
    },
  });

  console.log('✓ Created people');

  // Assign practices
  const practiceAssignments = [
    { person: dom, practice: agenticPractice, isPrimary: true },
    { person: tarek, practice: agenticPractice, isPrimary: true },
    { person: anita, practice: agenticPractice, isPrimary: true },
    { person: rad, practice: palantirPractice, isPrimary: true },
    { person: paul, practice: palantirPractice, isPrimary: true },
    { person: alec, practice: agenticPractice, isPrimary: true },
    { person: ronan, practice: agenticPractice, isPrimary: true },
    { person: volha, practice: palantirPractice, isPrimary: true },
    { person: cian, practice: agenticPractice, isPrimary: true },
    { person: tom, practice: agenticPractice, isPrimary: true },
    { person: dan, practice: agenticPractice, isPrimary: true },
    { person: julia, practice: palantirPractice, isPrimary: true },
    { person: lucie, practice: agenticPractice, isPrimary: true },
  ];

  for (const assignment of practiceAssignments) {
    await prisma.practiceMember.upsert({
      where: {
        personId_practiceId: {
          personId: assignment.person.id,
          practiceId: assignment.practice.id,
        },
      },
      update: {},
      create: {
        personId: assignment.person.id,
        practiceId: assignment.practice.id,
        isPrimary: assignment.isPrimary,
      },
    });
  }

  console.log('✓ Assigned practices');
  
  // Create Clients (Valliance only - external clients come from HubSpot)
  const valliance = await prisma.client.upsert({
    where: { name: 'Valliance Ltd' },
    update: {},
    create: {
      name: 'Valliance Ltd',
      industry: 'Technology',
      notes: 'Internal company - for internal projects and operations',
    },
  });

  console.log('✓ Created client');

  // Define color palette for internal projects
  const PROJECT_COLORS = {
    BLUE: '#3B82F6',
    PURPLE: '#8B5CF6',
    PINK: '#EC4899',
    GREEN: '#10B981',
    ORANGE: '#F59E0B',
    INDIGO: '#6366F1',
    TEAL: '#14B8A6',
    CYAN: '#06B6D4',
  };

  // Create Internal Projects (External client projects come from HubSpot)
  const compassProject = await prisma.project.upsert({
    where: { code: 'VLL-2025-001' },
    update: {
      name: 'Compass',
      commercialModel: CommercialModel.INTERNAL,
      projectType: ProjectType.INTERNAL,
      color: PROJECT_COLORS.BLUE,
    },
    create: {
      name: 'Compass',
      code: 'VLL-2025-001',
      clientId: valliance.id,
      primaryPracticeId: agenticPractice.id,
      valuePartnerId: dom.id,
      status: ProjectStatus.ACTIVE,
      commercialModel: CommercialModel.INTERNAL,
      agreedFeeCents: BigInt(0),
      contingencyPct: 0,
      projectType: ProjectType.INTERNAL,
      teamModel: TeamModel.FLEXIBLE,
      startDate: new Date('2025-01-01'),
      color: PROJECT_COLORS.BLUE,
      notes: 'Internal resource management and scheduling system',
    },
  });

  const websiteProject = await prisma.project.upsert({
    where: { code: 'VLL-2025-002' },
    update: {
      name: 'Website',
      commercialModel: CommercialModel.INTERNAL,
      projectType: ProjectType.INTERNAL,
      color: PROJECT_COLORS.PURPLE,
    },
    create: {
      name: 'Website',
      code: 'VLL-2025-002',
      clientId: valliance.id,
      primaryPracticeId: agenticPractice.id,
      valuePartnerId: tarek.id,
      status: ProjectStatus.ACTIVE,
      commercialModel: CommercialModel.INTERNAL,
      agreedFeeCents: BigInt(0),
      contingencyPct: 0,
      projectType: ProjectType.INTERNAL,
      teamModel: TeamModel.FLEXIBLE,
      startDate: new Date('2025-01-01'),
      color: PROJECT_COLORS.PURPLE,
      notes: 'Valliance website development and maintenance',
    },
  });

  const itProject = await prisma.project.upsert({
    where: { code: 'VLL-2025-003' },
    update: {
      name: 'IT',
      commercialModel: CommercialModel.INTERNAL,
      projectType: ProjectType.INTERNAL,
      color: PROJECT_COLORS.TEAL,
    },
    create: {
      name: 'IT',
      code: 'VLL-2025-003',
      clientId: valliance.id,
      primaryPracticeId: agenticPractice.id,
      valuePartnerId: dom.id,
      status: ProjectStatus.ACTIVE,
      commercialModel: CommercialModel.INTERNAL,
      agreedFeeCents: BigInt(0),
      contingencyPct: 0,
      projectType: ProjectType.INTERNAL,
      teamModel: TeamModel.FLEXIBLE,
      startDate: new Date('2025-01-01'),
      color: PROJECT_COLORS.TEAL,
      notes: 'IT infrastructure, systems, and technical operations',
    },
  });

  const hrProject = await prisma.project.upsert({
    where: { code: 'VLL-2025-004' },
    update: {
      name: 'HR',
      commercialModel: CommercialModel.INTERNAL,
      projectType: ProjectType.INTERNAL,
      color: PROJECT_COLORS.PINK,
    },
    create: {
      name: 'HR',
      code: 'VLL-2025-004',
      clientId: valliance.id,
      primaryPracticeId: agenticPractice.id,
      valuePartnerId: anita.id,
      status: ProjectStatus.ACTIVE,
      commercialModel: CommercialModel.INTERNAL,
      agreedFeeCents: BigInt(0),
      contingencyPct: 0,
      projectType: ProjectType.INTERNAL,
      teamModel: TeamModel.FLEXIBLE,
      startDate: new Date('2025-01-01'),
      color: PROJECT_COLORS.PINK,
      notes: 'Human resources, recruitment, and people operations',
    },
  });

  const vacationProject = await prisma.project.upsert({
    where: { code: 'VLL-2025-005' },
    update: {
      name: 'Vacation',
      commercialModel: CommercialModel.INTERNAL,
      projectType: ProjectType.INTERNAL,
      color: PROJECT_COLORS.GREEN,
    },
    create: {
      name: 'Vacation',
      code: 'VLL-2025-005',
      clientId: valliance.id,
      primaryPracticeId: agenticPractice.id,
      valuePartnerId: anita.id,
      status: ProjectStatus.ACTIVE,
      commercialModel: CommercialModel.INTERNAL,
      agreedFeeCents: BigInt(0),
      contingencyPct: 0,
      projectType: ProjectType.INTERNAL,
      teamModel: TeamModel.FLEXIBLE,
      startDate: new Date('2025-01-01'),
      color: PROJECT_COLORS.GREEN,
      notes: 'Annual leave and time off',
    },
  });

  console.log('✓ Created internal projects');

  // Create Phases for internal projects (simple operational phases)
  // External project phases will be managed through HubSpot sync
  await prisma.phase.upsert({
    where: { id: 'compass-ops' },
    update: {},
    create: {
      id: 'compass-ops',
      projectId: compassProject.id,
      name: 'Operations',
      phaseType: PhaseType.OPERATIONAL,
      status: PhaseStatus.IN_PROGRESS,
      startDate: new Date('2025-01-01'),
      sortOrder: 1,
    },
  });

  await prisma.phase.upsert({
    where: { id: 'website-ops' },
    update: {},
    create: {
      id: 'website-ops',
      projectId: websiteProject.id,
      name: 'Operations',
      phaseType: PhaseType.OPERATIONAL,
      status: PhaseStatus.IN_PROGRESS,
      startDate: new Date('2025-01-01'),
      sortOrder: 1,
    },
  });

  await prisma.phase.upsert({
    where: { id: 'it-ops' },
    update: {},
    create: {
      id: 'it-ops',
      projectId: itProject.id,
      name: 'Operations',
      phaseType: PhaseType.OPERATIONAL,
      status: PhaseStatus.IN_PROGRESS,
      startDate: new Date('2025-01-01'),
      sortOrder: 1,
    },
  });

  await prisma.phase.upsert({
    where: { id: 'hr-ops' },
    update: {},
    create: {
      id: 'hr-ops',
      projectId: hrProject.id,
      name: 'Operations',
      phaseType: PhaseType.OPERATIONAL,
      status: PhaseStatus.IN_PROGRESS,
      startDate: new Date('2025-01-01'),
      sortOrder: 1,
    },
  });

  await prisma.phase.upsert({
    where: { id: 'vacation-ops' },
    update: {},
    create: {
      id: 'vacation-ops',
      projectId: vacationProject.id,
      name: 'Leave',
      phaseType: PhaseType.OPERATIONAL,
      status: PhaseStatus.IN_PROGRESS,
      startDate: new Date('2025-01-01'),
      sortOrder: 1,
    },
  });

  console.log('✓ Created phases for internal projects');

  // Create Admin User for Dom
  const passwordHash = await bcrypt.hash('valliance2025', SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: 'dom@valliance.ai' },
    update: {
      passwordHash,
      role: UserRole.PARTNER,
    },
    create: {
      email: 'dom@valliance.ai',
      passwordHash,
      personId: dom.id,
      role: UserRole.PARTNER,
      isActive: true,
    },
  });

  console.log('✓ Created admin user (dom@valliance.ai / valliance2025)');

  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║           ✅ Database seeded successfully!             ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log('║  Admin Login:                                          ║');
  console.log('║    Email:    dom@valliance.ai                          ║');
  console.log('║    Password: valliance2025                             ║');
  console.log('╚════════════════════════════════════════════════════════╝');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

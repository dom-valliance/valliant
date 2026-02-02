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
  
  // Create Clients
  const valliance = await prisma.client.upsert({
    where: { name: 'Valliance Ltd' },
    update: {},
    create: {
      name: 'Valliance Ltd',
      industry: 'Technology',
      notes: 'Internal company',
    },
  });

  const heineken = await prisma.client.upsert({
    where: { name: 'Heineken' },
    update: {},
    create: {
      name: 'Heineken',
      industry: 'Consumer Goods',
      notes: 'Global brewing company',
    },
  });

  const hbs = await prisma.client.upsert({
    where: { name: 'HBS' },
    update: {},
    create: {
      name: 'HBS',
      industry: 'Medical',
      notes: 'Healthcare Business Solutions',
    },
  });

  const opella = await prisma.client.upsert({
    where: { name: 'Opella' },
    update: {},
    create: {
      name: 'Opella',
      industry: 'Life Sciences',
      notes: 'Healthcare and pharmaceuticals',
    },
  });

  console.log('✓ Created clients');

  // Define color palette for projects (visually distinct colors)
  const PROJECT_COLORS = {
    BLUE: '#3B82F6',
    PURPLE: '#8B5CF6',
    PINK: '#EC4899',
    GREEN: '#10B981',
    ORANGE: '#F59E0B',
    RED: '#EF4444',
    TEAL: '#14B8A6',
    INDIGO: '#6366F1',
    LIME: '#84CC16',
    CYAN: '#06B6D4',
  };

  // Create Projects
  const vallianceProject = await prisma.project.upsert({
    where: { code: 'VLL-2025-001' },
    update: {
      commercialModel: CommercialModel.INTERNAL,
      color: PROJECT_COLORS.INDIGO,
    },
    create: {
      name: 'Valliance Internal Project',
      code: 'VLL-2025-001',
      clientId: valliance.id,
      primaryPracticeId: agenticPractice.id,
      valuePartnerId: volha.id,
      status: ProjectStatus.ACTIVE,
      commercialModel: CommercialModel.INTERNAL,
      agreedFeeCents: BigInt(0), // £0k
      contingencyPct: 0.15,
      projectType: ProjectType.INTERNAL,
      teamModel: TeamModel.FLEXIBLE,
      startDate: new Date('2025-01-06'),
      color: PROJECT_COLORS.INDIGO,
    },
  });

  const vallianceWebsiteProject = await prisma.project.upsert({
    where: { code: 'VLL-2025-002' },
    update: {
      commercialModel: CommercialModel.INTERNAL,
      color: PROJECT_COLORS.PURPLE,
    },
    create: {
      name: 'Valliance Website Project',
      code: 'VLL-2025-002',
      clientId: valliance.id,
      primaryPracticeId: agenticPractice.id,
      valuePartnerId: volha.id,
      status: ProjectStatus.ACTIVE,
      commercialModel: CommercialModel.INTERNAL,
      agreedFeeCents: BigInt(0), // £0k
      contingencyPct: 0.15,
      projectType: ProjectType.INTERNAL,
      teamModel: TeamModel.FLEXIBLE,
      startDate: new Date('2025-01-06'),
      color: PROJECT_COLORS.PURPLE,
    },
  });

  const heinekenProject = await prisma.project.upsert({
    where: { code: 'HNK-2025-001' },
    update: {
      color: PROJECT_COLORS.GREEN,
    },
    create: {
      name: 'Heineken Idea Triage App',
      code: 'HNK-2025-001',
      clientId: heineken.id,
      primaryPracticeId: agenticPractice.id,
      valuePartnerId: alec.id,
      status: ProjectStatus.ACTIVE,
      commercialModel: CommercialModel.FIXED_PRICE,
      agreedFeeCents: BigInt(15000000), // £150k
      contingencyPct: 0.15,
      projectType: ProjectType.PILOT,
      teamModel: TeamModel.FLEXIBLE,
      startDate: new Date('2025-01-06'),
      color: PROJECT_COLORS.GREEN,
    },
  });

  const hbsProject = await prisma.project.upsert({
    where: { code: 'HBS-2025-001' },
    update: {
      color: PROJECT_COLORS.ORANGE,
    },
    create: {
      name: 'HBS Email Classification',
      code: 'HBS-2025-001',
      clientId: hbs.id,
      primaryPracticeId: agenticPractice.id,
      valuePartnerId: dom.id,
      status: ProjectStatus.ACTIVE,
      commercialModel: CommercialModel.FIXED_PRICE,
      agreedFeeCents: BigInt(8000000), // £80k
      contingencyPct: 0.10,
      projectType: ProjectType.PILOT,
      teamModel: TeamModel.FLEXIBLE,
      startDate: new Date('2025-01-13'),
      color: PROJECT_COLORS.ORANGE,
    },
  });

  const opellaProject = await prisma.project.upsert({
    where: { code: 'OPL-2025-001' },
    update: {
      color: PROJECT_COLORS.TEAL,
    },
    create: {
      name: 'Opella Palantir Bootcamp',
      code: 'OPL-2025-001',
      clientId: opella.id,
      primaryPracticeId: palantirPractice.id,
      valuePartnerId: rad.id,
      status: ProjectStatus.ACTIVE,
      commercialModel: CommercialModel.FIXED_PRICE,
      agreedFeeCents: BigInt(5000000), // £50k
      contingencyPct: 0.20,
      projectType: ProjectType.BOOTCAMP,
      teamModel: TeamModel.THREE_IN_BOX,
      startDate: new Date('2025-01-20'),
      color: PROJECT_COLORS.TEAL,
    },
  });

  console.log('✓ Created projects');

  // Create Phases for each project
  await prisma.phase.upsert({
    where: { id: 'valliance-ops' },
    update: {},
    create: {
      id: 'valliance-ops',
      projectId: vallianceProject.id,
      name: 'Operations',
      phaseType: PhaseType.OPERATIONAL,
      status: PhaseStatus.COMPLETED,
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-01-17'),
      estimatedHours: 800,
      estimatedCostCents: BigInt(4000000),
      sortOrder: 1,
    },
  });

  await prisma.phase.upsert({
    where: { id: 'valliance-website' },
    update: {},
    create: {
      id: 'valliance-website',
      projectId: vallianceWebsiteProject.id,
      name: 'Website Development',
      phaseType: PhaseType.OPERATIONAL,
      status: PhaseStatus.COMPLETED,
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-12-17'),
      estimatedHours: 800,
      estimatedCostCents: BigInt(4000000),
      sortOrder: 1,
    },
  });

  await prisma.phase.upsert({
    where: { id: 'heineken-discovery' },
    update: {},
    create: {
      id: 'heineken-discovery',
      projectId: heinekenProject.id,
      name: 'Discovery',
      phaseType: PhaseType.DISCOVERY,
      status: PhaseStatus.COMPLETED,
      startDate: new Date('2025-01-06'),
      endDate: new Date('2025-01-17'),
      estimatedHours: 80,
      estimatedCostCents: BigInt(4000000),
      sortOrder: 1,
    },
  });

  await prisma.phase.upsert({
    where: { id: 'heineken-build' },
    update: {},
    create: {
      id: 'heineken-build',
      projectId: heinekenProject.id,
      name: 'Build',
      phaseType: PhaseType.BUILD,
      status: PhaseStatus.IN_PROGRESS,
      startDate: new Date('2025-01-20'),
      estimatedHours: 200,
      estimatedCostCents: BigInt(10000000),
      sortOrder: 2,
    },
  });

  await prisma.phase.upsert({
    where: { id: 'hbs-discovery' },
    update: {},
    create: {
      id: 'hbs-discovery',
      projectId: hbsProject.id,
      name: 'Discovery & Design',
      phaseType: PhaseType.DISCOVERY,
      status: PhaseStatus.IN_PROGRESS,
      startDate: new Date('2025-01-13'),
      estimatedHours: 60,
      estimatedCostCents: BigInt(3000000),
      sortOrder: 1,
    },
  });

  await prisma.phase.upsert({
    where: { id: 'opella-bootcamp' },
    update: {},
    create: {
      id: 'opella-bootcamp',
      projectId: opellaProject.id,
      name: 'Bootcamp Workshop',
      phaseType: PhaseType.DISCOVERY,
      status: PhaseStatus.NOT_STARTED,
      startDate: new Date('2025-01-20'),
      estimatedHours: 40,
      estimatedCostCents: BigInt(4000000),
      sortOrder: 1,
    },
  });

  console.log('✓ Created phases');

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

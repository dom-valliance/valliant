import { PrismaClient, PersonType, PersonStatus, Seniority, UserRole, SkillCategory, ProjectStatus, CommercialModel, ProjectType, TeamModel, PhaseType, PhaseStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Roles
  const consultantRole = await prisma.role.upsert({
    where: { name: 'Consultant' },
    update: {},
    create: {
      name: 'Consultant',
      description: 'Client-facing consultant role',
      defaultCostRateCents: 80000, // £800/day
      isBillable: true,
    },
  });

  const engineerRole = await prisma.role.upsert({
    where: { name: 'Engineer' },
    update: {},
    create: {
      name: 'Engineer',
      description: 'Technical delivery role',
      defaultCostRateCents: 70000, // £700/day
      isBillable: true,
    },
  });

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
    { name: 'Palantir Foundry', category: SkillCategory.PLATFORM },
    { name: 'Palantir AIP', category: SkillCategory.PLATFORM },
    { name: 'LangGraph', category: SkillCategory.FRAMEWORK },
    { name: 'LangChain', category: SkillCategory.FRAMEWORK },
    { name: 'Financial Services', category: SkillCategory.DOMAIN },
    { name: 'Agile', category: SkillCategory.METHODOLOGY },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
  }

  console.log('✓ Created skills');

  // Create Sample People
  const alice = await prisma.person.upsert({
    where: { email: 'alice.partner@valliance.ai' },
    update: {},
    create: {
      name: 'Alice Partner',
      email: 'alice.partner@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: consultantRole.id,
      costRateCents: 100000, // £1000/day
      seniority: Seniority.PARTNER,
      utilisationTarget: 0.70, // Partners target 70%
      startDate: new Date('2023-01-01'),
    },
  });

  const bob = await prisma.person.upsert({
    where: { email: 'bob.engineer@valliance.ai' },
    update: {},
    create: {
      name: 'Bob Engineer',
      email: 'bob.engineer@valliance.ai',
      type: PersonType.EMPLOYEE,
      status: PersonStatus.ACTIVE,
      roleId: engineerRole.id,
      costRateCents: 70000, // £700/day
      seniority: Seniority.SENIOR,
      utilisationTarget: 0.80,
      startDate: new Date('2023-06-01'),
    },
  });

  console.log('✓ Created sample people');

  // Assign practices
  await prisma.practiceMember.upsert({
    where: {
      personId_practiceId: {
        personId: alice.id,
        practiceId: agenticPractice.id,
      },
    },
    update: {},
    create: {
      personId: alice.id,
      practiceId: agenticPractice.id,
      isPrimary: true,
    },
  });

  await prisma.practiceMember.upsert({
    where: {
      personId_practiceId: {
        personId: bob.id,
        practiceId: palantirPractice.id,
      },
    },
    update: {},
    create: {
      personId: bob.id,
      practiceId: palantirPractice.id,
      isPrimary: true,
    },
  });

  console.log('✓ Assigned practices');

  // Create Sample Client
  const client = await prisma.client.upsert({
    where: { name: 'Acme Corporation' },
    update: {},
    create: {
      name: 'Acme Corporation',
      industry: 'Financial Services',
      primaryContact: 'John Doe',
      contactEmail: 'john.doe@acme.com',
    },
  });

  console.log('✓ Created sample client');

  // Create Sample Project
  const project = await prisma.project.upsert({
    where: { code: 'ACME-2025-001' },
    update: {},
    create: {
      name: 'Acme AI Transformation Pilot',
      code: 'ACME-2025-001',
      clientId: client.id,
      primaryPracticeId: agenticPractice.id,
      valuePartnerId: alice.id,
      status: ProjectStatus.ACTIVE,
      commercialModel: CommercialModel.VALUE_SHARE,
      estimatedValueCents: BigInt(500000000), // £5M value created
      valueSharePct: 0.15, // 15% share
      contingencyPct: 0.20,
      projectType: ProjectType.PILOT,
      teamModel: TeamModel.THREE_IN_BOX,
      startDate: new Date('2025-02-01'),
    },
  });

  console.log('✓ Created sample project');

  // Create Sample Phase
  await prisma.phase.create({
    data: {
      projectId: project.id,
      name: 'Discovery',
      phaseType: PhaseType.DISCOVERY,
      status: PhaseStatus.IN_PROGRESS,
      startDate: new Date('2025-02-01'),
      estimatedHours: 160,
      estimatedCostCents: BigInt(12000000), // £120k
      sortOrder: 1,
    },
  });

  console.log('✓ Created sample phase');

  // Create Users
  await prisma.user.upsert({
    where: { email: 'alice.partner@valliance.ai' },
    update: {},
    create: {
      email: 'alice.partner@valliance.ai',
      personId: alice.id,
      role: UserRole.PARTNER,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'bob.engineer@valliance.ai' },
    update: {},
    create: {
      email: 'bob.engineer@valliance.ai',
      personId: bob.id,
      role: UserRole.TEAM_MEMBER,
      isActive: true,
    },
  });

  console.log('✓ Created users');

  console.log('✅ Database seeded successfully!');
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

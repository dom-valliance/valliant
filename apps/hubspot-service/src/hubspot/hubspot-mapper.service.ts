import { Injectable, Logger } from '@nestjs/common';
import { prisma, CommercialModel, ProjectStatus, ProjectType, TeamModel } from '@vrm/database';
import { HubSpotProject, HubSpotDeal, HubSpotCompany, HubSpotOwner } from './hubspot.types';

/**
 * HubSpot Mapper Service
 * Transforms HubSpot data to Valliant project data
 */
@Injectable()
export class HubSpotMapperService {
  private readonly logger = new Logger(HubSpotMapperService.name);

  // Commercial model threshold: £100,000 = 10,000,000 pence
  private readonly VALUE_SHARE_THRESHOLD_CENTS = 10000000;

  /**
   * Map HubSpot Project to Valliance Project
   * This is the preferred method for syncing projects
   */
  async mapProjectToProject(
    hubspotProject: HubSpotProject,
    company: HubSpotCompany,
    owner: HubSpotOwner | null,
    existingProject?: any
  ): Promise<any> {
    this.logger.log(`Mapping HubSpot project ${hubspotProject.id} (${hubspotProject.properties.hs_name})`);

    // 1. Map Project Owner email → Person (or use default if owner not available)
    let valuePartner;

    if (owner?.email) {
      valuePartner = await this.findPersonByEmail(owner.email);
      if (!valuePartner) {
        this.logger.warn(
          `No Person found with email ${owner.email}. Using default value partner.`
        );
        valuePartner = await this.getDefaultValuePartner();
      }
    } else {
      this.logger.warn(
        `No owner information available for project ${hubspotProject.id}. Using default value partner.`
      );
      valuePartner = await this.getDefaultValuePartner();
    }

    if (!valuePartner) {
      throw new Error(
        `No default value partner found. Please ensure at least one person with PARTNER seniority exists in the system.`
      );
    }

    // 2. Get Person's primary practice
    const primaryPractice = await this.getPrimaryPractice(valuePartner.id);
    if (!primaryPractice) {
      throw new Error(
        `Person ${valuePartner.name} (${valuePartner.email}) has no primary practice assigned. Please assign a primary practice before syncing their projects.`
      );
    }

    // 3. Parse budget if available
    const budgetCents = this.parseAmount(hubspotProject.properties.hs_budget || '0');
    const commercialModel =
      budgetCents >= this.VALUE_SHARE_THRESHOLD_CENTS
        ? CommercialModel.VALUE_SHARE
        : budgetCents > 0
        ? CommercialModel.FIXED_PRICE
        : CommercialModel.INTERNAL;

    this.logger.debug(
      `Project budget: £${(budgetCents / 100).toFixed(2)} → ${commercialModel}`
    );

    // 4. Find or create Client
    const client = await this.findOrCreateClient(company);

    // 5. Generate project code if new
    const code = existingProject?.code || (await this.generateProjectCode(client.name));

    // 6. Map project stage to project status
    const status = this.mapProjectStageToStatus(hubspotProject.properties.hs_pipeline_stage);

    // 7. Map project type
    const projectType = this.mapProjectType(hubspotProject.properties.hs_type);

    // 8. Parse dates
    const startDate = hubspotProject.properties.hs_createdate
      ? new Date(hubspotProject.properties.hs_createdate)
      : new Date();

    const endDate = hubspotProject.properties.hs_target_due_date
      ? new Date(hubspotProject.properties.hs_target_due_date)
      : undefined;

    // 9. Build the DTO
    const projectData = {
      name: hubspotProject.properties.hs_name,
      code,
      clientId: client.id,
      primaryPracticeId: primaryPractice.id,
      valuePartnerId: valuePartner.id,
      commercialModel,
      projectType,
      startDate,
      endDate,
      agreedFeeCents: budgetCents > 0 ? BigInt(budgetCents) : undefined,
      status,
      teamModel: TeamModel.THREE_IN_BOX, // Default
      contingencyPct: 0.2, // 20% default
      currency: 'GBP',
      notes: existingProject
        ? existingProject.notes
        : `Imported from HubSpot project ${hubspotProject.id} on ${new Date().toISOString()}\n\nDescription: ${hubspotProject.properties.hs_description || 'N/A'}`,
      // HubSpot tracking fields
      hubspotDealId: hubspotProject.id, // Store project ID in the hubspotDealId field for now
      lastSyncedAt: new Date(),
    };

    return projectData;
  }

  /**
   * Map HubSpot deal to CreateProjectDto or UpdateProjectDto
   * @deprecated Use mapProjectToProject instead for HubSpot Projects
   */
  async mapDealToProject(
    deal: HubSpotDeal,
    company: HubSpotCompany,
    owner: HubSpotOwner | null,
    existingProject?: any
  ): Promise<any> {
    this.logger.log(`Mapping deal ${deal.id} (${deal.properties.dealname})`);

    // 1. Map Deal Owner email → Person (or use default if owner not available)
    let valuePartner;

    if (owner?.email) {
      valuePartner = await this.findPersonByEmail(owner.email);
      if (!valuePartner) {
        this.logger.warn(
          `No Person found with email ${owner.email}. Using default value partner.`
        );
        valuePartner = await this.getDefaultValuePartner();
      }
    } else {
      this.logger.warn(
        `No owner information available for deal ${deal.id}. Using default value partner.`
      );
      valuePartner = await this.getDefaultValuePartner();
    }

    if (!valuePartner) {
      throw new Error(
        `No default value partner found. Please ensure at least one person with PARTNER seniority exists in the system.`
      );
    }

    // 2. Get Person's primary practice
    const primaryPractice = await this.getPrimaryPractice(valuePartner.id);
    if (!primaryPractice) {
      throw new Error(
        `Person ${valuePartner.name} (${valuePartner.email}) has no primary practice assigned. Please assign a primary practice before syncing their deals.`
      );
    }

    // 3. Determine Commercial Model from deal amount
    const amountCents = this.parseAmount(deal.properties.amount);
    const commercialModel =
      amountCents >= this.VALUE_SHARE_THRESHOLD_CENTS
        ? CommercialModel.VALUE_SHARE
        : CommercialModel.FIXED_PRICE;

    this.logger.debug(
      `Deal amount: £${(amountCents / 100).toFixed(2)} → ${commercialModel}`
    );

    // 4. Find or create Client
    const client = await this.findOrCreateClient(company);

    // 5. Generate project code if new
    const code = existingProject?.code || (await this.generateProjectCode(client.name));

    // 6. Map deal stage to project status
    const status = this.mapDealStageToProjectStatus(deal.properties.dealstage);

    // 7. Parse dates
    const startDate = deal.properties.closedate
      ? new Date(deal.properties.closedate)
      : new Date();

    // 8. Build the DTO
    const projectData = {
      name: deal.properties.dealname,
      code,
      clientId: client.id,
      primaryPracticeId: primaryPractice.id,
      valuePartnerId: valuePartner.id,
      commercialModel,
      projectType: ProjectType.PILOT, // Default to PILOT
      startDate,
      agreedFeeCents: BigInt(amountCents),
      status,
      teamModel: TeamModel.THREE_IN_BOX, // Default
      contingencyPct: 0.2, // 20% default
      currency: 'GBP',
      notes: existingProject
        ? existingProject.notes
        : `Imported from HubSpot deal ${deal.id} on ${new Date().toISOString()}`,
      // HubSpot tracking fields
      hubspotDealId: deal.id,
      lastSyncedAt: new Date(),
    };

    return projectData;
  }

  /**
   * Find person by email
   */
  private async findPersonByEmail(email: string) {
    return prisma.person.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        role: true,
      },
    });
  }

  /**
   * Get default value partner (fallback when owner info is not available)
   * Returns the first active person with PARTNER seniority
   */
  private async getDefaultValuePartner() {
    return prisma.person.findFirst({
      where: {
        status: 'ACTIVE',
        seniority: 'PARTNER',
      },
      include: {
        role: true,
      },
      orderBy: {
        createdAt: 'asc', // Use the oldest/first partner as default
      },
    });
  }

  /**
   * Get person's primary practice
   */
  private async getPrimaryPractice(personId: string) {
    const membership = await prisma.practiceMember.findFirst({
      where: {
        personId,
        isPrimary: true,
      },
      include: {
        practice: true,
      },
    });

    return membership?.practice || null;
  }

  /**
   * Find or create client from HubSpot company
   */
  private async findOrCreateClient(company: HubSpotCompany) {
    // 1. Try to find by HubSpot company ID
    let client = await prisma.client.findUnique({
      where: { hubspotCompanyId: company.id },
    });

    if (client) {
      this.logger.debug(`Found existing client by HubSpot ID: ${client.name}`);
      return client;
    }

    // 2. Try to find by name (case-insensitive)
    client = await prisma.client.findFirst({
      where: {
        name: {
          equals: company.properties.name,
          mode: 'insensitive',
        },
      },
    });

    if (client) {
      this.logger.log(
        `Found existing client by name: ${client.name}, updating with HubSpot ID`
      );

      // Update with HubSpot ID for future matching
      return prisma.client.update({
        where: { id: client.id },
        data: { hubspotCompanyId: company.id },
      });
    }

    // 3. Create new client
    this.logger.log(`Creating new client: ${company.properties.name}`);

    return prisma.client.create({
      data: {
        name: company.properties.name,
        industry: company.properties.industry || null,
        notes: `Auto-created from HubSpot company ${company.id}${
          company.properties.domain ? `\nDomain: ${company.properties.domain}` : ''
        }`,
        hubspotCompanyId: company.id,
      },
    });
  }

  /**
   * Generate unique project code
   * Format: {CLIENT_CODE}-{YEAR}-{SEQUENCE}
   * Example: "HNK-2025-001"
   */
  private async generateProjectCode(clientName: string): Promise<string> {
    // Extract 3-letter code from client name
    // Remove non-alphabetic characters and take first 3 letters
    const clientCode = clientName
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .substring(0, 3)
      .padEnd(3, 'X'); // Pad with X if less than 3 letters

    const year = new Date().getFullYear();

    // Find the last project with this client code and year
    const lastProject = await prisma.project.findFirst({
      where: {
        code: {
          startsWith: `${clientCode}-${year}-`,
        },
      },
      orderBy: {
        code: 'desc',
      },
    });

    // Extract sequence number and increment
    let nextSeq = 1;
    if (lastProject) {
      const parts = lastProject.code.split('-');
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }

    const code = `${clientCode}-${year}-${String(nextSeq).padStart(3, '0')}`;
    this.logger.debug(`Generated project code: ${code}`);

    return code;
  }

  /**
   * Map HubSpot deal stage to ProjectStatus
   */
  private mapDealStageToProjectStatus(dealStage: string): ProjectStatus {
    const stageMap: Record<string, ProjectStatus> = {
      // Custom pipeline stages (using env var values)
      [process.env.HUBSPOT_STAGE_STAFFING_PLANNING || '']: ProjectStatus.PROSPECT,
      [process.env.HUBSPOT_STAGE_DISCOVERY || '']: ProjectStatus.DISCOVERY,
      [process.env.HUBSPOT_STAGE_EXECUTION || '']: ProjectStatus.ACTIVE,
      [process.env.HUBSPOT_STAGE_ROLLOUT || '']: ProjectStatus.ACTIVE,
      [process.env.HUBSPOT_STAGE_VALUE_REALISATION || '']: ProjectStatus.ACTIVE,
      [process.env.HUBSPOT_STAGE_CLOSED || '']: ProjectStatus.COMPLETED,

      // Handle special cases
      closedlost: ProjectStatus.CANCELLED,
      closedwon: ProjectStatus.COMPLETED,
      onhold: ProjectStatus.ON_HOLD,
    };

    const mappedStatus = stageMap[dealStage] || stageMap[dealStage.toLowerCase()];

    if (!mappedStatus) {
      this.logger.warn(
        `Unknown deal stage: ${dealStage}, defaulting to PROSPECT`
      );
      return ProjectStatus.PROSPECT;
    }

    return mappedStatus;
  }

  /**
   * Parse amount from HubSpot (string) to cents (number)
   */
  private parseAmount(amount: string): number {
    if (!amount) {
      this.logger.warn('Deal amount is missing, defaulting to 0');
      return 0;
    }

    // Parse the amount (HubSpot stores it as a string)
    const amountFloat = parseFloat(amount);

    if (isNaN(amountFloat)) {
      this.logger.warn(`Invalid amount value: ${amount}, defaulting to 0`);
      return 0;
    }

    // Convert to cents/pence (multiply by 100)
    return Math.round(amountFloat * 100);
  }

  /**
   * Map HubSpot project stage to ProjectStatus
   */
  private mapProjectStageToStatus(stageId: string): ProjectStatus {
    // For now, use a simple mapping
    // You can customize this based on your actual HubSpot project stages
    const stageMap: Record<string, ProjectStatus> = {
      // Use env vars if available
      [process.env.HUBSPOT_PROJECT_STAGE_PROSPECT || '']: ProjectStatus.PROSPECT,
      [process.env.HUBSPOT_PROJECT_STAGE_DISCOVERY || '']: ProjectStatus.DISCOVERY,
      [process.env.HUBSPOT_PROJECT_STAGE_ACTIVE || '']: ProjectStatus.ACTIVE,
      [process.env.HUBSPOT_PROJECT_STAGE_COMPLETED || '']: ProjectStatus.COMPLETED,
      [process.env.HUBSPOT_PROJECT_STAGE_CANCELLED || '']: ProjectStatus.CANCELLED,
    };

    return stageMap[stageId] || ProjectStatus.PROSPECT;
  }

  /**
   * Map HubSpot project type to Valliance ProjectType
   */
  private mapProjectType(hsType?: string): ProjectType {
    if (!hsType) {
      return ProjectType.PILOT; // Default
    }

    const typeMap: Record<string, ProjectType> = {
      sales: ProjectType.PILOT,
      marketing: ProjectType.BOOTCAMP,
      service: ProjectType.USE_CASE_ROLLOUT,
      internal_ops: ProjectType.INTERNAL,
    };

    return typeMap[hsType.toLowerCase()] || ProjectType.PILOT;
  }

  /**
   * Validate that a HubSpot project has all required data for import
   */
  validateProject(project: HubSpotProject): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!project.properties.hs_name) {
      errors.push('Project name is missing');
    }

    if (!project.properties.hs_pipeline) {
      errors.push('Project pipeline is missing');
    }

    if (!project.properties.hs_pipeline_stage) {
      errors.push('Project pipeline stage is missing');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate that a deal has all required data for import
   * @deprecated Use validateProject for HubSpot Projects
   */
  validateDeal(deal: HubSpotDeal): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!deal.properties.dealname) {
      errors.push('Deal name is missing');
    }

    if (!deal.properties.amount) {
      errors.push('Deal amount is missing');
    }

    if (!deal.properties.dealstage) {
      errors.push('Deal stage is missing');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

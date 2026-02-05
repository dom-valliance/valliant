import { Injectable, Logger } from '@nestjs/common';
import { prisma, HubSpotSyncStatus, HubSpotSyncType } from '@vrm/database';
import { HubSpotApiService } from '../hubspot/hubspot-api.service';
import { HubSpotMapperService } from '../hubspot/hubspot-mapper.service';
import { SyncResult } from '../hubspot/hubspot.types';

/**
 * Sync Service
 * Orchestrates the synchronization of HubSpot deals to Valliant projects
 */
@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly hubspotApi: HubSpotApiService,
    private readonly mapper: HubSpotMapperService
  ) {}

  /**
   * Main sync method - fetches and processes all HubSpot Projects
   * This is the recommended method for syncing HubSpot Projects (not Deals)
   */
  async syncProjects(): Promise<SyncResult> {
    this.logger.log('Starting HubSpot projects sync...');

    const result: SyncResult = {
      dealsProcessed: 0, // Deprecated, kept for compatibility
      hubspotProjectsProcessed: 0,
      vallianceProjectsCreated: 0,
      vallianceProjectsUpdated: 0,
      clientsCreated: 0,
      errors: [],
    };

    try {
      // Get last sync time
      const syncState = await this.getOrCreateSyncState();
      const lastSync = syncState.lastSuccessfulSync;

      this.logger.log(`Last successful sync: ${lastSync.toISOString()}`);

      // Fetch projects from HubSpot
      const projects = await this.hubspotApi.fetchHubSpotProjects(lastSync);

      this.logger.log(`Processing ${projects.length} HubSpot projects...`);

      // Process each project
      for (const project of projects) {
        try {
          result.hubspotProjectsProcessed++;

          // Validate project has required data
          const validation = this.mapper.validateProject(project);
          if (!validation.valid) {
            throw new Error(`Invalid project data: ${validation.errors.join(', ')}`);
          }

          // Fetch company ID from project associations
          const companyId = await this.hubspotApi.getProjectCompany(project.id);
          if (!companyId) {
            throw new Error('Project has no associated company');
          }

          // Fetch owner ID from project
          const ownerId = this.hubspotApi.getProjectOwner(project);

          // Fetch related data from HubSpot
          // Note: owner may be null if the app doesn't have crm.objects.owners.read scope
          const [company, owner] = await Promise.all([
            this.hubspotApi.fetchCompany(companyId),
            ownerId ? this.hubspotApi.fetchOwner(ownerId) : Promise.resolve(null),
          ]);

          // Check if project already exists (HubSpot project ID stored in hubspotDealId field)
          const existingProject = await prisma.project.findUnique({
            where: { hubspotDealId: project.id },
          });

          // Track clients before/after for counting new clients
          const clientsBefore = await prisma.client.count();

          if (existingProject) {
            // Update existing project
            await this.updateProjectFromHubSpotProject(project, company, owner, existingProject, result);
          } else {
            // Create new project
            await this.createProjectFromHubSpotProject(project, company, owner, result);
          }

          // Check if new client was created
          const clientsAfter = await prisma.client.count();
          if (clientsAfter > clientsBefore) {
            result.clientsCreated++;
          }
        } catch (error: any) {
          // Log individual project failure but continue processing others
          this.logger.error(
            `Failed to process project ${project.id} (${project.properties.hs_name}): ${error.message}`
          );

          result.errors.push({
            hubspotProjectId: project.id,
            projectName: project.properties.hs_name,
            error: error.message,
          });

          // Log to database
          await this.logSync({
            syncType: HubSpotSyncType.DEAL_IMPORT,
            status: HubSpotSyncStatus.FAILED,
            dealId: project.id,
            dealData: project as any,
            errorMessage: error.message,
            errorCode: error.code || 'UNKNOWN',
          });
        }
      }

      // Update sync state
      await this.updateSyncState({
        lastSuccessfulSync: new Date(),
        dealsProcessed: result.hubspotProjectsProcessed,
        clientsCreated: result.clientsCreated,
        projectsCreated: result.vallianceProjectsCreated,
        projectsUpdated: result.vallianceProjectsUpdated,
        failedImports: result.errors.length,
      });

      // Log the sync completion
      await this.logSync({
        syncType: HubSpotSyncType.MANUAL_IMPORT,
        status: result.errors.length > 0 ? HubSpotSyncStatus.PARTIAL : HubSpotSyncStatus.SUCCESS,
        dealData: {
          dealsProcessed: result.dealsProcessed,
          hubspotProjectsProcessed: result.hubspotProjectsProcessed,
          vallianceProjectsCreated: result.vallianceProjectsCreated,
          vallianceProjectsUpdated: result.vallianceProjectsUpdated,
          clientsCreated: result.clientsCreated,
          errors: result.errors.length,
        } as any,
        errorMessage: result.errors.length > 0
          ? `${result.errors.length} project(s) failed to import`
          : undefined,
      });

      this.logger.log(
        `Sync completed: ${result.vallianceProjectsCreated} created, ${result.vallianceProjectsUpdated} updated, ${result.clientsCreated} clients created, ${result.errors.length} errors`
      );

      return result;
    } catch (error: any) {
      // Log complete sync failure
      this.logger.error(`Sync failed: ${error.message}`, error.stack);

      await this.logSync({
        syncType: HubSpotSyncType.DEAL_IMPORT,
        status: HubSpotSyncStatus.FAILED,
        errorMessage: error.message,
        errorCode: 'SYNC_FAILED',
      });

      throw error;
    }
  }

  /**
   * Legacy sync method - fetches and processes all deals from HubSpot
   * @deprecated Use syncProjects() for HubSpot Projects
   */
  async syncDeals(): Promise<SyncResult> {
    this.logger.log('Starting HubSpot deal sync...');

    const result: SyncResult = {
      dealsProcessed: 0,
      hubspotProjectsProcessed: 0,
      vallianceProjectsCreated: 0,
      vallianceProjectsUpdated: 0,
      clientsCreated: 0,
      errors: [],
    };

    try {
      // Get last sync time
      const syncState = await this.getOrCreateSyncState();
      const lastSync = syncState.lastSuccessfulSync;

      this.logger.log(`Last successful sync: ${lastSync.toISOString()}`);

      // Fetch deals from HubSpot
      const deals = await this.hubspotApi.fetchPipelineDeals(lastSync);

      this.logger.log(`Processing ${deals.length} deals...`);

      // Process each deal
      for (const deal of deals) {
        try {
          result.dealsProcessed++;

          // Validate deal has required data
          const validation = this.mapper.validateDeal(deal);
          if (!validation.valid) {
            throw new Error(`Invalid deal data: ${validation.errors.join(', ')}`);
          }

          // Fetch company ID from deal associations
          const companyId = await this.hubspotApi.getDealCompany(deal.id);
          if (!companyId) {
            throw new Error('Deal has no associated company');
          }

          // Fetch owner ID from deal
          const ownerId = await this.hubspotApi.getDealOwner(deal.id);

          // Fetch related data from HubSpot
          // Note: owner may be null if the app doesn't have crm.objects.owners.read scope
          const [company, owner] = await Promise.all([
            this.hubspotApi.fetchCompany(companyId),
            ownerId ? this.hubspotApi.fetchOwner(ownerId) : Promise.resolve(null),
          ]);

          // Check if project already exists
          const existingProject = await prisma.project.findUnique({
            where: { hubspotDealId: deal.id },
          });

          // Track clients before/after for counting new clients
          const clientsBefore = await prisma.client.count();

          if (existingProject) {
            // Update existing project
            await this.updateProject(deal, company, owner, existingProject, result);
          } else {
            // Create new project
            await this.createProject(deal, company, owner, result);
          }

          // Check if new client was created
          const clientsAfter = await prisma.client.count();
          if (clientsAfter > clientsBefore) {
            result.clientsCreated++;
          }
        } catch (error: any) {
          // Log individual deal failure but continue processing others
          this.logger.error(
            `Failed to process deal ${deal.id} (${deal.properties.dealname}): ${error.message}`
          );

          result.errors.push({
            hubspotProjectId: deal.id,
            projectName: deal.properties.dealname,
            error: error.message,
            // Legacy fields for backward compatibility
            dealId: deal.id,
            dealName: deal.properties.dealname,
          });

          // Log to database
          await this.logSync({
            syncType: HubSpotSyncType.DEAL_IMPORT,
            status: HubSpotSyncStatus.FAILED,
            dealId: deal.id,
            dealData: deal as any,
            errorMessage: error.message,
            errorCode: error.code || 'UNKNOWN',
          });
        }
      }

      // Update sync state
      await this.updateSyncState({
        lastSuccessfulSync: new Date(),
        dealsProcessed: result.dealsProcessed,
        clientsCreated: result.clientsCreated,
        projectsCreated: result.vallianceProjectsCreated,
        projectsUpdated: result.vallianceProjectsUpdated,
        failedImports: result.errors.length,
      });

      // Log the sync completion (even if 0 deals processed)
      await this.logSync({
        syncType: HubSpotSyncType.MANUAL_IMPORT,
        status: result.errors.length > 0 ? HubSpotSyncStatus.PARTIAL : HubSpotSyncStatus.SUCCESS,
        dealData: {
          dealsProcessed: result.dealsProcessed,
          hubspotProjectsProcessed: result.hubspotProjectsProcessed,
          vallianceProjectsCreated: result.vallianceProjectsCreated,
          vallianceProjectsUpdated: result.vallianceProjectsUpdated,
          clientsCreated: result.clientsCreated,
          errors: result.errors.length,
        } as any,
        errorMessage: result.errors.length > 0
          ? `${result.errors.length} deal(s) failed to import`
          : undefined,
      });

      this.logger.log(
        `Sync completed: ${result.vallianceProjectsCreated} created, ${result.vallianceProjectsUpdated} updated, ${result.clientsCreated} clients created, ${result.errors.length} errors`
      );

      return result;
    } catch (error: any) {
      // Log complete sync failure
      this.logger.error(`Sync failed: ${error.message}`, error.stack);

      await this.logSync({
        syncType: HubSpotSyncType.DEAL_IMPORT,
        status: HubSpotSyncStatus.FAILED,
        errorMessage: error.message,
        errorCode: 'SYNC_FAILED',
      });

      throw error;
    }
  }

  /**
   * Create new project from HubSpot Project
   */
  private async createProjectFromHubSpotProject(
    project: any,
    company: any,
    owner: any,
    result: SyncResult
  ) {
    this.logger.log(`Creating project for HubSpot project ${project.id} (${project.properties.hs_name})`);

    // Map HubSpot project to Valliance project data
    const projectData = await this.mapper.mapProjectToProject(project, company, owner);

    // Create project
    const newProject = await prisma.project.create({
      data: projectData,
      include: {
        client: true,
        primaryPractice: true,
        valuePartner: true,
      },
    });

    result.vallianceProjectsCreated++;

    // Log success
    await this.logSync({
      syncType: HubSpotSyncType.DEAL_IMPORT,
      status: HubSpotSyncStatus.SUCCESS,
      dealId: project.id,
      companyId: company.id,
      projectId: newProject.id,
      clientId: newProject.clientId,
      dealData: project as any,
    });

    this.logger.log(`Created project ${newProject.code} for HubSpot project ${project.id}`);
  }

  /**
   * Create new project from HubSpot deal
   * @deprecated Use createProjectFromHubSpotProject for HubSpot Projects
   */
  private async createProject(
    deal: any,
    company: any,
    owner: any,
    result: SyncResult
  ) {
    this.logger.log(`Creating project for deal ${deal.id} (${deal.properties.dealname})`);

    // Map deal to project data
    const projectData = await this.mapper.mapDealToProject(deal, company, owner);

    // Create project
    const project = await prisma.project.create({
      data: projectData,
      include: {
        client: true,
        primaryPractice: true,
        valuePartner: true,
      },
    });

    result.vallianceProjectsCreated++;

    // Log success
    await this.logSync({
      syncType: HubSpotSyncType.DEAL_IMPORT,
      status: HubSpotSyncStatus.SUCCESS,
      dealId: deal.id,
      companyId: company.id,
      projectId: project.id,
      clientId: project.clientId,
      dealData: deal as any,
    });

    this.logger.log(`Created project ${project.code} for deal ${deal.id}`);
  }

  /**
   * Update existing project from HubSpot Project
   */
  private async updateProjectFromHubSpotProject(
    project: any,
    company: any,
    owner: any,
    existingProject: any,
    result: SyncResult
  ) {
    this.logger.log(
      `Updating project ${existingProject.code} for HubSpot project ${project.id} (${project.properties.hs_name})`
    );

    // Map HubSpot project to project data (with existing project context)
    const projectData = await this.mapper.mapProjectToProject(
      project,
      company,
      owner,
      existingProject
    );

    // Update project (excluding fields that shouldn't change)
    const { code, clientId, primaryPracticeId, valuePartnerId, ...updateData } =
      projectData;

    const updatedProject = await prisma.project.update({
      where: { id: existingProject.id },
      data: updateData,
    });

    result.vallianceProjectsUpdated++;

    // Log success
    await this.logSync({
      syncType: HubSpotSyncType.DEAL_UPDATE,
      status: HubSpotSyncStatus.SUCCESS,
      dealId: project.id,
      companyId: company.id,
      projectId: updatedProject.id,
      dealData: project as any,
    });

    this.logger.log(`Updated project ${updatedProject.code} for HubSpot project ${project.id}`);
  }

  /**
   * Update existing project from HubSpot deal
   * @deprecated Use updateProjectFromHubSpotProject for HubSpot Projects
   */
  private async updateProject(
    deal: any,
    company: any,
    owner: any,
    existingProject: any,
    result: SyncResult
  ) {
    this.logger.log(
      `Updating project ${existingProject.code} for deal ${deal.id} (${deal.properties.dealname})`
    );

    // Map deal to project data (with existing project context)
    const projectData = await this.mapper.mapDealToProject(
      deal,
      company,
      owner,
      existingProject
    );

    // Update project (excluding fields that shouldn't change)
    const { code, clientId, primaryPracticeId, valuePartnerId, ...updateData } =
      projectData;

    const updatedProject = await prisma.project.update({
      where: { id: existingProject.id },
      data: updateData,
    });

    result.vallianceProjectsUpdated++;

    // Log success
    await this.logSync({
      syncType: HubSpotSyncType.DEAL_UPDATE,
      status: HubSpotSyncStatus.SUCCESS,
      dealId: deal.id,
      companyId: company.id,
      projectId: updatedProject.id,
      dealData: deal as any,
    });

    this.logger.log(`Updated project ${updatedProject.code} for deal ${deal.id}`);
  }

  /**
   * Get or create sync state
   */
  private async getOrCreateSyncState() {
    let state = await prisma.hubSpotSyncState.findFirst();

    if (!state) {
      // Initialize with a start date (adjust as needed)
      state = await prisma.hubSpotSyncState.create({
        data: {
          lastSuccessfulSync: new Date('2025-01-01'),
        },
      });
    }

    return state;
  }

  /**
   * Update sync state
   */
  private async updateSyncState(data: any) {
    const state = await this.getOrCreateSyncState();

    return prisma.hubSpotSyncState.update({
      where: { id: state.id },
      data,
    });
  }

  /**
   * Log sync operation to database
   */
  private async logSync(data: any) {
    try {
      await prisma.hubSpotSyncLog.create({
        data: {
          ...data,
          executedAt: new Date(),
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to log sync operation: ${error.message}`);
    }
  }

  /**
   * Get sync status for API endpoint
   */
  async getSyncStatus() {
    const syncState = await prisma.hubSpotSyncState.findFirst();
    const recentLogs = await prisma.hubSpotSyncLog.findMany({
      take: 10,
      orderBy: { executedAt: 'desc' },
    });

    return {
      syncState,
      recentLogs,
    };
  }

  /**
   * Get sync logs with optional filtering
   */
  async getSyncLogs(limit: number = 50, status?: string) {
    return prisma.hubSpotSyncLog.findMany({
      take: limit,
      where: status ? { status: status as any } : {},
      orderBy: { executedAt: 'desc' },
    });
  }
}

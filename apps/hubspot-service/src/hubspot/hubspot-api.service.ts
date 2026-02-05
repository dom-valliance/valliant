import { Injectable, Logger } from '@nestjs/common';
import { Client as HubSpotClient } from '@hubspot/api-client';
import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/deals';
import {
  HubSpotProject,
  HubSpotDeal,
  HubSpotCompany,
  HubSpotOwner,
} from './hubspot.types';

/**
 * HubSpot API Service
 * Handles all communication with HubSpot API
 */
@Injectable()
export class HubSpotApiService {
  private readonly logger = new Logger(HubSpotApiService.name);
  private readonly hubspotClient: HubSpotClient;
  private readonly pipelineId: string;
  private readonly stageIds: {
    staffingPlanning: string;
    discovery: string;
    execution: string;
    rollout: string;
    valueRealisation: string;
    closed: string;
  };

  constructor() {
    const apiKey = process.env.HUBSPOT_API_KEY;
    if (!apiKey) {
      throw new Error('HUBSPOT_API_KEY environment variable is required');
    }

    this.hubspotClient = new HubSpotClient({ accessToken: apiKey });

    // Load pipeline and stage configuration
    this.pipelineId = process.env.HUBSPOT_PIPELINE_ID || '';
    this.stageIds = {
      staffingPlanning: process.env.HUBSPOT_STAGE_STAFFING_PLANNING || '',
      discovery: process.env.HUBSPOT_STAGE_DISCOVERY || '',
      execution: process.env.HUBSPOT_STAGE_EXECUTION || '',
      rollout: process.env.HUBSPOT_STAGE_ROLLOUT || '',
      valueRealisation: process.env.HUBSPOT_STAGE_VALUE_REALISATION || '',
      closed: process.env.HUBSPOT_STAGE_CLOSED || '',
    };

    this.logger.log('HubSpot API Service initialized');
    if (!this.pipelineId) {
      this.logger.warn('⚠️  HUBSPOT_PIPELINE_ID is not set! Use GET /sync/pipelines to discover available pipelines.');
    } else {
      this.logger.log(`Pipeline ID: ${this.pipelineId}`);
    }
  }

  /**
   * Fetch deals from custom pipeline (Staffing & Planning stage and beyond)
   * that were created or updated since lastSyncTime
   */
  async fetchPipelineDeals(lastSyncTime: Date): Promise<HubSpotDeal[]> {
    // Validate pipeline ID is configured
    if (!this.pipelineId) {
      throw new Error(
        'HUBSPOT_PIPELINE_ID is not configured. Use GET /sync/pipelines to discover available pipelines and add the ID to your .env file.'
      );
    }

    this.logger.log(
      `Fetching deals from pipeline ${this.pipelineId} since ${lastSyncTime.toISOString()}`
    );

    try {
      const allDeals: HubSpotDeal[] = [];
      let after: string | undefined;
      let hasMore = true;

      // Convert date to timestamp in milliseconds
      const lastSyncTimestamp = lastSyncTime.getTime();

      // Fetch all deals in the custom pipeline that have been modified since last sync
      while (hasMore) {
        const searchRequest: any = {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'pipeline',
                  operator: FilterOperatorEnum.Eq,
                  value: this.pipelineId,
                },
                {
                  propertyName: 'hs_lastmodifieddate',
                  operator: FilterOperatorEnum.Gte,
                  value: String(lastSyncTimestamp),
                },
              ],
            },
          ],
          properties: [
            'dealname',
            'amount',
            'closedate',
            'dealstage',
            'pipeline',
            'hs_object_id',
            'createdate',
            'hs_lastmodifieddate',
          ],
          limit: 100,
          sorts: ['hs_lastmodifieddate'],
        };

        // Only include 'after' when paginating
        if (after) {
          searchRequest.after = after;
        }

        const response = await this.hubspotClient.crm.deals.searchApi.doSearch(
          searchRequest
        );

        // Transform results to our interface
        const deals = response.results.map((result: any) => ({
          id: result.id,
          properties: result.properties,
          associations: result.associations,
        }));

        allDeals.push(...deals);

        // Check if there are more pages
        if (response.paging?.next) {
          after = response.paging.next.after;
        } else {
          hasMore = false;
        }
      }

      this.logger.log(`Fetched ${allDeals.length} deals from HubSpot`);
      return allDeals;
    } catch (error: any) {
      this.logger.error(`Error fetching deals from HubSpot: ${error.message}`, error.stack);
      throw new Error(`Failed to fetch deals from HubSpot: ${error.message}`);
    }
  }

  /**
   * Fetch projects from HubSpot Projects API
   * Projects are a better fit for Valliance than Deals
   */
  async fetchHubSpotProjects(lastSyncTime: Date): Promise<HubSpotProject[]> {
    this.logger.log(
      `Fetching HubSpot projects since ${lastSyncTime.toISOString()}`
    );

    try {
      const allProjects: HubSpotProject[] = [];
      let after: string | undefined;
      let hasMore = true;

      // Convert date to timestamp in milliseconds
      const lastSyncTimestamp = lastSyncTime.getTime();

      // Fetch all projects that have been modified since last sync
      while (hasMore) {
        const searchRequest: any = {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'hs_lastmodifieddate',
                  operator: 'GTE',
                  value: String(lastSyncTimestamp),
                },
              ],
            },
          ],
          properties: [
            'hs_name',
            'hs_pipeline',
            'hs_pipeline_stage',
            'hs_description',
            'hs_status',
            'hs_type',
            'hs_target_due_date',
            'hubspot_owner_id',
            'hs_createdate',
            'hs_lastmodifieddate',
            'hs_budget',
            'hs_client',
          ],
          limit: 100,
          sorts: ['hs_lastmodifieddate'],
        };

        // Only include 'after' when paginating
        if (after) {
          searchRequest.after = after;
        }

        // Use the generic objects API for projects
        const response = await this.hubspotClient.apiRequest({
          method: 'POST',
          path: '/crm/v3/objects/projects/search',
          body: searchRequest,
        });

        const data = await response.json();

        // Transform results to our interface
        const projects = data.results.map((result: any) => ({
          id: result.id,
          properties: result.properties,
          associations: result.associations,
        }));

        allProjects.push(...projects);

        // Check if there are more pages
        if (data.paging?.next) {
          after = data.paging.next.after;
        } else {
          hasMore = false;
        }
      }

      this.logger.log(`Fetched ${allProjects.length} projects from HubSpot`);
      return allProjects;
    } catch (error: any) {
      this.logger.error(`Error fetching projects from HubSpot: ${error.message}`, error.stack);
      throw new Error(`Failed to fetch projects from HubSpot: ${error.message}`);
    }
  }

  /**
   * Fetch company details by ID
   */
  async fetchCompany(companyId: string): Promise<HubSpotCompany> {
    this.logger.debug(`Fetching company ${companyId}`);

    try {
      const response = await this.hubspotClient.crm.companies.basicApi.getById(
        companyId,
        ['name', 'domain', 'industry', 'hs_object_id']
      );

      return {
        id: response.id,
        properties: response.properties as any,
      };
    } catch (error: any) {
      this.logger.error(`Error fetching company ${companyId}: ${error.message}`);
      throw new Error(`Failed to fetch company ${companyId}: ${error.message}`);
    }
  }

  /**
   * Fetch owner (user) details by ID
   * Returns null if the app doesn't have the required scope (crm.objects.owners.read)
   */
  async fetchOwner(ownerId: string): Promise<HubSpotOwner | null> {
    this.logger.debug(`Fetching owner ${ownerId}`);

    try {
      const response = await this.hubspotClient.crm.owners.ownersApi.getById(
        parseInt(ownerId)
      );

      if (!response.email) {
        this.logger.warn(`Owner ${ownerId} has no email address`);
        return null;
      }

      return {
        id: response.id,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
      };
    } catch (error: any) {
      // Check if it's a scope error
      if (error.message?.includes('MISSING_SCOPES') || error.body?.category === 'MISSING_SCOPES') {
        this.logger.warn(
          `⚠️  Missing HubSpot scope 'crm.objects.owners.read'. Owner information will not be synced. ` +
          `Please add this scope to your HubSpot app if you need owner information.`
        );
        return null;
      }

      this.logger.error(`Error fetching owner ${ownerId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get the company associated with a deal
   */
  async getDealCompany(dealId: string): Promise<string | null> {
    try {
      // Fetch deal with company associations
      const deal = await this.hubspotClient.crm.deals.basicApi.getById(
        dealId,
        undefined,
        undefined,
        ['companies']
      );

      const companyAssociations = deal.associations?.companies?.results;
      if (companyAssociations && companyAssociations.length > 0) {
        return companyAssociations[0].id;
      }

      this.logger.warn(`No company associated with deal ${dealId}`);
      return null;
    } catch (error: any) {
      this.logger.error(`Error fetching deal company associations: ${error.message}`);
      return null;
    }
  }

  /**
   * Get the owner associated with a deal
   */
  async getDealOwner(dealId: string): Promise<string | null> {
    try {
      // Owner is stored in the hubspot_owner_id property
      const deal = await this.hubspotClient.crm.deals.basicApi.getById(
        dealId,
        ['hubspot_owner_id']
      );

      return deal.properties.hubspot_owner_id || null;
    } catch (error: any) {
      this.logger.error(`Error fetching deal owner: ${error.message}`);
      return null;
    }
  }

  /**
   * Get the company associated with a HubSpot project
   */
  async getProjectCompany(projectId: string): Promise<string | null> {
    try {
      // Fetch project with company associations
      const response = await this.hubspotClient.apiRequest({
        method: 'GET',
        path: `/crm/v3/objects/projects/${projectId}`,
        qs: {
          associations: 'companies',
        },
      });

      const data = await response.json();
      const companyAssociations = data.associations?.companies?.results;

      if (companyAssociations && companyAssociations.length > 0) {
        return companyAssociations[0].id;
      }

      this.logger.warn(`No company associated with project ${projectId}`);
      return null;
    } catch (error: any) {
      this.logger.error(`Error fetching project company associations: ${error.message}`);
      return null;
    }
  }

  /**
   * Get the owner associated with a HubSpot project
   */
  getProjectOwner(project: HubSpotProject): string | null {
    return project.properties.hubspot_owner_id || null;
  }

  /**
   * Get all pipelines (useful for configuration discovery)
   */
  async getAllPipelines(): Promise<any[]> {
    try {
      const response = await this.hubspotClient.crm.pipelines.pipelinesApi.getAll('deals');
      return response.results;
    } catch (error: any) {
      this.logger.error(`Error fetching pipelines: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get all project pipelines
   */
  async getProjectPipelines(): Promise<any[]> {
    try {
      const response = await this.hubspotClient.apiRequest({
        method: 'GET',
        path: '/crm/v3/pipelines/projects',
      });

      const data = await response.json();
      return data.results || [];
    } catch (error: any) {
      this.logger.error(`Error fetching project pipelines: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get stage IDs for validation
   */
  getStageIds() {
    return this.stageIds;
  }

  /**
   * Get pipeline ID
   */
  getPipelineId() {
    return this.pipelineId;
  }
}

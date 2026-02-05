/**
 * HubSpot Integration Type Definitions
 */

export interface HubSpotProject {
  id: string;
  properties: {
    hs_name: string;
    hs_pipeline: string;
    hs_pipeline_stage: string;
    hs_description?: string;
    hs_status?: string;
    hs_type?: 'sales' | 'marketing' | 'service' | 'internal_ops';
    hs_target_due_date?: string;
    hubspot_owner_id?: string;
    hs_createdate?: string;
    hs_lastmodifieddate?: string;
    // Custom properties that might be mapped to Valliance fields
    hs_budget?: string;
    hs_client?: string;
  };
  associations?: {
    companies?: { results: Array<{ id: string }> };
    contacts?: { results: Array<{ id: string }> };
  };
}

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    amount: string;
    closedate: string;
    dealstage: string;
    pipeline: string;
    hs_object_id: string;
    createdate?: string;
    hs_lastmodifieddate?: string;
  };
  associations?: {
    companies?: { id: string }[];
    owners?: { id: string }[];
  };
}

export interface HubSpotCompany {
  id: string;
  properties: {
    name: string;
    domain?: string;
    industry?: string;
    hs_object_id: string;
  };
}

export interface HubSpotOwner {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface HubSpotSearchRequest {
  filterGroups: Array<{
    filters: Array<{
      propertyName: string;
      operator: 'EQ' | 'NEQ' | 'LT' | 'LTE' | 'GT' | 'GTE' | 'CONTAINS' | 'IN';
      value: string | number;
    }>;
  }>;
  properties?: string[];
  limit?: number;
  after?: string;
  sorts?: Array<{
    propertyName: string;
    direction: 'ASCENDING' | 'DESCENDING';
  }>;
}

export interface HubSpotSearchResponse<T> {
  results: T[];
  total: number;
  paging?: {
    next?: {
      after: string;
    };
  };
}

export interface SyncResult {
  dealsProcessed: number; // Deprecated - kept for backward compatibility
  hubspotProjectsProcessed: number;
  vallianceProjectsCreated: number;
  vallianceProjectsUpdated: number;
  clientsCreated: number;
  errors: SyncError[];
}

export interface SyncError {
  hubspotProjectId: string;
  projectName: string;
  error: string;
  // Legacy fields for backward compatibility
  dealId?: string;
  dealName?: string;
}

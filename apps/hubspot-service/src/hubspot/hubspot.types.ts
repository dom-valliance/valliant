/**
 * HubSpot Integration Type Definitions
 */

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
  dealsProcessed: number;
  projectsCreated: number;
  projectsUpdated: number;
  clientsCreated: number;
  errors: SyncError[];
}

export interface SyncError {
  dealId: string;
  dealName: string;
  error: string;
}

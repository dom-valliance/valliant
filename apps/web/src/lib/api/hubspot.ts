/**
 * HubSpot Integration API Client
 */

import { apiClient } from '../api-client';

const HUBSPOT_SERVICE_URL = process.env.NEXT_PUBLIC_HUBSPOT_SERVICE_URL || 'http://localhost:4005';

export interface SyncState {
  id: string;
  lastSuccessfulSync: string;
  dealsProcessed: number;
  clientsCreated: number;
  projectsCreated: number;
  projectsUpdated: number;
  failedImports: number;
  updatedAt: string;
}

export interface SyncLog {
  id: string;
  syncType: 'DEAL_IMPORT' | 'DEAL_UPDATE' | 'CLIENT_CREATE' | 'MANUAL_IMPORT';
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  dealId?: string;
  companyId?: string;
  projectId?: string;
  clientId?: string;
  dealData?: any;
  errorMessage?: string;
  errorCode?: string;
  executedAt: string;
  executedBy?: string;
}

export interface SyncStatus {
  syncState: SyncState | null;
  recentLogs: SyncLog[];
  queue: {
    active: number;
    waiting: number;
    completed: number;
    failed: number;
    activeJobs: Array<{ id: string; timestamp: number }>;
    waitingJobs: Array<{ id: string; timestamp: number }>;
  };
}

export interface TriggerSyncResponse {
  success: boolean;
  message: string;
  jobId?: string;
}

/**
 * Trigger a manual HubSpot sync
 */
export async function triggerHubSpotSync(): Promise<TriggerSyncResponse> {
  const response = await fetch(`${HUBSPOT_SERVICE_URL}/sync/trigger`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger sync: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get current sync status
 */
export async function getHubSpotSyncStatus(): Promise<SyncStatus> {
  const response = await fetch(`${HUBSPOT_SERVICE_URL}/sync/status`);

  if (!response.ok) {
    throw new Error(`Failed to fetch sync status: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get sync logs with optional filtering
 */
export async function getHubSpotSyncLogs(
  limit: number = 50,
  status?: 'SUCCESS' | 'FAILED' | 'PARTIAL'
): Promise<{ logs: SyncLog[]; count: number }> {
  const params = new URLSearchParams();
  params.set('limit', limit.toString());
  if (status) {
    params.set('status', status);
  }

  const response = await fetch(`${HUBSPOT_SERVICE_URL}/sync/logs?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch sync logs: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get health status of HubSpot service
 */
export async function getHubSpotHealth(): Promise<{
  status: 'healthy' | 'unhealthy';
  queue?: {
    active: number;
    waiting: number;
    failed: number;
  };
  error?: string;
}> {
  try {
    const response = await fetch(`${HUBSPOT_SERVICE_URL}/sync/health`);

    if (!response.ok) {
      return { status: 'unhealthy', error: response.statusText };
    }

    return response.json();
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

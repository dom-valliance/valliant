/**
 * React Hook for HubSpot Sync
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getHubSpotSyncStatus,
  getHubSpotSyncLogs,
  getHubSpotHealth,
  triggerHubSpotSync,
  type SyncStatus,
  type SyncLog,
} from '../lib/api/hubspot';

/**
 * Hook to get HubSpot sync status
 * Auto-refreshes every minute
 */
export function useHubSpotSyncStatus() {
  return useQuery<SyncStatus>({
    queryKey: ['hubspot-sync-status'],
    queryFn: getHubSpotSyncStatus,
    refetchInterval: 60000, // Refresh every minute
    retry: 3,
  });
}

/**
 * Hook to get HubSpot sync logs
 */
export function useHubSpotSyncLogs(
  limit: number = 50,
  status?: 'SUCCESS' | 'FAILED' | 'PARTIAL'
) {
  return useQuery<{ logs: SyncLog[]; count: number }>({
    queryKey: ['hubspot-sync-logs', limit, status],
    queryFn: () => getHubSpotSyncLogs(limit, status),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

/**
 * Hook to get HubSpot service health
 */
export function useHubSpotHealth() {
  return useQuery({
    queryKey: ['hubspot-health'],
    queryFn: getHubSpotHealth,
    refetchInterval: 15000, // Refresh every 15 seconds
  });
}

/**
 * Hook to trigger manual sync
 */
export function useTriggerHubSpotSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerHubSpotSync,
    onSuccess: () => {
      // Invalidate and refetch status and logs
      queryClient.invalidateQueries({ queryKey: ['hubspot-sync-status'] });
      queryClient.invalidateQueries({ queryKey: ['hubspot-sync-logs'] });
    },
  });
}

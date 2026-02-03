'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  Building2,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHubSpotSyncStatus, useTriggerHubSpotSync, useHubSpotHealth } from '@/hooks/use-hubspot-sync';
import { formatDistanceToNow } from 'date-fns';

export default function HubSpotIntegrationPage() {
  const { data: statusData, isLoading, error } = useHubSpotSyncStatus();
  const { data: health } = useHubSpotHealth();
  const triggerSync = useTriggerHubSpotSync();

  const [isSyncing, setIsSyncing] = useState(false);

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      await triggerSync.mutateAsync();
      // Success handled by the mutation's onSuccess
    } catch (error) {
      console.error('Failed to trigger sync:', error);
    } finally {
      setTimeout(() => setIsSyncing(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading HubSpot integration status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Connection Error</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              Failed to connect to HubSpot service. Make sure the service is running on port 4005.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{(error as Error).message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { syncState, recentLogs, queue } = statusData || {};
  const isHealthy = health?.status === 'healthy';
  const hasActiveJobs = (queue?.active || 0) > 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HubSpot Integration</h1>
          <p className="text-muted-foreground mt-2">
            Automatically sync deals from your HubSpot pipeline to Valliant projects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${isHealthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-600' : 'bg-red-600'}`} />
            <span className="font-medium">{isHealthy ? 'Healthy' : 'Unhealthy'}</span>
          </div>
          <Button
            onClick={handleTriggerSync}
            disabled={isSyncing || hasActiveJobs}
            size="lg"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing || hasActiveJobs ? 'animate-spin' : ''}`} />
            {isSyncing || hasActiveJobs ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncState?.lastSuccessfulSync
                ? formatDistanceToNow(new Date(syncState.lastSuccessfulSync), { addSuffix: true })
                : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {syncState?.dealsProcessed || 0} deals processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Created</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{syncState?.projectsCreated || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {syncState?.projectsUpdated || 0} updated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Created</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              +{syncState?.clientsCreated || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Auto-created from HubSpot</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Imports</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(syncState?.failedImports || 0) > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {syncState?.failedImports || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(syncState?.failedImports || 0) > 0 ? 'Needs attention' : 'All syncs successful'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Queue Status</CardTitle>
          <CardDescription>Current status of the sync job queue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-2xl font-bold">{queue?.active || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Waiting</p>
                <p className="text-2xl font-bold">{queue?.waiting || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{queue?.completed || 0}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold">{queue?.failed || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Sync Activity</CardTitle>
            <CardDescription>Last 10 sync operations</CardDescription>
          </div>
          <Link href="/integrations/hubspot/logs">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              View All Logs
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentLogs && recentLogs.length > 0 ? (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {log.status === 'SUCCESS' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{log.syncType.replace(/_/g, ' ')}</p>
                      {log.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">{log.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(log.executedAt), { addSuffix: true })}
                    </p>
                    {log.dealId && (
                      <p className="text-xs text-muted-foreground mt-1">Deal: {log.dealId.slice(0, 8)}...</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No sync activity yet</p>
              <p className="text-sm mt-1">Trigger a sync to see activity here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>HubSpot sync is configured to run every 30 minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Sync Frequency</span>
              <span className="font-medium">Every 30 minutes</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Pipeline</span>
              <span className="font-medium">Custom Staffing & Planning</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Trigger Stage</span>
              <span className="font-medium">Staffing & Planning</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Auto-create Clients</span>
              <span className="font-medium text-green-600">Enabled</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

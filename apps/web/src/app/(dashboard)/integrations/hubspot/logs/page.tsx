'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, FileText, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHubSpotSyncLogs } from '@/hooks/use-hubspot-sync';
import { formatDistanceToNow, format } from 'date-fns';

type FilterStatus = 'ALL' | 'SUCCESS' | 'FAILED' | 'PARTIAL';

export default function HubSpotLogsPage() {
  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [limit, setLimit] = useState(100);

  const { data, isLoading } = useHubSpotSyncLogs(
    limit,
    filter === 'ALL' ? undefined : filter
  );

  const logs = data?.logs || [];
  const filteredCount = data?.count || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'PARTIAL':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PARTIAL':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSyncTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/integrations/hubspot">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sync Logs</h1>
            <p className="text-muted-foreground mt-1">
              Detailed history of HubSpot sync operations
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
              <CardDescription>Filter logs by status</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {filteredCount} {filter === 'ALL' ? 'total' : filter.toLowerCase()} logs
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'SUCCESS', 'FAILED', 'PARTIAL'] as FilterStatus[]).map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(status)}
              >
                {status === 'ALL' ? 'All Logs' : status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              <p className="mt-4 text-muted-foreground">Loading logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground">No logs found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter !== 'ALL'
                  ? `No ${filter.toLowerCase()} logs to display`
                  : 'No sync operations have been performed yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`border rounded-lg p-4 ${log.status === 'FAILED' ? 'border-red-200 bg-red-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getStatusIcon(log.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">{getSyncTypeLabel(log.syncType)}</span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(log.status)}`}
                          >
                            {log.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm mt-2">
                          {log.dealId && (
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Deal ID:</span>
                              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                {log.dealId}
                              </code>
                            </div>
                          )}
                          {log.projectId && (
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Project ID:</span>
                              <Link
                                href={`/projects/${log.projectId}`}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {log.projectId.slice(0, 8)}...
                              </Link>
                            </div>
                          )}
                          {log.clientId && (
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Client ID:</span>
                              <Link
                                href={`/clients/${log.clientId}`}
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {log.clientId.slice(0, 8)}...
                              </Link>
                            </div>
                          )}
                          {log.companyId && (
                            <div className="flex items-center space-x-2">
                              <span className="text-muted-foreground">Company ID:</span>
                              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                                {log.companyId}
                              </code>
                            </div>
                          )}
                        </div>

                        {log.errorMessage && (
                          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded text-sm">
                            <p className="font-medium text-red-900 mb-1">Error:</p>
                            <p className="text-red-700">{log.errorMessage}</p>
                            {log.errorCode && (
                              <p className="text-xs text-red-600 mt-1">
                                Error Code: {log.errorCode}
                              </p>
                            )}
                          </div>
                        )}

                        {log.dealData && (
                          <details className="mt-3">
                            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-gray-900">
                              View deal data
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.dealData, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <p className="text-sm font-medium">
                        {format(new Date(log.executedAt), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(log.executedAt), 'h:mm a')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(log.executedAt), { addSuffix: true })}
                      </p>
                      {log.executedBy && (
                        <p className="text-xs text-muted-foreground mt-2">
                          By: {log.executedBy}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Load More */}
      {logs.length >= limit && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setLimit(limit + 50)}
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}

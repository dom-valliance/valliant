'use client';

import { Layers, AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usePhaseBudgets, useExportUrls } from '@/hooks/use-reports';
import type { BudgetStatus } from '@/lib/api/reports';

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function getProgressColor(status: BudgetStatus): string {
  switch (status) {
    case 'EXCEEDED':
      return 'bg-red-500';
    case 'WARNING':
      return 'bg-yellow-500';
    default:
      return 'bg-green-500';
  }
}

function getBudgetStatusBadge(status: BudgetStatus) {
  switch (status) {
    case 'EXCEEDED':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Exceeded
        </Badge>
      );
    case 'WARNING':
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
          <AlertTriangle className="h-3 w-3" />
          Warning
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-600">
          <CheckCircle2 className="h-3 w-3" />
          On Track
        </Badge>
      );
  }
}

export function PhaseBudgetTracker() {
  const { data: phases, isLoading } = usePhaseBudgets();
  const { getPhaseBudgetsCsvUrl } = useExportUrls();

  const handleExport = () => {
    window.open(getPhaseBudgetsCsvUrl(), '_blank');
  };

  // Group phases with issues at the top
  const sortedPhases = phases?.slice().sort((a, b) => {
    const statusOrder = { EXCEEDED: 0, WARNING: 1, ON_TRACK: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  const exceededCount = phases?.filter((p) => p.status === 'EXCEEDED').length || 0;
  const warningCount = phases?.filter((p) => p.status === 'WARNING').length || 0;
  const onTrackCount = phases?.filter((p) => p.status === 'ON_TRACK').length || 0;

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Phase Budget Tracker</h3>
          <p className="text-sm text-muted-foreground">Budget consumption by project phase</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              On Track
            </CardDescription>
            <CardTitle className="text-2xl text-green-600">{onTrackCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Phases within budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              Warning
            </CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{warningCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Approaching budget limit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Exceeded
            </CardDescription>
            <CardTitle className="text-2xl text-red-600">{exceededCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Over budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Phase Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            All Phases
          </CardTitle>
          <CardDescription>
            Budget status sorted by risk level (highest risk first)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPhases?.map((phase) => (
                  <TableRow key={phase.phaseId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{phase.projectName}</div>
                        <div className="text-xs text-muted-foreground">{phase.projectCode}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{phase.phaseName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{phase.phaseType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {phase.estimatedCostCents
                        ? formatCurrency(phase.estimatedCostCents)
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(phase.actualCostCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={phase.remainingCents < 0 ? 'text-red-600' : 'text-green-600'}
                      >
                        {formatCurrency(phase.remainingCents)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={Math.min(phase.consumedPct * 100, 100)}
                            className={`h-2 ${getProgressColor(phase.status)}`}
                          />
                          <span className="text-xs text-muted-foreground w-12">
                            {formatPercent(phase.consumedPct)}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getBudgetStatusBadge(phase.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

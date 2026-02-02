'use client';

import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useFinancialSummary,
  useProjectFinancials,
  useExportUrls,
} from '@/hooks/use-reports';
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

export function FinancialSummary() {
  const { data: summary, isLoading: summaryLoading } = useFinancialSummary();
  const { data: projects, isLoading: projectsLoading } = useProjectFinancials();
  const { getFinancialCsvUrl } = useExportUrls();

  const handleExport = () => {
    window.open(getFinancialCsvUrl(), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Financial Overview</h3>
          <p className="text-sm text-muted-foreground">Project margins and budget status</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">
              {summaryLoading ? '...' : formatCurrency(summary?.totalRevenueCents || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {summary?.totalProjects || 0} projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Cost</CardDescription>
            <CardTitle className="text-2xl">
              {summaryLoading ? '...' : formatCurrency(summary?.totalCostCents || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Actual delivery cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gross Margin</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {summaryLoading ? '...' : formatCurrency(summary?.totalMarginCents || 0)}
              {summary && summary.totalMarginCents > 0 && (
                <TrendingUp className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {summaryLoading ? '...' : formatPercent(summary?.averageMarginPct || 0)} avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Budget Status</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {summaryLoading ? '...' : summary?.projectsOnTrack || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              On track, {summary?.projectsAtRisk || 0} at risk, {summary?.projectsOverBudget || 0} over
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Financial Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Project Financials
          </CardTitle>
          <CardDescription>
            Margin analysis and budget consumption by project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projectsLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Value Partner</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-right">Consumed</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects?.map((project) => (
                  <TableRow key={project.projectId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.projectName}</div>
                        <div className="text-xs text-muted-foreground">{project.projectCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell>{project.valuePartnerName}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(project.impliedRevenueCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(project.actualCostCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={project.marginPct >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatPercent(project.marginPct)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPercent(project.costConsumedPct)}
                    </TableCell>
                    <TableCell>
                      {getBudgetStatusBadge(project.budgetStatus)}
                    </TableCell>
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

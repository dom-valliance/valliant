'use client';

import { useState } from 'react';
import { Users, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useUtilisationSummary,
  useUtilisationByPerson,
  useExportUrls,
} from '@/hooks/use-reports';

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'OVER':
      return 'text-red-600';
    case 'UNDER':
      return 'text-yellow-600';
    default:
      return 'text-green-600';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'OVER':
      return <TrendingUp className="h-4 w-4 text-red-600" />;
    case 'UNDER':
      return <TrendingDown className="h-4 w-4 text-yellow-600" />;
    default:
      return <Minus className="h-4 w-4 text-green-600" />;
  }
}

export function UtilisationDashboard() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  });

  const query = { startDate, endDate };
  const { data: summary, isLoading: summaryLoading } = useUtilisationSummary(query);
  const { data: byPerson, isLoading: personLoading } = useUtilisationByPerson(query);
  const { getUtilisationCsvUrl } = useExportUrls();

  const handleExport = () => {
    window.open(getUtilisationCsvUrl(startDate, endDate), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Reporting Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Capacity</CardDescription>
            <CardTitle className="text-2xl">
              {summaryLoading ? '...' : `${summary?.overall.totalCapacity.toFixed(0)}h`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {summary?.overall.peopleCount || 0} people
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Utilisation</CardDescription>
            <CardTitle className="text-2xl">
              {summaryLoading ? '...' : formatPercent(summary?.overall.averageUtilisationRate || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(summary?.overall.averageUtilisationRate || 0) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Billable Rate</CardDescription>
            <CardTitle className="text-2xl">
              {summaryLoading ? '...' : formatPercent(summary?.overall.averageBillableRate || 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {summary?.overall.totalBillableHours.toFixed(0) || 0}h billable
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>At Risk</CardDescription>
            <CardTitle className="text-2xl">
              {summaryLoading ? '...' : summary?.overall.underUtilisedCount || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Under-utilised, {summary?.overall.overUtilisedCount || 0} over-utilised
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Person Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Utilisation by Person
          </CardTitle>
          <CardDescription>
            Individual utilisation rates for {summary?.period.start} to {summary?.period.end}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Practice</TableHead>
                  <TableHead className="text-right">Capacity</TableHead>
                  <TableHead className="text-right">Billable</TableHead>
                  <TableHead className="text-right">Utilisation</TableHead>
                  <TableHead className="text-right">Target</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byPerson?.map((person) => (
                  <TableRow key={person.personId}>
                    <TableCell className="font-medium">{person.personName}</TableCell>
                    <TableCell>{person.role}</TableCell>
                    <TableCell>{person.practice || '-'}</TableCell>
                    <TableCell className="text-right">{person.capacity.toFixed(0)}h</TableCell>
                    <TableCell className="text-right">{person.billableHours.toFixed(0)}h</TableCell>
                    <TableCell className="text-right">
                      <span className={getStatusColor(person.status)}>
                        {formatPercent(person.utilisationRate)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatPercent(person.utilisationTarget)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(person.status)}
                        <Badge
                          variant={
                            person.status === 'ON_TARGET'
                              ? 'default'
                              : person.status === 'UNDER'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {person.status.replace('_', ' ')}
                        </Badge>
                      </div>
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

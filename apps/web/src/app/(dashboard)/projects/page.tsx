'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, FolderKanban, Filter, X } from 'lucide-react';
import { useProjects } from '@/hooks/use-projects';
import { useClients } from '@/hooks/use-clients';
import { usePractices } from '@/hooks/use-practices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { PROJECT_STATUS_OPTIONS, getOptionLabel, PROJECT_TYPE_OPTIONS } from '@/lib/constants';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="success">Active</Badge>;
    case 'CONFIRMED':
      return <Badge variant="success">Confirmed</Badge>;
    case 'PROSPECT':
      return <Badge variant="warning">Prospect</Badge>;
    case 'DISCOVERY':
      return <Badge variant="warning">Discovery</Badge>;
    case 'ON_HOLD':
      return <Badge variant="warning">On Hold</Badge>;
    case 'COMPLETED':
      return <Badge variant="secondary">Completed</Badge>;
    case 'CANCELLED':
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const getProjectTypeBadge = (type: string) => {
  switch (type) {
    case 'BOOTCAMP':
      return <Badge variant="outline">Bootcamp</Badge>;
    case 'PILOT':
      return <Badge variant="secondary">Pilot</Badge>;
    case 'USE_CASE_ROLLOUT':
      return <Badge variant="default">Rollout</Badge>;
    case 'INTERNAL':
      return <Badge variant="secondary">Internal</Badge>;
    default:
      return <Badge variant="outline">{getOptionLabel(PROJECT_TYPE_OPTIONS, type)}</Badge>;
  }
};

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  const { data: clients } = useClients();
  const { data: practices } = usePractices();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [practiceFilter, setPracticeFilter] = useState<string>('all');

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter(project => {
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }
      if (clientFilter !== 'all' && project.clientId !== clientFilter) {
        return false;
      }
      if (practiceFilter !== 'all' && project.primaryPracticeId !== practiceFilter) {
        return false;
      }
      return true;
    });
  }, [projects, statusFilter, clientFilter, practiceFilter]);

  const hasActiveFilters = statusFilter !== 'all' || clientFilter !== 'all' || practiceFilter !== 'all';

  const clearFilters = () => {
    setStatusFilter('all');
    setClientFilter('all');
    setPracticeFilter('all');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Projects</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Failed to load projects'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">
            Manage client engagements and track value delivery
          </p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filters:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {PROJECT_STATUS_OPTIONS.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Practice:</span>
              <Select value={practiceFilter} onValueChange={setPracticeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All practices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All practices</SelectItem>
                  {practices?.map(practice => (
                    <SelectItem key={practice.id} value={practice.id}>
                      {practice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Client:</span>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All clients</SelectItem>
                  {clients?.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-2">
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first project</p>
            <Link href="/projects/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matching projects</h3>
            <p className="text-muted-foreground mb-4">
              No projects match your current filters. Try adjusting them.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {hasActiveFilters
                ? `Filtered Projects (${filteredProjects.length} of ${projects.length})`
                : `All Projects (${projects.length})`}
            </CardTitle>
            <CardDescription>
              View and manage all client engagements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Practice</TableHead>
                  <TableHead>Value Partner</TableHead>
                  <TableHead>Start Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map(project => (
                  <TableRow key={project.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      <Link
                        href={`/projects/${project.id}`}
                        className="hover:underline"
                      >
                        {project.code}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/projects/${project.id}`}
                        className="hover:underline flex items-center gap-2"
                      >
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/clients/${project.clientId}`}
                        className="hover:underline text-muted-foreground"
                      >
                        {project.client.name}
                      </Link>
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>{getProjectTypeBadge(project.projectType)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{project.primaryPractice.name}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {project.valuePartner.name}
                    </TableCell>
                    <TableCell>{formatDate(project.startDate)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

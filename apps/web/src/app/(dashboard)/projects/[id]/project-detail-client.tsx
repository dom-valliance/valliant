'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useProject, useDeleteProject } from '@/hooks/use-projects';
import { usePhasesByProject } from '@/hooks/use-phases';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils';
import { PROJECT_COLORS } from '@/lib/constants';

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

const getPhaseStatusBadge = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="success">Completed</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="default">In Progress</Badge>;
    case 'NOT_STARTED':
      return <Badge variant="secondary">Not Started</Badge>;
    case 'BLOCKED':
      return <Badge variant="destructive">Blocked</Badge>;
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
      return <Badge variant="default">Use Case Rollout</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

const getCommercialModelLabel = (model: string) => {
  switch (model) {
    case 'VALUE_SHARE':
      return 'Value Share';
    case 'FIXED_PRICE':
      return 'Fixed Price';
    case 'HYBRID':
      return 'Hybrid';
    default:
      return model;
  }
};

interface BudgetProgressBarProps {
  estimatedCostCents: number;
  actualCostCents?: number;
  alertThreshold: number;
  currency: string;
}

function BudgetProgressBar({
  estimatedCostCents,
  actualCostCents,
  alertThreshold,
  currency,
}: BudgetProgressBarProps) {
  // If no actual cost data yet, show placeholder
  if (actualCostCents === undefined || actualCostCents === null) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Budget Consumption</span>
          <span className="text-muted-foreground italic">No actuals recorded yet</span>
        </div>
        <Progress value={0} className="h-3" indicatorClassName="bg-muted" />
      </div>
    );
  }

  const consumedPercentage = (actualCostCents / estimatedCostCents) * 100;
  const cappedPercentage = Math.min(consumedPercentage, 100);

  // Determine status and color
  const isExceeded = consumedPercentage >= 100;
  const isWarning = consumedPercentage >= alertThreshold * 100;

  let statusColor = 'bg-green-500';
  let statusText = 'On Track';
  let statusIcon = <CheckCircle2 className="h-4 w-4 text-green-500" />;

  if (isExceeded) {
    statusColor = 'bg-red-500';
    statusText = 'Exceeded';
    statusIcon = <AlertCircle className="h-4 w-4 text-red-500" />;
  } else if (isWarning) {
    statusColor = 'bg-yellow-500';
    statusText = 'Warning';
    statusIcon = <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Budget Consumption</span>
          <div className="flex items-center gap-1">
            {statusIcon}
            <span className={isExceeded ? 'text-red-600 font-medium' : isWarning ? 'text-yellow-600 font-medium' : 'text-green-600 font-medium'}>
              {statusText}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="font-medium">{formatCurrency(actualCostCents, currency)}</span>
          <span className="text-muted-foreground"> / {formatCurrency(estimatedCostCents, currency)}</span>
          <span className={`ml-2 font-semibold ${isExceeded ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'}`}>
            ({consumedPercentage.toFixed(1)}%)
          </span>
        </div>
      </div>
      <div className="relative">
        <Progress
          value={cappedPercentage}
          className="h-3"
          indicatorClassName={statusColor}
        />
        {/* Alert threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-muted-foreground/50"
          style={{ left: `${alertThreshold * 100}%` }}
          title={`Alert threshold: ${formatPercentage(alertThreshold)}`}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Alert triggers at {formatPercentage(alertThreshold)} consumption
      </p>
    </div>
  );
}

export function ProjectDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(id);
  const { data: phases } = usePhasesByProject(id);
  const deleteProject = useDeleteProject();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Project</CardTitle>
            <CardDescription>
              {error instanceof Error ? error.message : 'Project not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/projects">
              <Button variant="outline">Back to Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate value-based metrics
  const estimatedValueCents = project.estimatedValueCents ? BigInt(project.estimatedValueCents) : null;
  const agreedFeeCents = project.agreedFeeCents ? BigInt(project.agreedFeeCents) : null;
  const valueSharePct = project.valueSharePct ?? 0;
  const contingencyPct = project.contingencyPct ?? 0.2;

  // Calculate implied revenue for value share model
  const impliedRevenueCents = estimatedValueCents && valueSharePct
    ? Number(estimatedValueCents) * valueSharePct
    : null;

  // Check 3-in-the-box compliance (simplified - would need project roles data)
  const isThreeInBox = project.teamModel === 'THREE_IN_BOX';

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{project.name}</h1>
            {getStatusBadge(project.status)}
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
              {project.code}
            </span>
            <Link
              href={`/clients/${project.clientId}`}
              className="flex items-center gap-1 hover:underline"
            >
              <Building2 className="h-4 w-4" />
              {project.client.name}
            </Link>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(project.startDate)}
              {project.endDate && ` - ${formatDate(project.endDate)}`}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${project.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete project{' '}
                  <span className="font-semibold">{project.name}</span> ({project.code}) and all
                  associated phases, tasks, and allocations.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await deleteProject.mutateAsync(project.id);
                      router.push('/projects');
                    } catch (err) {
                      console.error('Failed to delete project:', err);
                    }
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteProject.isPending ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Project Type</p>
              {getProjectTypeBadge(project.projectType)}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Primary Practice</p>
              <Badge variant="outline">{project.primaryPractice.name}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Project Color</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded border-2 border-muted"
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-sm">
                  {PROJECT_COLORS.find(c => c.value === project.color)?.label || 'Custom'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Start Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(project.startDate)}</span>
              </div>
            </div>
            {project.endDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">End Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(project.endDate)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commercial Model */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Commercial Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Model Type</p>
              <Badge variant="default">{getCommercialModelLabel(project.commercialModel)}</Badge>
            </div>

            {project.commercialModel === 'VALUE_SHARE' || project.commercialModel === 'HYBRID' ? (
              <>
                {estimatedValueCents && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated Value Created</p>
                    <span className="text-xl font-bold">
                      {formatCurrency(Number(estimatedValueCents), project.currency)}
                    </span>
                  </div>
                )}
                {valueSharePct > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Value Share %</p>
                    <span className="text-lg font-semibold">{formatPercentage(valueSharePct)}</span>
                  </div>
                )}
                {impliedRevenueCents && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Implied Revenue</p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(impliedRevenueCents, project.currency)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            ) : null}

            {(project.commercialModel === 'FIXED_PRICE' || project.commercialModel === 'HYBRID') && agreedFeeCents && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Agreed Fee</p>
                <span className="text-xl font-bold">
                  {formatCurrency(Number(agreedFeeCents), project.currency)}
                </span>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">Contingency</p>
              <span>{formatPercentage(contingencyPct)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Team & Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team & Ownership
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Value Partner</p>
              <Link
                href={`/people/${project.valuePartnerId}`}
                className="font-medium hover:underline"
              >
                {project.valuePartner.name}
              </Link>
              <p className="text-xs text-muted-foreground">Owns margin attribution</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Team Model</p>
              <div className="flex items-center gap-2">
                {isThreeInBox ? (
                  <>
                    <Badge variant="default">3-in-the-Box</Badge>
                    <span className="text-xs text-muted-foreground">
                      (Consultant + Engineer + Orchestrator)
                    </span>
                  </>
                ) : (
                  <Badge variant="secondary">Flexible</Badge>
                )}
              </div>
            </div>
            {isThreeInBox && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-2">Compliance Status</p>
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Team roles not yet assigned</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Assign team members in the scheduling module
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Phases Section */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Project Phases</CardTitle>
            <CardDescription>
              SDLC phases and their budget status
            </CardDescription>
          </div>
          <Link href={`/projects/${project.id}/phases/new`}>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Phase
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {phases && phases.length > 0 ? (
            <div className="space-y-3">
              {phases
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(phase => {
                  const isExpanded = expandedPhases.has(phase.id);
                  const estimatedCostCents = phase.estimatedCostCents
                    ? BigInt(phase.estimatedCostCents)
                    : null;
                  const budgetAlertPct = phase.budgetAlertPct ?? 0.8;

                  return (
                    <div
                      key={phase.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => togglePhase(phase.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{phase.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {phase.phaseType}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span>{formatDate(phase.startDate)}</span>
                              {phase.endDate && (
                                <>
                                  <span>-</span>
                                  <span>{formatDate(phase.endDate)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {estimatedCostCents && (
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {formatCurrency(Number(estimatedCostCents), project.currency)}
                              </p>
                              <p className="text-xs text-muted-foreground">Budget</p>
                            </div>
                          )}
                          {getPhaseStatusBadge(phase.status)}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t bg-muted/30">
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Estimated Hours</p>
                              <p className="font-medium">
                                {phase.estimatedHours ?? 'Not set'}
                                {phase.estimatedHours && 'h'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Budget</p>
                              <p className="font-medium">
                                {estimatedCostCents
                                  ? formatCurrency(Number(estimatedCostCents), project.currency)
                                  : 'Not set'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Alert Threshold</p>
                              <p className="font-medium">{formatPercentage(budgetAlertPct)}</p>
                            </div>
                          </div>

                          {/* Budget Progress Bar */}
                          {estimatedCostCents && (
                            <div className="mt-4 pt-4 border-t">
                              <BudgetProgressBar
                                estimatedCostCents={Number(estimatedCostCents)}
                                actualCostCents={phase.actualCostCents ? Number(BigInt(phase.actualCostCents)) : undefined}
                                alertThreshold={budgetAlertPct}
                                currency={project.currency}
                              />
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>{phase._count?.tasks ?? 0} tasks</span>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/projects/${project.id}/phases/${phase.id}/edit`}>
                                <Button variant="outline" size="sm">
                                  Edit Phase
                                </Button>
                              </Link>
                              <Link href={`/projects/${project.id}/phases/${phase.id}/tasks/new`}>
                                <Button variant="outline" size="sm">
                                  <Plus className="mr-1 h-3 w-3" />
                                  Add Task
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground mb-3">No phases defined yet</p>
              <Link href={`/projects/${project.id}/phases/new`}>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Phase
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {project.notes && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">{project.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

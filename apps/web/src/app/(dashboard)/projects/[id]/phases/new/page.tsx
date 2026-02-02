'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useProject } from '@/hooks/use-projects';
import { useCreatePhase, usePhasesByProject } from '@/hooks/use-phases';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PhaseType,
  PhaseStatus,
  PHASE_TYPE_OPTIONS,
  PHASE_STATUS_OPTIONS,
} from '@/lib/constants';

export default function NewPhasePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: existingPhases } = usePhasesByProject(projectId);
  const createPhase = useCreatePhase();

  const [formData, setFormData] = useState({
    name: '',
    phaseType: 'BUILD' as PhaseType,
    status: 'NOT_STARTED' as PhaseStatus,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    estimatedHours: '',
    estimatedCostCents: '',
    budgetAlertPct: '0.80',
  });

  const [error, setError] = useState<string | null>(null);

  // Calculate next sort order
  const nextSortOrder = existingPhases ? Math.max(0, ...existingPhases.map(p => p.sortOrder)) + 1 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.startDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await createPhase.mutateAsync({
        projectId,
        name: formData.name,
        phaseType: formData.phaseType,
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        estimatedCostCents: formData.estimatedCostCents || undefined,
        budgetAlertPct: parseFloat(formData.budgetAlertPct) || 0.8,
        sortOrder: nextSortOrder,
      });

      router.push(`/projects/${projectId}`);
    } catch (err) {
      console.error('Failed to create phase:', err);
      setError(err instanceof Error ? err.message : 'Failed to create phase');
    }
  };

  if (projectLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Project Not Found</CardTitle>
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

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {project.name}
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Add Phase</h1>
        <p className="text-muted-foreground">
          Create a new phase for <span className="font-medium">{project.name}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Phase Details</CardTitle>
            <CardDescription>Define the phase scope and budget</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Phase Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Discovery Sprint 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phaseType">Phase Type *</Label>
                <Select
                  value={formData.phaseType}
                  onValueChange={(value: PhaseType) => setFormData({ ...formData, phaseType: value })}
                >
                  <SelectTrigger id="phaseType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PHASE_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: PhaseStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHASE_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Budget & Estimates</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={formData.estimatedHours}
                    onChange={e => setFormData({ ...formData, estimatedHours: e.target.value })}
                    placeholder="160"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedCostCents">Estimated Cost (pence)</Label>
                  <Input
                    id="estimatedCostCents"
                    type="number"
                    value={formData.estimatedCostCents}
                    onChange={e => setFormData({ ...formData, estimatedCostCents: e.target.value })}
                    placeholder="5000000"
                  />
                  {formData.estimatedCostCents && (
                    <p className="text-xs text-muted-foreground">
                      £{(parseInt(formData.estimatedCostCents) / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="budgetAlertPct">Budget Alert Threshold (decimal)</Label>
                <Input
                  id="budgetAlertPct"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.budgetAlertPct}
                  onChange={e => setFormData({ ...formData, budgetAlertPct: e.target.value })}
                  placeholder="0.80"
                />
                <p className="text-xs text-muted-foreground">
                  Alert when {formData.budgetAlertPct ? `${(parseFloat(formData.budgetAlertPct) * 100).toFixed(0)}%` : '80%'} of budget is consumed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button type="submit" disabled={createPhase.isPending}>
            {createPhase.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Phase
              </>
            )}
          </Button>
          <Link href={`/projects/${projectId}`}>
            <Button type="button" variant="outline" disabled={createPhase.isPending}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

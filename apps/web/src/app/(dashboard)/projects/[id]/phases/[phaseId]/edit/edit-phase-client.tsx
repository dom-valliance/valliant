'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { useProject } from '@/hooks/use-projects';
import { usePhase, useUpdatePhase, useDeletePhase } from '@/hooks/use-phases';
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
import {
  PhaseType,
  PhaseStatus,
  PHASE_TYPE_OPTIONS,
  PHASE_STATUS_OPTIONS,
} from '@/lib/constants';

export function EditPhaseClient({
  projectId,
  phaseId,
}: {
  projectId: string;
  phaseId: string;
}) {
  const router = useRouter();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: phase, isLoading: phaseLoading } = usePhase(phaseId);
  const updatePhase = useUpdatePhase();
  const deletePhase = useDeletePhase();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phaseType: 'BUILD' as PhaseType,
    status: 'NOT_STARTED' as PhaseStatus,
    startDate: '',
    endDate: '',
    estimatedHours: '',
    estimatedCostCents: '',
    budgetAlertPct: '0.80',
    sortOrder: 0,
  });

  const [error, setError] = useState<string | null>(null);

  // Populate form when phase data loads
  useEffect(() => {
    if (phase) {
      setFormData({
        name: phase.name,
        phaseType: phase.phaseType as PhaseType,
        status: phase.status as PhaseStatus,
        startDate: phase.startDate.split('T')[0],
        endDate: phase.endDate ? phase.endDate.split('T')[0] : '',
        estimatedHours: phase.estimatedHours?.toString() || '',
        estimatedCostCents: phase.estimatedCostCents?.toString() || '',
        budgetAlertPct: phase.budgetAlertPct?.toString() || '0.80',
        sortOrder: phase.sortOrder,
      });
    }
  }, [phase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.startDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await updatePhase.mutateAsync({
        id: phaseId,
        data: {
          name: formData.name,
          phaseType: formData.phaseType,
          status: formData.status,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
          estimatedCostCents: formData.estimatedCostCents || undefined,
          budgetAlertPct: parseFloat(formData.budgetAlertPct) || 0.8,
          sortOrder: formData.sortOrder,
        },
      });

      router.push(`/projects/${projectId}`);
    } catch (err) {
      console.error('Failed to update phase:', err);
      setError(err instanceof Error ? err.message : 'Failed to update phase');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePhase.mutateAsync(phaseId);
      router.push(`/projects/${projectId}`);
    } catch (err) {
      console.error('Failed to delete phase:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete phase');
    }
  };

  const isLoading = projectLoading || phaseLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!project || !phase) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Not Found</CardTitle>
            <CardDescription>Project or phase not found</CardDescription>
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

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Edit Phase</h1>
          <p className="text-muted-foreground">
            Update <span className="font-medium">{phase.name}</span>
          </p>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Phase
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Phase?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <span className="font-semibold">{phase.name}</span> and
                all its tasks. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deletePhase.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
            <CardDescription>Update the phase scope and budget</CardDescription>
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

              <div className="mt-4 space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button type="submit" disabled={updatePhase.isPending}>
            {updatePhase.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Phase
              </>
            )}
          </Button>
          <Link href={`/projects/${projectId}`}>
            <Button type="button" variant="outline" disabled={updatePhase.isPending}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { AllocationType, AllocationStatus } from '@vrm/shared-types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import {
  useAllocation,
  useCreateAllocation,
  useUpdateAllocation,
  useDeleteAllocation,
  useConfirmAllocation,
} from '@/hooks/use-allocations';

interface Person {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  code: string;
  phases?: { id: string; name: string }[];
}

interface AllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allocationId: string | null;
  defaultPersonId: string | null;
  people: Person[];
  projects: Project[];
}

const ALLOCATION_TYPES = [
  { value: AllocationType.BILLABLE, label: 'Billable' },
  { value: AllocationType.NON_BILLABLE, label: 'Non-Billable' },
  { value: AllocationType.INTERNAL, label: 'Internal' },
  { value: AllocationType.BENCH, label: 'Bench' },
  { value: AllocationType.LEAVE, label: 'Leave / Time Off' },
];

const ALLOCATION_STATUSES = [
  { value: AllocationStatus.TENTATIVE, label: 'Tentative' },
  { value: AllocationStatus.CONFIRMED, label: 'Confirmed' },
];

function formatDateForInput(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function AllocationDialog({
  open,
  onOpenChange,
  allocationId,
  defaultPersonId,
  people,
  projects,
}: AllocationDialogProps) {
  const isEditMode = !!allocationId;
  const { data: existingAllocation, isLoading: loadingAllocation } = useAllocation(allocationId || '');

  const [formData, setFormData] = useState({
    personId: '',
    projectId: '',
    phaseId: '',
    startDate: formatDateForInput(new Date()),
    endDate: formatDateForInput(new Date()),
    hoursPerDay: 8,
    allocationType: AllocationType.BILLABLE as AllocationType,
    status: AllocationStatus.TENTATIVE as AllocationStatus,
    notes: '',
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const createAllocation = useCreateAllocation();
  const updateAllocation = useUpdateAllocation();
  const deleteAllocation = useDeleteAllocation();
  const confirmAllocation = useConfirmAllocation();

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && existingAllocation) {
      setFormData({
        personId: existingAllocation.personId,
        projectId: existingAllocation.projectId,
        phaseId: existingAllocation.phaseId || '',
        startDate: formatDateForInput(existingAllocation.startDate),
        endDate: formatDateForInput(existingAllocation.endDate),
        hoursPerDay: Number(existingAllocation.hoursPerDay),
        allocationType: existingAllocation.allocationType as AllocationType,
        status: existingAllocation.status as AllocationStatus,
        notes: existingAllocation.notes || '',
      });
    } else if (!isEditMode) {
      // Reset form for new allocation
      setFormData({
        personId: defaultPersonId || '',
        projectId: '',
        phaseId: '',
        startDate: formatDateForInput(new Date()),
        endDate: formatDateForInput(new Date()),
        hoursPerDay: 8,
        allocationType: AllocationType.BILLABLE,
        status: AllocationStatus.TENTATIVE,
        notes: '',
      });
    }
  }, [isEditMode, existingAllocation, defaultPersonId, open]);

  const selectedProject = projects.find((p) => p.id === formData.projectId);
  const phases = selectedProject?.phases || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      personId: formData.personId,
      projectId: formData.allocationType === AllocationType.LEAVE ? undefined : formData.projectId,
      phaseId: formData.phaseId || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      hoursPerDay: formData.hoursPerDay,
      allocationType: formData.allocationType,
      status: formData.status,
      notes: formData.notes || undefined,
    };

    try {
      if (isEditMode && allocationId) {
        await updateAllocation.mutateAsync({ id: allocationId, data });
      } else {
        await createAllocation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save allocation:', error);
    }
  };

  const handleDelete = async () => {
    if (!allocationId) return;
    try {
      await deleteAllocation.mutateAsync(allocationId);
      setDeleteDialogOpen(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete allocation:', error);
    }
  };

  const handleConfirm = async () => {
    if (!allocationId) return;
    try {
      await confirmAllocation.mutateAsync(allocationId);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to confirm allocation:', error);
    }
  };

  const isPending = createAllocation.isPending || updateAllocation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit Allocation' : 'Create Allocation'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? 'Modify the allocation details below.'
                : 'Assign a person to a project for a specific time period.'}
            </DialogDescription>
          </DialogHeader>

          {isEditMode && loadingAllocation ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Person */}
                <div className="grid gap-2">
                  <Label htmlFor="person">Person *</Label>
                  <Select
                    value={formData.personId}
                    onValueChange={(v) => setFormData({ ...formData, personId: v })}
                  >
                    <SelectTrigger id="person">
                      <SelectValue placeholder="Select person" />
                    </SelectTrigger>
                    <SelectContent>
                      {people.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Project - optional for LEAVE */}
                {formData.allocationType !== 'LEAVE' && (
                  <div className="grid gap-2">
                    <Label htmlFor="project">Project *</Label>
                    <Select
                      value={formData.projectId}
                      onValueChange={(v) => setFormData({ ...formData, projectId: v, phaseId: '' })}
                    >
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name} ({project.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.allocationType === 'LEAVE' && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                    This will mark the person as on leave/time-off for the selected dates.
                    They will not be available for project allocations during this period.
                  </div>
                )}

                {/* Phase (optional) */}
                {phases.length > 0 && (
                  <div className="grid gap-2">
                    <Label htmlFor="phase">Phase (optional)</Label>
                    <Select
                      value={formData.phaseId || 'none'}
                      onValueChange={(v) => setFormData({ ...formData, phaseId: v === 'none' ? '' : v })}
                    >
                      <SelectTrigger id="phase">
                        <SelectValue placeholder="Select phase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No specific phase</SelectItem>
                        {phases.map((phase) => (
                          <SelectItem key={phase.id} value={phase.id}>
                            {phase.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Date Range */}
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Allocations only apply to weekdays (Mon-Fri). Weekends are automatically excluded.
                  </p>
                </div>

                {/* Hours per Day */}
                <div className="grid gap-2">
                  <Label htmlFor="hoursPerDay">Hours per Day *</Label>
                  <Input
                    id="hoursPerDay"
                    type="number"
                    min="0.5"
                    max="24"
                    step="0.5"
                    value={formData.hoursPerDay}
                    onChange={(e) =>
                      setFormData({ ...formData, hoursPerDay: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>

                {/* Allocation Type & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="allocationType">Type *</Label>
                    <Select
                      value={formData.allocationType}
                      onValueChange={(v) => setFormData({ ...formData, allocationType: v as AllocationType })}
                    >
                      <SelectTrigger id="allocationType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALLOCATION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as AllocationStatus })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALLOCATION_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional notes about this allocation"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                {isEditMode && (
                  <>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                    {formData.status === 'TENTATIVE' && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleConfirm}
                        disabled={confirmAllocation.isPending}
                      >
                        {confirmAllocation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Confirm
                      </Button>
                    )}
                  </>
                )}
                <Button
                  type="submit"
                  disabled={isPending || !formData.personId || (formData.allocationType !== 'LEAVE' && !formData.projectId)}
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? 'Save Changes' : formData.allocationType === 'LEAVE' ? 'Schedule Leave' : 'Create Allocation'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Allocation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this allocation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAllocation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

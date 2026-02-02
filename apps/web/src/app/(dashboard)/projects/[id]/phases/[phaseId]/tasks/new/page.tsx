'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useProject } from '@/hooks/use-projects';
import { usePhase } from '@/hooks/use-phases';
import { useCreateTask, useTasksByPhase } from '@/hooks/use-tasks';
import { useRoles } from '@/hooks/use-roles';
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
  TaskStatus,
  TaskPriority,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from '@/lib/constants';

export default function NewTaskPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const phaseId = params.phaseId as string;

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: phase, isLoading: phaseLoading } = usePhase(phaseId);
  const { data: existingTasks } = useTasksByPhase(phaseId);
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const createTask = useCreateTask();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'TODO' as TaskStatus,
    priority: 'MEDIUM' as TaskPriority,
    estimatedHours: '',
    requiredRoleId: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Calculate next sort order
  const nextSortOrder = existingTasks ? Math.max(0, ...existingTasks.map(t => t.sortOrder)) + 1 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name) {
      setError('Please enter a task name');
      return;
    }

    try {
      await createTask.mutateAsync({
        phaseId,
        name: formData.name,
        description: formData.description || undefined,
        status: formData.status,
        priority: formData.priority,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        requiredRoleId: formData.requiredRoleId || undefined,
        sortOrder: nextSortOrder,
      });

      router.push(`/projects/${projectId}`);
    } catch (err) {
      console.error('Failed to create task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const isLoading = projectLoading || phaseLoading || rolesLoading;

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

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Add Task</h1>
        <p className="text-muted-foreground">
          Create a new task in <span className="font-medium">{phase.name}</span>
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
            <CardTitle>Task Details</CardTitle>
            <CardDescription>Define the task and requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Task Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Implement user authentication"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the task..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: TaskStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITY_OPTIONS.map((option) => (
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
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={e => setFormData({ ...formData, estimatedHours: e.target.value })}
                  placeholder="8"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requiredRole">Required Role</Label>
                <Select
                  value={formData.requiredRoleId || 'none'}
                  onValueChange={value => setFormData({ ...formData, requiredRoleId: value === 'none' ? '' : value })}
                >
                  <SelectTrigger id="requiredRole">
                    <SelectValue placeholder="Select a role (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {roles?.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button type="submit" disabled={createTask.isPending}>
            {createTask.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Task
              </>
            )}
          </Button>
          <Link href={`/projects/${projectId}`}>
            <Button type="button" variant="outline" disabled={createTask.isPending}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

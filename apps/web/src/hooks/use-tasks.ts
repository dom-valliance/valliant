import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService, CreateTaskDto, UpdateTaskDto } from '@/lib/api/tasks';
import { PHASES_QUERY_KEY } from './use-phases';

export const TASKS_QUERY_KEY = ['tasks'];

export function useTasks() {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => tasksService.getAll(),
  });
}

export function useTasksByPhase(phaseId: string) {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, 'phase', phaseId],
    queryFn: () => tasksService.getByPhase(phaseId),
    enabled: !!phaseId,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [...TASKS_QUERY_KEY, id],
    queryFn: () => tasksService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskDto) => tasksService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      // Also invalidate the phase to refresh task count
      queryClient.invalidateQueries({ queryKey: [...PHASES_QUERY_KEY, variables.phaseId] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      tasksService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...TASKS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PHASES_QUERY_KEY });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { phasesService, CreatePhaseDto, UpdatePhaseDto } from '@/lib/api/phases';
import { PROJECTS_QUERY_KEY } from './use-projects';

export const PHASES_QUERY_KEY = ['phases'];

export function usePhases() {
  return useQuery({
    queryKey: PHASES_QUERY_KEY,
    queryFn: () => phasesService.getAll(),
  });
}

export function usePhasesByProject(projectId: string) {
  return useQuery({
    queryKey: [...PHASES_QUERY_KEY, 'project', projectId],
    queryFn: () => phasesService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function usePhase(id: string) {
  return useQuery({
    queryKey: [...PHASES_QUERY_KEY, id],
    queryFn: () => phasesService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePhaseDto) => phasesService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PHASES_QUERY_KEY });
      // Also invalidate the project to refresh phase count
      queryClient.invalidateQueries({ queryKey: [...PROJECTS_QUERY_KEY, variables.projectId] });
    },
  });
}

export function useUpdatePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePhaseDto }) =>
      phasesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PHASES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PHASES_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeletePhase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => phasesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PHASES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });
}

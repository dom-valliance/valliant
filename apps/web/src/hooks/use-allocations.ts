import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { allocationsService, AllocationFilters } from '@/lib/api/allocations';
import type { CreateAllocationDto } from '@vrm/shared-types';

export const ALLOCATIONS_QUERY_KEY = ['allocations'];

export function useAllocations(filters?: AllocationFilters) {
  return useQuery({
    queryKey: [...ALLOCATIONS_QUERY_KEY, filters],
    queryFn: () => allocationsService.getAll(filters),
  });
}

export function useAllocation(id: string) {
  return useQuery({
    queryKey: [...ALLOCATIONS_QUERY_KEY, id],
    queryFn: () => allocationsService.getById(id),
    enabled: !!id,
  });
}

export function usePersonAllocations(personId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...ALLOCATIONS_QUERY_KEY, 'person', personId, startDate, endDate],
    queryFn: () => allocationsService.getByPerson(personId, startDate, endDate),
    enabled: !!personId,
  });
}

export function useProjectAllocations(projectId: string) {
  return useQuery({
    queryKey: [...ALLOCATIONS_QUERY_KEY, 'project', projectId],
    queryFn: () => allocationsService.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAllocationDto) => allocationsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALLOCATIONS_QUERY_KEY });
    },
  });
}

export function useUpdateAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAllocationDto> }) =>
      allocationsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ALLOCATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ALLOCATIONS_QUERY_KEY, variables.id] });
    },
  });
}

export function useConfirmAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => allocationsService.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALLOCATIONS_QUERY_KEY });
    },
  });
}

export function useCompleteAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => allocationsService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALLOCATIONS_QUERY_KEY });
    },
  });
}

export function useDeleteAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => allocationsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALLOCATIONS_QUERY_KEY });
    },
  });
}

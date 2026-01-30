import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { peopleService } from '@/lib/api/people';
import type { CreatePersonDto } from '@vrm/shared-types';

export const PEOPLE_QUERY_KEY = ['people'];

export function usePeople() {
  return useQuery({
    queryKey: PEOPLE_QUERY_KEY,
    queryFn: () => peopleService.getAll(),
  });
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: [...PEOPLE_QUERY_KEY, id],
    queryFn: () => peopleService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePersonDto) => peopleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEY });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePersonDto> }) =>
      peopleService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...PEOPLE_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => peopleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PEOPLE_QUERY_KEY });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeLogsService, TimeLogFilters } from '@/lib/api/time-logs';
import type { CreateTimeLogDto } from '@vrm/shared-types';

export const TIME_LOGS_QUERY_KEY = ['time-logs'];

export function useTimeLogs(filters?: TimeLogFilters) {
  return useQuery({
    queryKey: [...TIME_LOGS_QUERY_KEY, filters],
    queryFn: () => timeLogsService.getAll(filters),
  });
}

export function useTimeLog(id: string) {
  return useQuery({
    queryKey: [...TIME_LOGS_QUERY_KEY, id],
    queryFn: () => timeLogsService.getById(id),
    enabled: !!id,
  });
}

export function useWeeklyTimeLogs(personId: string, weekStart: string) {
  return useQuery({
    queryKey: [...TIME_LOGS_QUERY_KEY, 'weekly', personId, weekStart],
    queryFn: () => timeLogsService.getWeeklyLogs(personId, weekStart),
    enabled: !!personId && !!weekStart,
  });
}

export function usePrefillTimeLogs(personId: string, weekStart: string) {
  return useQuery({
    queryKey: [...TIME_LOGS_QUERY_KEY, 'prefill', personId, weekStart],
    queryFn: () => timeLogsService.prefillFromAllocations(personId, weekStart),
    enabled: !!personId && !!weekStart,
  });
}

export function useTimeLogsSummary(filters?: TimeLogFilters) {
  return useQuery({
    queryKey: [...TIME_LOGS_QUERY_KEY, 'summary', filters],
    queryFn: () => timeLogsService.getSummary(filters),
  });
}

export function useCreateTimeLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimeLogDto) => timeLogsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIME_LOGS_QUERY_KEY });
    },
  });
}

export function useCreateTimeLogsBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimeLogDto[]) => timeLogsService.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIME_LOGS_QUERY_KEY });
    },
  });
}

export function useUpdateTimeLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTimeLogDto> }) =>
      timeLogsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TIME_LOGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...TIME_LOGS_QUERY_KEY, variables.id] });
    },
  });
}

export function useDeleteTimeLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => timeLogsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TIME_LOGS_QUERY_KEY });
    },
  });
}

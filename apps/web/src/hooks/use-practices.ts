import { useQuery } from '@tanstack/react-query';
import { practicesService } from '@/lib/api/practices';

export const PRACTICES_QUERY_KEY = ['practices'];

export function usePractices() {
  return useQuery({
    queryKey: PRACTICES_QUERY_KEY,
    queryFn: () => practicesService.getAll(),
  });
}

export function usePractice(id: string) {
  return useQuery({
    queryKey: [...PRACTICES_QUERY_KEY, id],
    queryFn: () => practicesService.getById(id),
    enabled: !!id,
  });
}

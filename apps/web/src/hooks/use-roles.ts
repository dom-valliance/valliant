import { useQuery } from '@tanstack/react-query';
import { rolesService } from '@/lib/api/roles';

export const ROLES_QUERY_KEY = ['roles'];

export function useRoles() {
  return useQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn: () => rolesService.getAll(),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: [...ROLES_QUERY_KEY, id],
    queryFn: () => rolesService.getById(id),
    enabled: !!id,
  });
}

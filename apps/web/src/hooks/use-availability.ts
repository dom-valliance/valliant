import { useQuery } from '@tanstack/react-query';
import { availabilityService } from '@/lib/api/availability';

export const AVAILABILITY_QUERY_KEY = ['availability'];

export function usePersonAvailability(personId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...AVAILABILITY_QUERY_KEY, 'person', personId, startDate, endDate],
    queryFn: () => availabilityService.getPersonAvailability(personId, startDate, endDate),
    enabled: !!personId && !!startDate && !!endDate,
  });
}

export function useAllPeopleAvailability(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...AVAILABILITY_QUERY_KEY, 'people', startDate, endDate],
    queryFn: () => availabilityService.getAllPeopleAvailability(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

export function usePersonUtilisation(personId: string, startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...AVAILABILITY_QUERY_KEY, 'utilisation', personId, startDate, endDate],
    queryFn: () => availabilityService.getPersonUtilisation(personId, startDate, endDate),
    enabled: !!personId && !!startDate && !!endDate,
  });
}

export function useAllUtilisation(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...AVAILABILITY_QUERY_KEY, 'utilisation', 'all', startDate, endDate],
    queryFn: () => availabilityService.getAllUtilisation(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

export function useBenchCapacity(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...AVAILABILITY_QUERY_KEY, 'bench', startDate, endDate],
    queryFn: () => availabilityService.getBenchCapacity(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

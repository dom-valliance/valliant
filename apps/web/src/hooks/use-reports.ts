import { useQuery } from '@tanstack/react-query';
import {
  reportsService,
  UtilisationQuery,
  FinancialQuery,
  AvailabilityQuery,
} from '@/lib/api/reports';

// Query keys
export const UTILISATION_QUERY_KEY = ['utilisation'];
export const FINANCIAL_QUERY_KEY = ['financial'];
export const AVAILABILITY_QUERY_KEY = ['availability'];

// ============== Utilisation Hooks ==============

export function useUtilisationSummary(query?: UtilisationQuery) {
  return useQuery({
    queryKey: [...UTILISATION_QUERY_KEY, 'summary', query],
    queryFn: () => reportsService.getUtilisationSummary(query),
  });
}

export function useUtilisationByPerson(query?: UtilisationQuery) {
  return useQuery({
    queryKey: [...UTILISATION_QUERY_KEY, 'by-person', query],
    queryFn: () => reportsService.getUtilisationByPerson(query),
  });
}

export function useUtilisationByPractice(query?: UtilisationQuery) {
  return useQuery({
    queryKey: [...UTILISATION_QUERY_KEY, 'by-practice', query],
    queryFn: () => reportsService.getUtilisationByPractice(query),
  });
}

export function useUtilisationByProject(query?: UtilisationQuery) {
  return useQuery({
    queryKey: [...UTILISATION_QUERY_KEY, 'by-project', query],
    queryFn: () => reportsService.getUtilisationByProject(query),
  });
}

export function useBench(query?: UtilisationQuery) {
  return useQuery({
    queryKey: [...UTILISATION_QUERY_KEY, 'bench', query],
    queryFn: () => reportsService.getBench(query),
  });
}

// ============== Financial Hooks ==============

export function useFinancialSummary(query?: FinancialQuery) {
  return useQuery({
    queryKey: [...FINANCIAL_QUERY_KEY, 'summary', query],
    queryFn: () => reportsService.getFinancialSummary(query),
  });
}

export function useProjectFinancials(query?: FinancialQuery) {
  return useQuery({
    queryKey: [...FINANCIAL_QUERY_KEY, 'projects', query],
    queryFn: () => reportsService.getProjectFinancials(query),
  });
}

export function useProjectFinancialsById(projectId: string) {
  return useQuery({
    queryKey: [...FINANCIAL_QUERY_KEY, 'project', projectId],
    queryFn: () => reportsService.getProjectFinancialsById(projectId),
    enabled: !!projectId,
  });
}

export function usePhaseBudgets(query?: FinancialQuery) {
  return useQuery({
    queryKey: [...FINANCIAL_QUERY_KEY, 'phase-budgets', query],
    queryFn: () => reportsService.getPhaseBudgets(query),
  });
}

export function useValuePartnerSummary(valuePartnerId: string) {
  return useQuery({
    queryKey: [...FINANCIAL_QUERY_KEY, 'value-partner', valuePartnerId],
    queryFn: () => reportsService.getValuePartnerSummary(valuePartnerId),
    enabled: !!valuePartnerId,
  });
}

// ============== Availability Hooks ==============

export function useAvailability(query?: AvailabilityQuery) {
  return useQuery({
    queryKey: [...AVAILABILITY_QUERY_KEY, query],
    queryFn: () => reportsService.getAvailability(query),
  });
}

export function useCapacityForecast(weeks?: number) {
  return useQuery({
    queryKey: [...AVAILABILITY_QUERY_KEY, 'forecast', weeks],
    queryFn: () => reportsService.getCapacityForecast(weeks),
  });
}

// ============== Export URL Helpers ==============

export function useExportUrls() {
  return {
    getUtilisationCsvUrl: reportsService.getUtilisationCsvUrl,
    getFinancialCsvUrl: reportsService.getFinancialCsvUrl,
    getPhaseBudgetsCsvUrl: reportsService.getPhaseBudgetsCsvUrl,
    getTimesheetCsvUrl: reportsService.getTimesheetCsvUrl,
  };
}

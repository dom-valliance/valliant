import { apiClient, SERVICES } from '../api-client';

// ============== Utilisation Types ==============

export interface PersonUtilisation {
  personId: string;
  personName: string;
  personType: string;
  role: string;
  practice: string | null;
  capacity: number;
  billableHours: number;
  nonBillableHours: number;
  internalHours: number;
  leaveHours: number;
  benchHours: number;
  totalWorkedHours: number;
  utilisationRate: number;
  billableRate: number;
  utilisationTarget: number;
  variance: number;
  status: 'UNDER' | 'ON_TARGET' | 'OVER';
}

export interface PracticeUtilisation {
  practiceId: string;
  practiceName: string;
  memberCount: number;
  totalCapacity: number;
  totalBillableHours: number;
  totalNonBillableHours: number;
  averageUtilisationRate: number;
  averageTarget: number;
}

export interface ProjectUtilisation {
  projectId: string;
  projectName: string;
  projectCode: string;
  clientName: string;
  status: string;
  totalAllocatedHours: number;
  totalLoggedHours: number;
  billableHours: number;
  teamSize: number;
}

export interface BenchPerson {
  personId: string;
  personName: string;
  personType: string;
  role: string;
  practice: string | null;
  availableHours: number;
  skills: string[];
  daysOnBench: number;
}

export interface UtilisationSummary {
  period: { start: string; end: string };
  overall: {
    totalCapacity: number;
    totalBillableHours: number;
    totalNonBillableHours: number;
    averageUtilisationRate: number;
    averageBillableRate: number;
    peopleCount: number;
    underUtilisedCount: number;
    overUtilisedCount: number;
  };
}

// ============== Financial Types ==============

export type BudgetStatus = 'ON_TRACK' | 'WARNING' | 'EXCEEDED';

export interface ProjectFinancials {
  projectId: string;
  projectName: string;
  projectCode: string;
  clientName: string;
  valuePartnerName: string;
  commercialModel: string;
  status: string;
  estimatedValueCents: number | null;
  valueSharePct: number | null;
  agreedFeeCents: number | null;
  impliedRevenueCents: number;
  estimatedCostCents: number;
  actualCostCents: number;
  contingencyPct: number;
  totalBudgetCents: number;
  grossMarginCents: number;
  marginPct: number;
  costConsumedPct: number;
  budgetStatus: BudgetStatus;
  phasesCount: number;
  phasesWithWarning: number;
  phasesExceeded: number;
}

export interface PhaseBudget {
  phaseId: string;
  phaseName: string;
  phaseType: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  estimatedHours: number | null;
  estimatedCostCents: number | null;
  actualCostCents: number;
  budgetAlertPct: number;
  consumedPct: number;
  status: BudgetStatus;
  remainingCents: number;
}

export interface ValuePartnerSummary {
  valuePartnerId: string;
  valuePartnerName: string;
  projectCount: number;
  totalRevenueCents: number;
  totalCostCents: number;
  totalMarginCents: number;
  averageMarginPct: number;
  projects: ProjectFinancials[];
}

export interface FinancialSummary {
  totalProjects: number;
  activeProjects: number;
  totalRevenueCents: number;
  totalCostCents: number;
  totalMarginCents: number;
  averageMarginPct: number;
  projectsOnTrack: number;
  projectsAtRisk: number;
  projectsOverBudget: number;
}

// ============== Availability Types ==============

export interface PersonAvailability {
  personId: string;
  personName: string;
  personType: string;
  role: string;
  practice: string | null;
  skills: string[];
  totalCapacity: number;
  allocatedHours: number;
  availableHours: number;
  availabilityPct: number;
  costRateCents: number;
  allocations: Array<{
    projectName: string;
    hoursPerDay: number;
    startDate: string;
    endDate: string;
  }>;
}

export interface CapacityForecast {
  weekStart: string;
  totalCapacity: number;
  allocatedHours: number;
  availableHours: number;
  utilizationPct: number;
  byPractice: Record<string, { capacity: number; allocated: number; available: number }>;
}

// ============== Query Params ==============

export interface UtilisationQuery {
  startDate?: string;
  endDate?: string;
  personId?: string;
  practiceId?: string;
  projectId?: string;
}

export interface FinancialQuery {
  projectId?: string;
  clientId?: string;
  practiceId?: string;
  valuePartnerId?: string;
  budgetStatus?: BudgetStatus;
}

export interface AvailabilityQuery {
  startDate?: string;
  endDate?: string;
  skillIds?: string[];
  roleId?: string;
  practiceId?: string;
  minHours?: number;
}

// ============== API Service ==============

export const reportsService = {
  // Utilisation
  async getUtilisationSummary(query?: UtilisationQuery): Promise<UtilisationSummary> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.personId) params.append('personId', query.personId);
    if (query?.practiceId) params.append('practiceId', query.practiceId);

    const response = await apiClient.get(`${SERVICES.REPORTING}/utilisation?${params}`);
    return response.data;
  },

  async getUtilisationByPerson(query?: UtilisationQuery): Promise<PersonUtilisation[]> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.personId) params.append('personId', query.personId);
    if (query?.practiceId) params.append('practiceId', query.practiceId);

    const response = await apiClient.get(`${SERVICES.REPORTING}/utilisation/by-person?${params}`);
    return response.data;
  },

  async getUtilisationByPractice(query?: UtilisationQuery): Promise<PracticeUtilisation[]> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);

    const response = await apiClient.get(`${SERVICES.REPORTING}/utilisation/by-practice?${params}`);
    return response.data;
  },

  async getUtilisationByProject(query?: UtilisationQuery): Promise<ProjectUtilisation[]> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.projectId) params.append('projectId', query.projectId);

    const response = await apiClient.get(`${SERVICES.REPORTING}/utilisation/by-project?${params}`);
    return response.data;
  },

  async getBench(query?: UtilisationQuery): Promise<BenchPerson[]> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);

    const response = await apiClient.get(`${SERVICES.REPORTING}/utilisation/bench?${params}`);
    return response.data;
  },

  // Financial
  async getFinancialSummary(query?: FinancialQuery): Promise<FinancialSummary> {
    const params = new URLSearchParams();
    if (query?.projectId) params.append('projectId', query.projectId);
    if (query?.clientId) params.append('clientId', query.clientId);
    if (query?.practiceId) params.append('practiceId', query.practiceId);
    if (query?.valuePartnerId) params.append('valuePartnerId', query.valuePartnerId);

    const response = await apiClient.get(`${SERVICES.REPORTING}/financial?${params}`);
    return response.data;
  },

  async getProjectFinancials(query?: FinancialQuery): Promise<ProjectFinancials[]> {
    const params = new URLSearchParams();
    if (query?.projectId) params.append('projectId', query.projectId);
    if (query?.clientId) params.append('clientId', query.clientId);
    if (query?.practiceId) params.append('practiceId', query.practiceId);
    if (query?.budgetStatus) params.append('budgetStatus', query.budgetStatus);

    const response = await apiClient.get(`${SERVICES.REPORTING}/financial/projects?${params}`);
    return response.data;
  },

  async getProjectFinancialsById(id: string): Promise<ProjectFinancials> {
    const response = await apiClient.get(`${SERVICES.REPORTING}/financial/project/${id}`);
    return response.data;
  },

  async getPhaseBudgets(query?: FinancialQuery): Promise<PhaseBudget[]> {
    const params = new URLSearchParams();
    if (query?.projectId) params.append('projectId', query.projectId);
    if (query?.budgetStatus) params.append('budgetStatus', query.budgetStatus);

    const response = await apiClient.get(`${SERVICES.REPORTING}/financial/phase-budgets?${params}`);
    return response.data;
  },

  async getValuePartnerSummary(valuePartnerId: string): Promise<ValuePartnerSummary> {
    const response = await apiClient.get(`${SERVICES.REPORTING}/financial/value-partner/${valuePartnerId}`);
    return response.data;
  },

  // Availability
  async getAvailability(query?: AvailabilityQuery): Promise<PersonAvailability[]> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);
    if (query?.skillIds) params.append('skillIds', query.skillIds.join(','));
    if (query?.roleId) params.append('roleId', query.roleId);
    if (query?.practiceId) params.append('practiceId', query.practiceId);
    if (query?.minHours) params.append('minHours', query.minHours.toString());

    const response = await apiClient.get(`${SERVICES.REPORTING}/availability?${params}`);
    return response.data;
  },

  async getCapacityForecast(weeks?: number): Promise<CapacityForecast[]> {
    const params = weeks ? `?weeks=${weeks}` : '';
    const response = await apiClient.get(`${SERVICES.REPORTING}/availability/capacity-forecast${params}`);
    return response.data;
  },

  // Exports
  getUtilisationCsvUrl(startDate?: string, endDate?: string): string {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return `${SERVICES.REPORTING}/exports/utilisation/csv?${params}`;
  },

  getFinancialCsvUrl(): string {
    return `${SERVICES.REPORTING}/exports/financial/csv`;
  },

  getPhaseBudgetsCsvUrl(projectId?: string): string {
    const params = projectId ? `?projectId=${projectId}` : '';
    return `${SERVICES.REPORTING}/exports/phase-budgets/csv${params}`;
  },

  getTimesheetCsvUrl(startDate?: string, endDate?: string): string {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return `${SERVICES.REPORTING}/exports/timesheet/csv?${params}`;
  },
};

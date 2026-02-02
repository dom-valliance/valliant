import { apiClient, SERVICES } from '../api-client';

export interface Phase {
  id: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
    code: string;
  };
  name: string;
  phaseType: 'DISCOVERY' | 'DESIGN' | 'BUILD' | 'TEST' | 'DEPLOY' | 'HYPERCARE' | 'CUSTOM' | 'OPERATIONAL';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  startDate: string;
  endDate?: string;
  estimatedHours?: number;
  estimatedCostCents?: string;
  actualCostCents?: string; // Computed from time entries/allocations
  budgetAlertPct?: number;
  sortOrder: number;
  tasks?: {
    id: string;
    name: string;
    status: string;
  }[];
  _count?: {
    tasks: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePhaseDto {
  projectId: string;
  name: string;
  phaseType: string;
  status?: string;
  startDate: string;
  endDate?: string;
  estimatedHours?: number;
  estimatedCostCents?: string | number;
  budgetAlertPct?: number;
  sortOrder?: number;
}

export interface UpdatePhaseDto {
  name?: string;
  phaseType?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  estimatedHours?: number;
  estimatedCostCents?: string | number;
  budgetAlertPct?: number;
  sortOrder?: number;
}

export const phasesService = {
  async getAll(): Promise<Phase[]> {
    const response = await apiClient.get(`${SERVICES.PROJECTS}/phases`);
    return response.data;
  },

  async getByProject(projectId: string): Promise<Phase[]> {
    const response = await apiClient.get(`${SERVICES.PROJECTS}/phases?projectId=${projectId}`);
    return response.data;
  },

  async getById(id: string): Promise<Phase> {
    const response = await apiClient.get(`${SERVICES.PROJECTS}/phases/${id}`);
    return response.data;
  },

  async create(data: CreatePhaseDto): Promise<Phase> {
    const response = await apiClient.post(`${SERVICES.PROJECTS}/phases`, data);
    return response.data;
  },

  async update(id: string, data: UpdatePhaseDto): Promise<Phase> {
    const response = await apiClient.put(`${SERVICES.PROJECTS}/phases/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${SERVICES.PROJECTS}/phases/${id}`);
  },
};

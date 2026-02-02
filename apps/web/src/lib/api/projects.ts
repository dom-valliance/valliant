import { apiClient, SERVICES } from '../api-client';

export interface Project {
  id: string;
  name: string;
  code: string;
  clientId: string;
  client: {
    id: string;
    name: string;
  };
  primaryPracticeId: string;
  primaryPractice: {
    id: string;
    name: string;
  };
  valuePartnerId: string;
  valuePartner: {
    id: string;
    name: string;
    email: string;
  };
  status: 'PROSPECT' | 'DISCOVERY' | 'CONFIRMED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  commercialModel: 'VALUE_SHARE' | 'FIXED_PRICE' | 'HYBRID';
  estimatedValueCents?: string;
  valueSharePct?: number;
  agreedFeeCents?: string;
  contingencyPct?: number;
  currency: string;
  startDate: string;
  endDate?: string;
  projectType: 'BOOTCAMP' | 'PILOT' | 'USE_CASE_ROLLOUT';
  teamModel: 'THREE_IN_BOX' | 'FLEXIBLE';
  color: string;
  phases?: any[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDto {
  name: string;
  code: string;
  clientId: string;
  primaryPracticeId: string;
  valuePartnerId: string;
  status?: string;
  commercialModel: string;
  estimatedValueCents?: string | number;
  valueSharePct?: number;
  agreedFeeCents?: string | number;
  contingencyPct?: number;
  startDate: string;
  endDate?: string;
  projectType: string;
  teamModel?: string;
  color?: string;
  notes?: string;
}

export interface UpdateProjectDto {
  name?: string;
  code?: string;
  clientId?: string;
  primaryPracticeId?: string;
  valuePartnerId?: string;
  status?: string;
  commercialModel?: string;
  estimatedValueCents?: string | number;
  valueSharePct?: number;
  agreedFeeCents?: string | number;
  contingencyPct?: number;
  startDate?: string;
  endDate?: string;
  projectType?: string;
  teamModel?: string;
  color?: string;
  notes?: string;
}

export const projectsService = {
  async getAll(): Promise<Project[]> {
    const response = await apiClient.get(`${SERVICES.PROJECTS}/projects`);
    return response.data;
  },

  async getById(id: string): Promise<Project> {
    const response = await apiClient.get(`${SERVICES.PROJECTS}/projects/${id}`);
    return response.data;
  },

  async create(data: CreateProjectDto): Promise<Project> {
    const response = await apiClient.post(`${SERVICES.PROJECTS}/projects`, data);
    return response.data;
  },

  async update(id: string, data: UpdateProjectDto): Promise<Project> {
    const response = await apiClient.put(`${SERVICES.PROJECTS}/projects/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${SERVICES.PROJECTS}/projects/${id}`);
  },
};

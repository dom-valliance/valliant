import axios from 'axios';
import { SERVICES } from '../api-client';
import type { CreateAllocationDto } from '@vrm/shared-types';

const api = axios.create({
  baseURL: SERVICES.SCHEDULING,
});

export interface Allocation {
  id: string;
  personId: string;
  projectId: string;
  phaseId?: string;
  taskId?: string;
  startDate: string;
  endDate: string;
  hoursPerDay: number;
  allocationType: 'BILLABLE' | 'NON_BILLABLE' | 'INTERNAL' | 'BENCH';
  status: 'TENTATIVE' | 'CONFIRMED' | 'COMPLETED';
  roleId?: string;
  costRateCentsSnapshot: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  person: {
    id: string;
    name: string;
    email: string;
  };
  project: {
    id: string;
    name: string;
    code: string;
  };
  phase?: {
    id: string;
    name: string;
  };
  role?: {
    id: string;
    name: string;
  };
}

export interface AllocationFilters {
  personId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

export const allocationsService = {
  async getAll(filters?: AllocationFilters): Promise<Allocation[]> {
    const { data } = await api.get<Allocation[]>('/allocations', { params: filters });
    return data;
  },

  async getById(id: string): Promise<Allocation> {
    const { data } = await api.get<Allocation>(`/allocations/${id}`);
    return data;
  },

  async getByPerson(personId: string, startDate?: string, endDate?: string): Promise<Allocation[]> {
    const { data } = await api.get<Allocation[]>(`/allocations/person/${personId}`, {
      params: { startDate, endDate },
    });
    return data;
  },

  async getByProject(projectId: string): Promise<Allocation[]> {
    const { data } = await api.get<Allocation[]>(`/allocations/project/${projectId}`);
    return data;
  },

  async create(allocation: CreateAllocationDto): Promise<Allocation> {
    const { data } = await api.post<Allocation>('/allocations', allocation);
    return data;
  },

  async update(id: string, updates: Partial<CreateAllocationDto>): Promise<Allocation> {
    const { data } = await api.put<Allocation>(`/allocations/${id}`, updates);
    return data;
  },

  async confirm(id: string): Promise<Allocation> {
    const { data } = await api.put<Allocation>(`/allocations/${id}/confirm`);
    return data;
  },

  async complete(id: string): Promise<Allocation> {
    const { data } = await api.put<Allocation>(`/allocations/${id}/complete`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/allocations/${id}`);
  },
};

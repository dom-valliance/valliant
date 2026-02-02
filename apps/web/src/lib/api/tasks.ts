import { apiClient, SERVICES } from '../api-client';

export interface Task {
  id: string;
  phaseId: string;
  phase?: {
    id: string;
    name: string;
    projectId: string;
  };
  name: string;
  description?: string;
  estimatedHours?: number;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredRoleId?: string;
  requiredRole?: {
    id: string;
    name: string;
  };
  sortOrder: number;
  requiredSkills?: {
    id: string;
    skill: {
      id: string;
      name: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDto {
  phaseId: string;
  name: string;
  description?: string;
  estimatedHours?: number;
  status?: string;
  priority?: string;
  requiredRoleId?: string;
  sortOrder?: number;
}

export interface UpdateTaskDto {
  name?: string;
  description?: string;
  estimatedHours?: number;
  status?: string;
  priority?: string;
  requiredRoleId?: string;
  sortOrder?: number;
}

export const tasksService = {
  async getAll(): Promise<Task[]> {
    const response = await apiClient.get(`${SERVICES.PROJECTS}/tasks`);
    return response.data;
  },

  async getByPhase(phaseId: string): Promise<Task[]> {
    const response = await apiClient.get(`${SERVICES.PROJECTS}/tasks?phaseId=${phaseId}`);
    return response.data;
  },

  async getById(id: string): Promise<Task> {
    const response = await apiClient.get(`${SERVICES.PROJECTS}/tasks/${id}`);
    return response.data;
  },

  async create(data: CreateTaskDto): Promise<Task> {
    const response = await apiClient.post(`${SERVICES.PROJECTS}/tasks`, data);
    return response.data;
  },

  async update(id: string, data: UpdateTaskDto): Promise<Task> {
    const response = await apiClient.put(`${SERVICES.PROJECTS}/tasks/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${SERVICES.PROJECTS}/tasks/${id}`);
  },
};

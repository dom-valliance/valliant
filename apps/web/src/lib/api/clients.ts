import { apiClient, API_SERVICES } from './api-client';

export interface Client {
  id: string;
  name: string;
  industry?: string;
  primaryContact?: string;
  contactEmail?: string;
  notes?: string;
  projects?: {
    id: string;
    name: string;
    code: string;
    status: string;
  }[];
  _count?: {
    projects: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  industry?: string;
  primaryContact?: string;
  contactEmail?: string;
  notes?: string;
}

export interface UpdateClientDto {
  name?: string;
  industry?: string;
  primaryContact?: string;
  contactEmail?: string;
  notes?: string;
}

export const clientsService = {
  async getAll(): Promise<Client[]> {
    const response = await apiClient.get(`${API_SERVICES.PROJECT}/clients`);
    return response.data;
  },

  async getById(id: string): Promise<Client> {
    const response = await apiClient.get(`${API_SERVICES.PROJECT}/clients/${id}`);
    return response.data;
  },

  async create(data: CreateClientDto): Promise<Client> {
    const response = await apiClient.post(`${API_SERVICES.PROJECT}/clients`, data);
    return response.data;
  },

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    const response = await apiClient.put(`${API_SERVICES.PROJECT}/clients/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${API_SERVICES.PROJECT}/clients/${id}`);
  },
};

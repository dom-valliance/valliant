import { apiClient, SERVICES } from '../api-client';

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
    const response = await apiClient.get(`${SERVICES.PROJECTS}/clients`);
    return response.data;
  },

  async getById(id: string): Promise<Client> {
    const response = await apiClient.get(`${SERVICES.PROJECTS}/clients/${id}`);
    return response.data;
  },

  async create(data: CreateClientDto): Promise<Client> {
    const response = await apiClient.post(`${SERVICES.PROJECTS}/clients`, data);
    return response.data;
  },

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    const response = await apiClient.put(`${SERVICES.PROJECTS}/clients/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${SERVICES.PROJECTS}/clients/${id}`);
  },
};

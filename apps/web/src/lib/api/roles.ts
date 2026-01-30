import axios from 'axios';
import { SERVICES } from '../api-client';

const rolesApi = axios.create({
  baseURL: SERVICES.PEOPLE,
});

export interface Role {
  id: string;
  name: string;
  description?: string;
  defaultCostRateCents?: number;
  isBillable: boolean;
  createdAt: string;
  updatedAt: string;
}

export const rolesService = {
  async getAll(): Promise<Role[]> {
    const { data } = await rolesApi.get<Role[]>('/roles');
    return data;
  },

  async getById(id: string): Promise<Role> {
    const { data } = await rolesApi.get<Role>(`/roles/${id}`);
    return data;
  },
};

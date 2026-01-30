import axios from 'axios';
import { SERVICES } from '../api-client';

const practicesApi = axios.create({
  baseURL: SERVICES.PEOPLE,
});

export interface Practice {
  id: string;
  name: string;
  description?: string;
  leadId?: string;
  createdAt: string;
  updatedAt: string;
  members?: Array<{
    id: string;
    isPrimary: boolean;
    person: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

export const practicesService = {
  async getAll(): Promise<Practice[]> {
    const { data } = await practicesApi.get<Practice[]>('/practices');
    return data;
  },

  async getById(id: string): Promise<Practice> {
    const { data } = await practicesApi.get<Practice>(`/practices/${id}`);
    return data;
  },
};

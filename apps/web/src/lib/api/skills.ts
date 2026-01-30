import axios from 'axios';
import { SERVICES } from '../api-client';

const skillsApi = axios.create({
  baseURL: SERVICES.PEOPLE,
});

export interface Skill {
  id: string;
  name: string;
  category: 'PLATFORM' | 'PROGRAMMING' | 'FRAMEWORK' | 'DOMAIN' | 'METHODOLOGY' | 'SOFT_SKILL';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const skillsService = {
  async getAll(): Promise<Skill[]> {
    const { data } = await skillsApi.get<Skill[]>('/skills');
    return data;
  },

  async getById(id: string): Promise<Skill> {
    const { data } = await skillsApi.get<Skill>(`/skills/${id}`);
    return data;
  },

  async getByCategory(category: string): Promise<Skill[]> {
    const { data } = await skillsApi.get<Skill[]>(`/skills?category=${category}`);
    return data;
  },
};

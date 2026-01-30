import axios from 'axios';
import { SERVICES } from '../api-client';
import type { CreatePersonDto } from '@vrm/shared-types';

const peopleApi = axios.create({
  baseURL: SERVICES.PEOPLE,
});

export interface Person {
  id: string;
  name: string;
  email: string;
  type: 'EMPLOYEE' | 'CONTRACTOR';
  status: 'ACTIVE' | 'BENCH' | 'OFFBOARDED';
  costRateCents: number;
  costRateCurrency: string;
  defaultHoursPerWeek: number;
  seniority: 'JUNIOR' | 'MID' | 'SENIOR' | 'PRINCIPAL' | 'PARTNER';
  utilisationTarget: number;
  startDate: string;
  endDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  role: {
    id: string;
    name: string;
    description?: string;
  };
  department?: {
    id: string;
    name: string;
  } | null;
  practices: Array<{
    id: string;
    isPrimary: boolean;
    practice: {
      id: string;
      name: string;
    };
  }>;
  skills: Array<{
    id: string;
    proficiency: 'LEARNING' | 'COMPETENT' | 'PROFICIENT' | 'EXPERT';
    yearsExperience?: number;
    skill: {
      id: string;
      name: string;
      category: string;
    };
  }>;
}

export interface PeopleListResponse {
  data: Person[];
  total: number;
}

export const peopleService = {
  // Get all people
  async getAll(): Promise<Person[]> {
    const { data } = await peopleApi.get<Person[]>('/people');
    return data;
  },

  // Get person by ID
  async getById(id: string): Promise<Person> {
    const { data } = await peopleApi.get<Person>(`/people/${id}`);
    return data;
  },

  // Create person
  async create(person: CreatePersonDto): Promise<Person> {
    const { data } = await peopleApi.post<Person>('/people', person);
    return data;
  },

  // Update person
  async update(id: string, updates: Partial<CreatePersonDto>): Promise<Person> {
    const { data } = await peopleApi.put<Person>(`/people/${id}`, updates);
    return data;
  },

  // Delete person
  async delete(id: string): Promise<void> {
    await peopleApi.delete(`/people/${id}`);
  },
};

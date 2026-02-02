import axios from 'axios';
import { SERVICES } from '../api-client';
import type { CreateTimeLogDto } from '@vrm/shared-types';

const api = axios.create({
  baseURL: SERVICES.SCHEDULING,
});

export interface TimeLog {
  id: string;
  personId: string;
  projectId: string;
  phaseId?: string;
  date: string;
  hours: number;
  entryType: string;
  description?: string;
  status: string;
  createdAt: string;
  person: {
    id: string;
    name: string;
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
}

export interface TimeLogFilters {
  personId?: string;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PrefillSuggestion {
  projectId: string;
  project: { id: string; name: string; code: string };
  phaseId?: string;
  phase?: { id: string; name: string };
  suggestedHours: number;
  allocationType: string;
}

export interface WeeklyPrefill {
  weekStart: string;
  weekEnd: string;
  existingLogs: TimeLog[];
  suggestions: PrefillSuggestion[];
}

export interface TimeLogSummary {
  totalHours: number;
  byProject: {
    projectId: string;
    project: { id: string; name: string; code: string; client?: { name: string } };
    hours: number;
  }[];
  byPerson: {
    personId: string;
    person: { id: string; name: string };
    hours: number;
  }[];
}

export const timeLogsService = {
  async getAll(filters?: TimeLogFilters): Promise<TimeLog[]> {
    const { data } = await api.get<TimeLog[]>('/time-logs', { params: filters });
    return data;
  },

  async getById(id: string): Promise<TimeLog> {
    const { data } = await api.get<TimeLog>(`/time-logs/${id}`);
    return data;
  },

  async getWeeklyLogs(personId: string, weekStart: string): Promise<TimeLog[]> {
    const { data } = await api.get<TimeLog[]>(`/time-logs/person/${personId}/week/${weekStart}`);
    return data;
  },

  async prefillFromAllocations(personId: string, weekStart: string): Promise<WeeklyPrefill> {
    const { data } = await api.get<WeeklyPrefill>(`/time-logs/person/${personId}/prefill/${weekStart}`);
    return data;
  },

  async getSummary(filters?: TimeLogFilters): Promise<TimeLogSummary> {
    const { data } = await api.get<TimeLogSummary>('/time-logs/summary', { params: filters });
    return data;
  },

  async create(timeLog: CreateTimeLogDto): Promise<TimeLog> {
    const { data } = await api.post<TimeLog>('/time-logs', timeLog);
    return data;
  },

  async createBatch(timeLogs: CreateTimeLogDto[]): Promise<TimeLog[]> {
    const { data } = await api.post<TimeLog[]>('/time-logs/batch', timeLogs);
    return data;
  },

  async update(id: string, updates: Partial<CreateTimeLogDto>): Promise<TimeLog> {
    const { data } = await api.put<TimeLog>(`/time-logs/${id}`, updates);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/time-logs/${id}`);
  },
};

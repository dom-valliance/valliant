import axios from 'axios';
import { SERVICES } from '../api-client';

const api = axios.create({
  baseURL: SERVICES.SCHEDULING,
});

export interface DayAvailability {
  date: string;
  capacity: number;
  confirmedHours: number;
  tentativeHours: number;
  availableHours: number;
  allocations: {
    id: string;
    projectName: string;
    projectCode: string;
    phaseName?: string;
    hours: number;
    status: string;
    type: string;
  }[];
}

export interface PersonAvailability {
  person: {
    id: string;
    name: string;
    email: string;
    role: string;
    dailyCapacity: number;
    utilisationTarget: number;
  };
  days: DayAvailability[];
  summary: {
    totalCapacity: number;
    confirmedHours: number;
    tentativeHours: number;
    availableHours: number;
    utilizationRate: number;
  };
}

export interface UtilisationMetrics {
  personId: string;
  personName: string;
  period: { start: string; end: string };
  capacity: {
    totalHours: number;
    workingDays: number;
  };
  logged: {
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
  };
  allocated: {
    confirmedHours: number;
    tentativeHours: number;
  };
  utilisation: {
    rate: number;
    target: number;
    variance: number;
    status: 'ABOVE_TARGET' | 'ON_TARGET' | 'BELOW_TARGET' | 'SIGNIFICANTLY_BELOW';
  };
}

export interface BenchCapacity {
  period: { start: string; end: string };
  summary: {
    totalCapacity: number;
    totalAllocated: number;
    totalBench: number;
    benchPercentage: number;
  };
  byPerson: {
    personId: string;
    personName: string;
    role: string;
    totalCapacity: number;
    allocatedHours: number;
    benchHours: number;
    benchPercentage: number;
  }[];
}

export const availabilityService = {
  async getPersonAvailability(personId: string, startDate: string, endDate: string): Promise<PersonAvailability> {
    const { data } = await api.get<PersonAvailability>(`/availability/person/${personId}`, {
      params: { startDate, endDate },
    });
    return data;
  },

  async getAllPeopleAvailability(startDate: string, endDate: string): Promise<PersonAvailability[]> {
    const { data } = await api.get<PersonAvailability[]>('/availability/people', {
      params: { startDate, endDate },
    });
    return data;
  },

  async getPersonUtilisation(personId: string, startDate: string, endDate: string): Promise<UtilisationMetrics> {
    const { data } = await api.get<UtilisationMetrics>(`/availability/utilisation/${personId}`, {
      params: { startDate, endDate },
    });
    return data;
  },

  async getAllUtilisation(startDate: string, endDate: string): Promise<UtilisationMetrics[]> {
    const { data } = await api.get<UtilisationMetrics[]>('/availability/utilisation', {
      params: { startDate, endDate },
    });
    return data;
  },

  async getBenchCapacity(startDate: string, endDate: string): Promise<BenchCapacity> {
    const { data } = await api.get<BenchCapacity>('/availability/bench', {
      params: { startDate, endDate },
    });
    return data;
  },
};

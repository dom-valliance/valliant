import axios from 'axios';
import { SERVICES } from '../api-client';

const api = axios.create({
  baseURL: SERVICES.SCHEDULING,
});

export interface RecommendAssignmentRequest {
  projectId: string;
  requiredSkills?: string[];
  requiredRoleId?: string;
  startDate: string;
  endDate: string;
  budgetCents?: number;
  excludePersonIds?: string[];
}

export interface Recommendation {
  personId: string;
  personName: string;
  matchScore: number;
  reasoning: string;
  skillMatch: { skill: string; proficiency: string }[];
  availableHours: number;
  dailyCostCents: number;
  totalCostCents: number;
  tradeoffs?: string;
}

export interface ResolveConflictRequest {
  personId: string;
  startDate: string;
  endDate: string;
}

export interface ConflictResolution {
  suggestion: string;
  alternatives: {
    personId: string;
    personName: string;
    reasoning: string;
  }[];
  redistributionOptions: {
    description: string;
    allocationsToModify: string[];
  }[];
}

export interface OptimizeTeamRequest {
  projectId: string;
  budgetCents: number;
  requiredSkills?: string[];
}

export interface TeamSuggestion {
  totalCostCents: number;
  budgetUtilization: number;
  team: {
    personId: string;
    personName: string;
    role: string;
    hoursPerDay: number;
    costCents: number;
    reasoning: string;
  }[];
  tradeoffs: string;
  alternatives?: string;
}

export interface NaturalLanguageQueryResponse {
  answer: string;
  data?: any;
}

export const aiService = {
  async recommendAssignment(request: RecommendAssignmentRequest): Promise<Recommendation[]> {
    const { data } = await api.post<Recommendation[]>('/ai/recommend-assignment', request);
    return data;
  },

  async resolveConflict(request: ResolveConflictRequest): Promise<ConflictResolution> {
    const { data } = await api.post<ConflictResolution>('/ai/resolve-conflict', request);
    return data;
  },

  async optimizeTeam(request: OptimizeTeamRequest): Promise<TeamSuggestion> {
    const { data } = await api.post<TeamSuggestion>('/ai/optimize-team', request);
    return data;
  },

  async query(query: string): Promise<NaturalLanguageQueryResponse> {
    const { data } = await api.post<NaturalLanguageQueryResponse>('/ai/query', { query });
    return data;
  },
};

import { useQuery, useMutation } from '@tanstack/react-query';
import { aiService, RecommendAssignmentRequest, ResolveConflictRequest, OptimizeTeamRequest } from '@/lib/api/ai';

export const AI_QUERY_KEY = ['ai'];

export function useRecommendAssignment() {
  return useMutation({
    mutationFn: (request: RecommendAssignmentRequest) => aiService.recommendAssignment(request),
  });
}

export function useResolveConflict() {
  return useMutation({
    mutationFn: (request: ResolveConflictRequest) => aiService.resolveConflict(request),
  });
}

export function useOptimizeTeam() {
  return useMutation({
    mutationFn: (request: OptimizeTeamRequest) => aiService.optimizeTeam(request),
  });
}

export function useAIQuery() {
  return useMutation({
    mutationFn: (query: string) => aiService.query(query),
  });
}

// For prefetching or caching AI responses if needed
export function useAIQueryResult(query: string, enabled = false) {
  return useQuery({
    queryKey: [...AI_QUERY_KEY, 'query', query],
    queryFn: () => aiService.query(query),
    enabled: enabled && !!query,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

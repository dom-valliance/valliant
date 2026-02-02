import { Controller, Post, Body } from '@nestjs/common';
import {
  AIService,
  RecommendAssignmentRequest,
  ResolveConflictRequest,
  OptimizeTeamRequest,
  Recommendation,
  ConflictResolution,
  TeamSuggestion,
} from './ai.service';

interface NaturalLanguageQueryRequest {
  query: string;
}

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('recommend-assignment')
  recommendAssignment(@Body() request: RecommendAssignmentRequest): Promise<Recommendation[]> {
    return this.aiService.recommendAssignment(request);
  }

  @Post('resolve-conflict')
  resolveConflict(@Body() request: ResolveConflictRequest): Promise<ConflictResolution> {
    return this.aiService.resolveConflict(request);
  }

  @Post('optimize-team')
  optimizeTeam(@Body() request: OptimizeTeamRequest): Promise<TeamSuggestion> {
    return this.aiService.optimizeTeam(request);
  }

  @Post('query')
  naturalLanguageQuery(@Body() request: NaturalLanguageQueryRequest): Promise<{ answer: string; data?: any }> {
    return this.aiService.naturalLanguageQuery(request.query);
  }
}

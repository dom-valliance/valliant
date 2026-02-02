import { Injectable } from '@nestjs/common';
import { prisma, Prisma } from '@vrm/database';
import Anthropic from '@anthropic-ai/sdk';

export interface RecommendAssignmentRequest {
  projectId: string;
  requiredSkills?: string[];
  requiredRoleId?: string;
  startDate: string;
  endDate: string;
  budgetCents?: number;
  excludePersonIds?: string[];
}

export interface ResolveConflictRequest {
  personId: string;
  startDate: string;
  endDate: string;
}

export interface OptimizeTeamRequest {
  projectId: string;
  budgetCents: number;
  requiredSkills?: string[];
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

// Type for person with allocations from Prisma query
type PersonWithAllocations = Prisma.PersonGetPayload<{
  include: {
    role: true;
    skills: { include: { skill: true } };
    allocations: true;
    practices: { include: { practice: true } };
  };
}>;

interface PersonAvailabilityData {
  id: string;
  name: string;
  type: string;
  seniority: string;
  role: string;
  dailyCostCents: number;
  totalCostCents: number;
  availableHours: number;
  utilisationTarget: number;
  currentUtilisation: number;
  skills: { name: string; proficiency: string; category: string }[];
  practices: string[];
}

@Injectable()
export class AIService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async recommendAssignment(request: RecommendAssignmentRequest): Promise<Recommendation[]> {
    // Validate dates
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date range provided. Please provide valid startDate and endDate in ISO format.');
    }

    // Get project details
    const project = await prisma.project.findUnique({
      where: { id: request.projectId },
      include: {
        client: true,
        primaryPractice: true,
        phases: true,
      },
    });

    // Get available people with their skills, rates, and current allocations
    const people = await prisma.person.findMany({
      where: {
        status: 'ACTIVE',
        id: { notIn: request.excludePersonIds || [] },
        ...(request.requiredRoleId ? { roleId: request.requiredRoleId } : {}),
      },
      include: {
        role: true,
        skills: {
          include: { skill: true },
        },
        allocations: {
          where: {
            status: { in: ['TENTATIVE', 'CONFIRMED'] },
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        },
        practices: {
          include: { practice: true },
        },
      },
    });

    // Calculate availability and prepare data for AI
    const peopleWithAvailability: PersonAvailabilityData[] = people.map((person: PersonWithAllocations) => {
      const totalDays = this.getBusinessDays(startDate, endDate);
      const dailyCapacity = Number(person.defaultHoursPerWeek) / 5;

      // Calculate already allocated hours
      const allocatedHours = person.allocations.reduce((sum: number, alloc) => {
        const overlapStart = new Date(Math.max(alloc.startDate.getTime(), startDate.getTime()));
        const overlapEnd = new Date(Math.min(alloc.endDate.getTime(), endDate.getTime()));
        const overlapDays = this.getBusinessDays(overlapStart, overlapEnd);
        return sum + overlapDays * Number(alloc.hoursPerDay);
      }, 0);

      const totalCapacity = totalDays * dailyCapacity;
      const availableHours = Math.max(0, totalCapacity - allocatedHours);
      const totalCostCents = (availableHours / dailyCapacity) * person.costRateCents;

      return {
        id: person.id,
        name: person.name,
        type: person.type,
        seniority: person.seniority,
        role: person.role.name,
        dailyCostCents: person.costRateCents,
        totalCostCents,
        availableHours,
        utilisationTarget: Number(person.utilisationTarget),
        currentUtilisation: allocatedHours / totalCapacity,
        skills: person.skills.map((ps) => ({
          name: ps.skill.name,
          proficiency: ps.proficiency,
          category: ps.skill.category,
        })),
        practices: person.practices.map((pm) => pm.practice.name),
      };
    });

    // Build prompt for Claude
    const prompt = this.buildRecommendationPrompt(
      project,
      request,
      peopleWithAvailability,
    );

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseRecommendations(content.text);
      }
      return [];
    } catch (error) {
      console.error('AI recommendation error:', error);
      // Fallback to simple matching if AI fails
      return this.fallbackRecommendations(peopleWithAvailability, request);
    }
  }

  async resolveConflict(request: ResolveConflictRequest): Promise<ConflictResolution> {
    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date range provided. Please provide valid startDate and endDate in ISO format.');
    }

    // Get person with their allocations
    const person = await prisma.person.findUnique({
      where: { id: request.personId },
      include: {
        role: true,
        allocations: {
          where: {
            status: { in: ['TENTATIVE', 'CONFIRMED'] },
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
          include: {
            project: { select: { id: true, name: true, code: true } },
            phase: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!person) {
      throw new Error('Person not found');
    }

    // Get alternative people with same role
    const alternatives = await prisma.person.findMany({
      where: {
        status: 'ACTIVE',
        roleId: person.roleId,
        id: { not: person.id },
      },
      include: {
        role: true,
        skills: { include: { skill: true } },
        allocations: {
          where: {
            status: { in: ['TENTATIVE', 'CONFIRMED'] },
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        },
      },
    });

    const prompt = this.buildConflictResolutionPrompt(person, alternatives, startDate, endDate);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseConflictResolution(content.text);
      }
    } catch (error) {
      console.error('AI conflict resolution error:', error);
    }

    // Fallback response
    return {
      suggestion: `${person.name} appears to be overallocated during this period.`,
      alternatives: alternatives.slice(0, 3).map((alt: { id: string; name: string; role: { name: string } }) => ({
        personId: alt.id,
        personName: alt.name,
        reasoning: `Available ${alt.role.name} with similar skills`,
      })),
      redistributionOptions: [],
    };
  }

  async optimizeTeam(request: OptimizeTeamRequest): Promise<TeamSuggestion> {
    // Get project details
    const project = await prisma.project.findUnique({
      where: { id: request.projectId },
      include: {
        client: true,
        primaryPractice: true,
        phases: {
          include: {
            tasks: {
              include: { requiredRole: true },
            },
          },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Get all active people with skills and rates
    const people = await prisma.person.findMany({
      where: { status: 'ACTIVE' },
      include: {
        role: true,
        skills: { include: { skill: true } },
        practices: { include: { practice: true } },
      },
    });

    const prompt = this.buildOptimizeTeamPrompt(project, people, request.budgetCents, request.requiredSkills);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return this.parseTeamSuggestion(content.text);
      }
    } catch (error) {
      console.error('AI team optimization error:', error);
    }

    // Fallback
    return {
      totalCostCents: 0,
      budgetUtilization: 0,
      team: [],
      tradeoffs: 'Unable to generate AI recommendation. Please try again.',
    };
  }

  async naturalLanguageQuery(query: string): Promise<{ answer: string; data?: any }> {
    // Get current data for context
    const [people, projects, allocations] = await Promise.all([
      prisma.person.findMany({
        where: { status: 'ACTIVE' },
        include: { role: true, skills: { include: { skill: true } } },
      }),
      prisma.project.findMany({
        where: { status: { in: ['ACTIVE', 'CONFIRMED'] } },
        include: { client: true, primaryPractice: true },
      }),
      prisma.allocation.findMany({
        where: {
          status: { in: ['TENTATIVE', 'CONFIRMED'] },
          endDate: { gte: new Date() },
        },
        include: {
          person: { select: { id: true, name: true } },
          project: { select: { id: true, name: true, code: true } },
        },
      }),
    ]);

    const prompt = this.buildNLQueryPrompt(query, people, projects, allocations);

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return { answer: content.text };
      }
    } catch (error) {
      console.error('AI query error:', error);
    }

    return { answer: 'Unable to process your query. Please try rephrasing.' };
  }

  // Helper methods

  private getBusinessDays(start: Date, end: Date): number {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) count++;
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  private buildRecommendationPrompt(
    project: any,
    request: RecommendAssignmentRequest,
    people: any[],
  ): string {
    const budgetLine = request.budgetCents
      ? `- Budget Constraint: £${(request.budgetCents / 100).toFixed(2)}`
      : '';

    return `You are an AI assistant for Valliance, a value-based AI consultancy. Help optimize resource allocation.

## Task
Recommend the best people to assign to this project based on skill match, availability, cost efficiency, and utilisation balance.

## Project Details
- Name: ${project?.name || 'Unknown'}
- Client: ${project?.client?.name || 'Unknown'}
- Practice: ${project?.primaryPractice?.name || 'Unknown'}
- Date Range: ${request.startDate} to ${request.endDate}
${budgetLine}
- Required Skills: ${request.requiredSkills?.join(', ') || 'Not specified'}

## Available People
${people.map(p => `
### ${p.name} (${p.role}, ${p.seniority}, ${p.type})
- Skills: ${p.skills.map((s: any) => `${s.name} (${s.proficiency})`).join(', ') || 'None listed'}
- Practices: ${p.practices.join(', ') || 'None'}
- Available Hours: ${p.availableHours.toFixed(1)}
- Daily Cost: £${(p.dailyCostCents / 100).toFixed(2)}
- Total Cost for Period: £${(p.totalCostCents / 100).toFixed(2)}
- Current Utilisation: ${(p.currentUtilisation * 100).toFixed(0)}%
- Target Utilisation: ${(p.utilisationTarget * 100).toFixed(0)}%
`).join('\n')}

## Instructions
Return a JSON array of recommendations, ordered by best fit. Consider:
1. Skill match (highest priority)
2. Availability
3. Cost efficiency within budget
4. Utilisation balance (prefer people below their target)
5. Employee vs Contractor (prefer employees when equivalent)

Return ONLY valid JSON in this format:
[
  {
    "personId": "uuid",
    "personName": "Name",
    "matchScore": 85,
    "reasoning": "Brief explanation",
    "skillMatch": [{"skill": "Palantir AIP", "proficiency": "EXPERT"}],
    "availableHours": 40,
    "dailyCostCents": 50000,
    "totalCostCents": 250000,
    "tradeoffs": "Optional note about trade-offs"
  }
]`;
  }

  private buildConflictResolutionPrompt(
    person: any,
    alternatives: any[],
    _startDate: Date,
    _endDate: Date,
  ): string {
    return `You are helping resolve a resource allocation conflict for Valliance.

## Overallocated Person
- Name: ${person.name}
- Role: ${person.role.name}
- Current Allocations in Period:
${person.allocations.map((a: any) => `  - ${a.project.name} (${a.project.code}): ${a.hoursPerDay}h/day`).join('\n')}

## Alternative People Available
${alternatives.map(alt => `
- ${alt.name} (${alt.role.name})
  Current allocations: ${alt.allocations.length} in this period
`).join('\n')}

## Instructions
Suggest how to resolve this conflict. Return JSON:
{
  "suggestion": "Main recommendation text",
  "alternatives": [
    {"personId": "uuid", "personName": "Name", "reasoning": "Why this person"}
  ],
  "redistributionOptions": [
    {"description": "Option description", "allocationsToModify": ["alloc-id-1"]}
  ]
}`;
  }

  private buildOptimizeTeamPrompt(
    project: any,
    people: any[],
    budgetCents: number,
    requiredSkills?: string[],
  ): string {
    return `You are helping build an optimal team for a Valliance project.

## Project
- Name: ${project.name}
- Client: ${project.client?.name}
- Practice: ${project.primaryPractice?.name}
- Budget: £${(budgetCents / 100).toFixed(2)}
${requiredSkills ? `- Required Skills: ${requiredSkills.join(', ')}` : ''}

## 3-in-the-Box Model (Preferred)
Valliance prefers teams with: Consultant + Engineer + Orchestrator

## Available People
${people.slice(0, 20).map(p => `
- ${p.name}: ${p.role.name}, £${(p.costRateCents / 100).toFixed(2)}/day
  Skills: ${p.skills.slice(0, 5).map((s: any) => s.skill.name).join(', ')}
`).join('\n')}

## Instructions
Suggest the optimal team within budget. Return JSON:
{
  "totalCostCents": 250000,
  "budgetUtilization": 0.85,
  "team": [
    {"personId": "uuid", "personName": "Name", "role": "Consultant", "hoursPerDay": 8, "costCents": 50000, "reasoning": "Why"}
  ],
  "tradeoffs": "Any trade-offs or considerations",
  "alternatives": "Optional alternative configurations"
}`;
  }

  private buildNLQueryPrompt(query: string, people: any[], projects: any[], allocations: any[]): string {
    return `You are an AI assistant for Valliance resource management. Answer this query based on the data provided.

## Query
"${query}"

## Current Data Summary
- Active People: ${people.length}
  ${people.slice(0, 10).map(p => `  - ${p.name} (${p.role.name})`).join('\n')}

- Active/Confirmed Projects: ${projects.length}
  ${projects.slice(0, 10).map(p => `  - ${p.name} (${p.client?.name})`).join('\n')}

- Current Allocations: ${allocations.length}

## Instructions
Answer the query naturally and helpfully. If you need to list specific people or projects, include their names. Be concise but informative.`;
  }

  private parseRecommendations(text: string): Recommendation[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse AI recommendations:', e);
    }
    return [];
  }

  private parseConflictResolution(text: string): ConflictResolution {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse conflict resolution:', e);
    }
    return {
      suggestion: 'Unable to parse AI response',
      alternatives: [],
      redistributionOptions: [],
    };
  }

  private parseTeamSuggestion(text: string): TeamSuggestion {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Failed to parse team suggestion:', e);
    }
    return {
      totalCostCents: 0,
      budgetUtilization: 0,
      team: [],
      tradeoffs: 'Unable to parse AI response',
    };
  }

  private fallbackRecommendations(people: PersonAvailabilityData[], _request: RecommendAssignmentRequest): Recommendation[] {
    // Simple skill-based matching as fallback
    return people
      .filter(p => p.availableHours > 0)
      .sort((a, b) => b.availableHours - a.availableHours)
      .slice(0, 5)
      .map((p, index) => ({
        personId: p.id,
        personName: p.name,
        matchScore: 100 - index * 10,
        reasoning: `Available ${p.role} with ${p.availableHours.toFixed(0)} hours capacity`,
        skillMatch: p.skills.slice(0, 3).map((s) => ({
          skill: s.name,
          proficiency: s.proficiency,
        })),
        availableHours: p.availableHours,
        dailyCostCents: p.dailyCostCents,
        totalCostCents: p.totalCostCents,
      }));
  }
}

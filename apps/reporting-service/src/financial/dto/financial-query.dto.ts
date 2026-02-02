import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum BudgetStatus {
  ON_TRACK = 'ON_TRACK',
  WARNING = 'WARNING',
  EXCEEDED = 'EXCEEDED',
}

export class FinancialQueryDto {
  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  practiceId?: string;

  @IsOptional()
  @IsString()
  valuePartnerId?: string;

  @IsOptional()
  @IsEnum(BudgetStatus)
  budgetStatus?: BudgetStatus;
}

export interface ProjectFinancials {
  projectId: string;
  projectName: string;
  projectCode: string;
  clientName: string;
  valuePartnerName: string;
  commercialModel: string;
  status: string;

  // Revenue
  estimatedValueCents: number | null;
  valueSharePct: number | null;
  agreedFeeCents: number | null;
  impliedRevenueCents: number;

  // Costs
  estimatedCostCents: number;
  actualCostCents: number;
  contingencyPct: number;
  totalBudgetCents: number;

  // Margin
  grossMarginCents: number;
  marginPct: number;

  // Progress
  costConsumedPct: number;
  budgetStatus: BudgetStatus;

  // Phases summary
  phasesCount: number;
  phasesWithWarning: number;
  phasesExceeded: number;
}

export interface PhaseBudget {
  phaseId: string;
  phaseName: string;
  phaseType: string;
  projectId: string;
  projectName: string;
  projectCode: string;

  estimatedHours: number | null;
  estimatedCostCents: number | null;
  actualCostCents: number;
  budgetAlertPct: number;

  consumedPct: number;
  status: BudgetStatus;
  remainingCents: number;
}

export interface ValuePartnerSummary {
  valuePartnerId: string;
  valuePartnerName: string;
  projectCount: number;
  totalRevenueCents: number;
  totalCostCents: number;
  totalMarginCents: number;
  averageMarginPct: number;
  projects: ProjectFinancials[];
}

export interface FinancialSummary {
  totalProjects: number;
  activeProjects: number;
  totalRevenueCents: number;
  totalCostCents: number;
  totalMarginCents: number;
  averageMarginPct: number;
  projectsOnTrack: number;
  projectsAtRisk: number;
  projectsOverBudget: number;
}

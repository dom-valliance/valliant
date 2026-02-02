import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';

export enum GroupBy {
  PERSON = 'person',
  PRACTICE = 'practice',
  PROJECT = 'project',
  ROLE = 'role',
}

export class UtilisationQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  personId?: string;

  @IsOptional()
  @IsString()
  practiceId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsEnum(GroupBy)
  groupBy?: GroupBy;
}

export interface PersonUtilisation {
  personId: string;
  personName: string;
  personType: string;
  role: string;
  practice: string | null;
  capacity: number;
  billableHours: number;
  nonBillableHours: number;
  internalHours: number;
  leaveHours: number;
  benchHours: number;
  totalWorkedHours: number;
  utilisationRate: number;
  billableRate: number;
  utilisationTarget: number;
  variance: number;
  status: 'UNDER' | 'ON_TARGET' | 'OVER';
}

export interface PracticeUtilisation {
  practiceId: string;
  practiceName: string;
  memberCount: number;
  totalCapacity: number;
  totalBillableHours: number;
  totalNonBillableHours: number;
  averageUtilisationRate: number;
  averageTarget: number;
}

export interface ProjectUtilisation {
  projectId: string;
  projectName: string;
  projectCode: string;
  clientName: string;
  status: string;
  totalAllocatedHours: number;
  totalLoggedHours: number;
  billableHours: number;
  teamSize: number;
}

export interface BenchPerson {
  personId: string;
  personName: string;
  personType: string;
  role: string;
  practice: string | null;
  availableHours: number;
  skills: string[];
  daysOnBench: number;
}

export interface UtilisationSummary {
  period: { start: string; end: string };
  overall: {
    totalCapacity: number;
    totalBillableHours: number;
    totalNonBillableHours: number;
    averageUtilisationRate: number;
    averageBillableRate: number;
    peopleCount: number;
    underUtilisedCount: number;
    overUtilisedCount: number;
  };
  byPerson?: PersonUtilisation[];
  byPractice?: PracticeUtilisation[];
  byProject?: ProjectUtilisation[];
}

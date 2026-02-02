import { IsOptional, IsDateString, IsString, IsNumber, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class AvailabilityQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',') : value))
  skillIds?: string[];

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsString()
  practiceId?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  minHours?: number;
}

export interface PersonAvailability {
  personId: string;
  personName: string;
  personType: string;
  role: string;
  practice: string | null;
  skills: string[];
  totalCapacity: number;
  allocatedHours: number;
  availableHours: number;
  availabilityPct: number;
  costRateCents: number;
  allocations: Array<{
    projectName: string;
    hoursPerDay: number;
    startDate: string;
    endDate: string;
  }>;
}

export interface CapacityForecast {
  weekStart: string;
  totalCapacity: number;
  allocatedHours: number;
  availableHours: number;
  utilizationPct: number;
  byPractice: Record<string, { capacity: number; allocated: number; available: number }>;
}

import { IsOptional, IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';

/**
 * Simplified time log DTO for value-based organization.
 * Captures weekly totals per project, not detailed daily entries.
 */
export class CreateTimeLogDto {
  @IsString()
  personId!: string;

  @IsString()
  projectId!: string;

  @IsOptional()
  @IsString()
  phaseId?: string;

  @IsDateString()
  weekStartDate!: string; // Monday of the week

  @IsNumber()
  @Min(0)
  @Max(168) // Max hours in a week
  totalHours!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

import { IsEnum, IsOptional, IsString, IsNumber, IsDateString, Min, Max } from 'class-validator';

export enum AllocationType {
  BILLABLE = 'BILLABLE',
  NON_BILLABLE = 'NON_BILLABLE',
  INTERNAL = 'INTERNAL',
  BENCH = 'BENCH',
  LEAVE = 'LEAVE',
}

export enum AllocationStatus {
  TENTATIVE = 'TENTATIVE',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
}

export class CreateAllocationDto {
  @IsString()
  personId!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  phaseId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsNumber()
  @Min(0.5)
  @Max(24)
  hoursPerDay!: number;

  @IsEnum(AllocationType)
  allocationType!: AllocationType;

  @IsOptional()
  @IsEnum(AllocationStatus)
  status?: AllocationStatus;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

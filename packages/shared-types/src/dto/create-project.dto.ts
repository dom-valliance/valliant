import { IsString, IsEnum, IsOptional, IsDateString, IsNumber, IsInt } from 'class-validator';

export enum ProjectStatus {
  PROSPECT = 'PROSPECT',
  DISCOVERY = 'DISCOVERY',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CommercialModel {
  VALUE_SHARE = 'VALUE_SHARE',
  FIXED_PRICE = 'FIXED_PRICE',
  HYBRID = 'HYBRID',
}

export enum ProjectType {
  BOOTCAMP = 'BOOTCAMP',
  PILOT = 'PILOT',
  USE_CASE_ROLLOUT = 'USE_CASE_ROLLOUT',
}

export enum TeamModel {
  THREE_IN_BOX = 'THREE_IN_BOX',
  FLEXIBLE = 'FLEXIBLE',
}

export class CreateProjectDto {
  @IsString()
  name!: string;

  @IsString()
  code!: string;

  @IsString()
  clientId!: string;

  @IsString()
  primaryPracticeId!: string;

  @IsString()
  valuePartnerId!: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsEnum(CommercialModel)
  commercialModel!: CommercialModel;

  @IsOptional()
  @IsInt()
  estimatedValueCents?: number;

  @IsOptional()
  @IsNumber()
  valueSharePct?: number;

  @IsOptional()
  @IsInt()
  agreedFeeCents?: number;

  @IsOptional()
  @IsNumber()
  contingencyPct?: number;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsEnum(ProjectType)
  projectType!: ProjectType;

  @IsOptional()
  @IsString()
  parentProjectId?: string;

  @IsOptional()
  @IsEnum(TeamModel)
  teamModel?: TeamModel;

  @IsOptional()
  @IsString()
  notes?: string;
}

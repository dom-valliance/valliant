import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Min, IsArray, IsDateString, IsNumber } from 'class-validator';

export enum PersonType {
  EMPLOYEE = 'EMPLOYEE',
  CONTRACTOR = 'CONTRACTOR',
}

export enum Seniority {
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  PRINCIPAL = 'PRINCIPAL',
  PARTNER = 'PARTNER',
}

export class CreatePersonDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsEnum(PersonType)
  type!: PersonType;

  @IsString()
  roleId!: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsInt()
  @Min(0)
  costRateCents!: number;

  @IsOptional()
  @IsString()
  costRateCurrency?: string;

  @IsOptional()
  @IsNumber()
  defaultHoursPerWeek?: number;

  @IsOptional()
  @IsArray()
  workingDays?: number[];

  @IsEnum(Seniority)
  seniority!: Seniority;

  @IsOptional()
  @IsNumber()
  utilisationTarget?: number;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  practiceIds?: string[];
}

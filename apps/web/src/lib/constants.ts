/**
 * Centralized constants for the Valliance Resource Management System.
 * These values should match the Prisma schema enums exactly.
 *
 * When adding new enum values to the database schema, update this file
 * to ensure the frontend reflects those changes.
 */

// ============== PEOPLE ==============

export const PersonType = {
  EMPLOYEE: 'EMPLOYEE',
  CONTRACTOR: 'CONTRACTOR',
} as const;

export type PersonType = (typeof PersonType)[keyof typeof PersonType];

export const PERSON_TYPE_OPTIONS = [
  { value: PersonType.EMPLOYEE, label: 'Employee' },
  { value: PersonType.CONTRACTOR, label: 'Contractor' },
] as const;

export const PersonStatus = {
  ACTIVE: 'ACTIVE',
  BENCH: 'BENCH',
  OFFBOARDED: 'OFFBOARDED',
} as const;

export type PersonStatus = (typeof PersonStatus)[keyof typeof PersonStatus];

export const PERSON_STATUS_OPTIONS = [
  { value: PersonStatus.ACTIVE, label: 'Active' },
  { value: PersonStatus.BENCH, label: 'Bench' },
  { value: PersonStatus.OFFBOARDED, label: 'Offboarded' },
] as const;

export const Seniority = {
  JUNIOR: 'JUNIOR',
  MID: 'MID',
  SENIOR: 'SENIOR',
  PRINCIPAL: 'PRINCIPAL',
  PARTNER: 'PARTNER',
} as const;

export type Seniority = (typeof Seniority)[keyof typeof Seniority];

export const SENIORITY_OPTIONS = [
  { value: Seniority.JUNIOR, label: 'Junior' },
  { value: Seniority.MID, label: 'Mid' },
  { value: Seniority.SENIOR, label: 'Senior' },
  { value: Seniority.PRINCIPAL, label: 'Principal' },
  { value: Seniority.PARTNER, label: 'Partner' },
] as const;

// ============== SKILLS ==============

export const SkillCategory = {
  PLATFORM: 'PLATFORM',
  PROGRAMMING: 'PROGRAMMING',
  FRAMEWORK: 'FRAMEWORK',
  DOMAIN: 'DOMAIN',
  METHODOLOGY: 'METHODOLOGY',
  SOFT_SKILL: 'SOFT_SKILL',
} as const;

export type SkillCategory = (typeof SkillCategory)[keyof typeof SkillCategory];

export const SKILL_CATEGORY_OPTIONS = [
  { value: SkillCategory.PLATFORM, label: 'Platform' },
  { value: SkillCategory.PROGRAMMING, label: 'Programming' },
  { value: SkillCategory.FRAMEWORK, label: 'Framework' },
  { value: SkillCategory.DOMAIN, label: 'Domain' },
  { value: SkillCategory.METHODOLOGY, label: 'Methodology' },
  { value: SkillCategory.SOFT_SKILL, label: 'Soft Skill' },
] as const;

export const Proficiency = {
  LEARNING: 'LEARNING',
  COMPETENT: 'COMPETENT',
  PROFICIENT: 'PROFICIENT',
  EXPERT: 'EXPERT',
} as const;

export type Proficiency = (typeof Proficiency)[keyof typeof Proficiency];

export const PROFICIENCY_OPTIONS = [
  { value: Proficiency.LEARNING, label: 'Learning' },
  { value: Proficiency.COMPETENT, label: 'Competent' },
  { value: Proficiency.PROFICIENT, label: 'Proficient' },
  { value: Proficiency.EXPERT, label: 'Expert' },
] as const;

// ============== PROJECTS ==============

export const ProjectStatus = {
  PROSPECT: 'PROSPECT',
  DISCOVERY: 'DISCOVERY',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const PROJECT_STATUS_OPTIONS = [
  { value: ProjectStatus.PROSPECT, label: 'Prospect' },
  { value: ProjectStatus.DISCOVERY, label: 'Discovery' },
  { value: ProjectStatus.CONFIRMED, label: 'Confirmed' },
  { value: ProjectStatus.ACTIVE, label: 'Active' },
  { value: ProjectStatus.ON_HOLD, label: 'On Hold' },
  { value: ProjectStatus.COMPLETED, label: 'Completed' },
  { value: ProjectStatus.CANCELLED, label: 'Cancelled' },
] as const;

export const CommercialModel = {
  VALUE_SHARE: 'VALUE_SHARE',
  FIXED_PRICE: 'FIXED_PRICE',
  HYBRID: 'HYBRID',
  INTERNAL: 'INTERNAL',
} as const;

export type CommercialModel = (typeof CommercialModel)[keyof typeof CommercialModel];

export const COMMERCIAL_MODEL_OPTIONS = [
  { value: CommercialModel.VALUE_SHARE, label: 'Value Share' },
  { value: CommercialModel.FIXED_PRICE, label: 'Fixed Price' },
  { value: CommercialModel.HYBRID, label: 'Hybrid' },
  { value: CommercialModel.INTERNAL, label: 'Internal' },
] as const;

export const ProjectType = {
  BOOTCAMP: 'BOOTCAMP',
  PILOT: 'PILOT',
  USE_CASE_ROLLOUT: 'USE_CASE_ROLLOUT',
  INTERNAL: 'INTERNAL',
} as const;

export type ProjectType = (typeof ProjectType)[keyof typeof ProjectType];

export const PROJECT_TYPE_OPTIONS = [
  { value: ProjectType.BOOTCAMP, label: 'Bootcamp' },
  { value: ProjectType.PILOT, label: 'Pilot' },
  { value: ProjectType.USE_CASE_ROLLOUT, label: 'Use Case Rollout' },
  { value: ProjectType.INTERNAL, label: 'Internal' },
] as const;

export const TeamModel = {
  THREE_IN_BOX: 'THREE_IN_BOX',
  FLEXIBLE: 'FLEXIBLE',
} as const;

export type TeamModel = (typeof TeamModel)[keyof typeof TeamModel];

export const TEAM_MODEL_OPTIONS = [
  { value: TeamModel.THREE_IN_BOX, label: '3-in-the-Box' },
  { value: TeamModel.FLEXIBLE, label: 'Flexible' },
] as const;

// ============== PHASES ==============

export const PhaseType = {
  DISCOVERY: 'DISCOVERY',
  DESIGN: 'DESIGN',
  BUILD: 'BUILD',
  TEST: 'TEST',
  DEPLOY: 'DEPLOY',
  HYPERCARE: 'HYPERCARE',
  CUSTOM: 'CUSTOM',
  OPERATIONAL: 'OPERATIONAL',
} as const;

export type PhaseType = (typeof PhaseType)[keyof typeof PhaseType];

export const PHASE_TYPE_OPTIONS = [
  { value: PhaseType.DISCOVERY, label: 'Discovery' },
  { value: PhaseType.DESIGN, label: 'Design' },
  { value: PhaseType.BUILD, label: 'Build' },
  { value: PhaseType.TEST, label: 'Test' },
  { value: PhaseType.DEPLOY, label: 'Deploy' },
  { value: PhaseType.HYPERCARE, label: 'Hypercare' },
  { value: PhaseType.CUSTOM, label: 'Custom' },
  { value: PhaseType.OPERATIONAL, label: 'Operational' },
] as const;

export const PhaseStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
} as const;

export type PhaseStatus = (typeof PhaseStatus)[keyof typeof PhaseStatus];

export const PHASE_STATUS_OPTIONS = [
  { value: PhaseStatus.NOT_STARTED, label: 'Not Started' },
  { value: PhaseStatus.IN_PROGRESS, label: 'In Progress' },
  { value: PhaseStatus.COMPLETED, label: 'Completed' },
  { value: PhaseStatus.BLOCKED, label: 'Blocked' },
] as const;

// ============== TASKS ==============

export const TaskStatus = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  BLOCKED: 'BLOCKED',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TASK_STATUS_OPTIONS = [
  { value: TaskStatus.TODO, label: 'To Do' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TaskStatus.DONE, label: 'Done' },
  { value: TaskStatus.BLOCKED, label: 'Blocked' },
] as const;

export const TaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export const TASK_PRIORITY_OPTIONS = [
  { value: TaskPriority.LOW, label: 'Low' },
  { value: TaskPriority.MEDIUM, label: 'Medium' },
  { value: TaskPriority.HIGH, label: 'High' },
  { value: TaskPriority.CRITICAL, label: 'Critical' },
] as const;

// ============== ALLOCATIONS ==============

export const AllocationType = {
  BILLABLE: 'BILLABLE',
  NON_BILLABLE: 'NON_BILLABLE',
  INTERNAL: 'INTERNAL',
  BENCH: 'BENCH',
  LEAVE: 'LEAVE',
} as const;

export type AllocationType = (typeof AllocationType)[keyof typeof AllocationType];

export const ALLOCATION_TYPE_OPTIONS = [
  { value: AllocationType.BILLABLE, label: 'Billable' },
  { value: AllocationType.NON_BILLABLE, label: 'Non-Billable' },
  { value: AllocationType.INTERNAL, label: 'Internal' },
  { value: AllocationType.BENCH, label: 'Bench' },
  { value: AllocationType.LEAVE, label: 'Leave' },
] as const;

export const AllocationStatus = {
  TENTATIVE: 'TENTATIVE',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
} as const;

export type AllocationStatus = (typeof AllocationStatus)[keyof typeof AllocationStatus];

export const ALLOCATION_STATUS_OPTIONS = [
  { value: AllocationStatus.TENTATIVE, label: 'Tentative' },
  { value: AllocationStatus.CONFIRMED, label: 'Confirmed' },
  { value: AllocationStatus.COMPLETED, label: 'Completed' },
] as const;

// ============== TIME ENTRIES ==============

export const TimeEntryType = {
  BILLABLE: 'BILLABLE',
  NON_BILLABLE: 'NON_BILLABLE',
  INTERNAL: 'INTERNAL',
  BENCH: 'BENCH',
  LEAVE: 'LEAVE',
} as const;

export type TimeEntryType = (typeof TimeEntryType)[keyof typeof TimeEntryType];

export const TIME_ENTRY_TYPE_OPTIONS = [
  { value: TimeEntryType.BILLABLE, label: 'Billable' },
  { value: TimeEntryType.NON_BILLABLE, label: 'Non-Billable' },
  { value: TimeEntryType.INTERNAL, label: 'Internal' },
  { value: TimeEntryType.BENCH, label: 'Bench' },
  { value: TimeEntryType.LEAVE, label: 'Leave' },
] as const;

export const TimeEntryStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  LOCKED: 'LOCKED',
} as const;

export type TimeEntryStatus = (typeof TimeEntryStatus)[keyof typeof TimeEntryStatus];

export const TIME_ENTRY_STATUS_OPTIONS = [
  { value: TimeEntryStatus.DRAFT, label: 'Draft' },
  { value: TimeEntryStatus.SUBMITTED, label: 'Submitted' },
  { value: TimeEntryStatus.APPROVED, label: 'Approved' },
  { value: TimeEntryStatus.REJECTED, label: 'Rejected' },
  { value: TimeEntryStatus.LOCKED, label: 'Locked' },
] as const;

// ============== USERS ==============

export const UserRole = {
  PARTNER: 'PARTNER',
  OPS_LEAD: 'OPS_LEAD',
  PRACTICE_LEAD: 'PRACTICE_LEAD',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TEAM_MEMBER: 'TEAM_MEMBER',
  CONTRACTOR: 'CONTRACTOR',
  READ_ONLY: 'READ_ONLY',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const USER_ROLE_OPTIONS = [
  { value: UserRole.PARTNER, label: 'Partner' },
  { value: UserRole.OPS_LEAD, label: 'Operations Lead' },
  { value: UserRole.PRACTICE_LEAD, label: 'Practice Lead' },
  { value: UserRole.PROJECT_MANAGER, label: 'Project Manager' },
  { value: UserRole.TEAM_MEMBER, label: 'Team Member' },
  { value: UserRole.CONTRACTOR, label: 'Contractor' },
  { value: UserRole.READ_ONLY, label: 'Read Only' },
] as const;

// ============== PROJECT COLORS ==============

/**
 * Predefined color palette for projects
 * These colors are visually distinct and work well in schedule views
 */
export const PROJECT_COLORS = [
  { value: '#3B82F6', label: 'Blue', name: 'blue' },
  { value: '#8B5CF6', label: 'Purple', name: 'purple' },
  { value: '#EC4899', label: 'Pink', name: 'pink' },
  { value: '#10B981', label: 'Green', name: 'green' },
  { value: '#F59E0B', label: 'Orange', name: 'orange' },
  { value: '#EF4444', label: 'Red', name: 'red' },
  { value: '#14B8A6', label: 'Teal', name: 'teal' },
  { value: '#6366F1', label: 'Indigo', name: 'indigo' },
  { value: '#84CC16', label: 'Lime', name: 'lime' },
  { value: '#06B6D4', label: 'Cyan', name: 'cyan' },
] as const;

export const DEFAULT_PROJECT_COLOR = '#3B82F6'; // Blue

/**
 * Get the next available project color that's not already in use
 * @param usedColors Array of color values already in use
 * @returns A color value that's not in use, or the default color if all are used
 */
export function getNextAvailableProjectColor(usedColors: string[]): string {
  const availableColor = PROJECT_COLORS.find((color) => !usedColors.includes(color.value));
  return availableColor?.value ?? DEFAULT_PROJECT_COLOR;
}

/**
 * Get a lighter shade of a color for backgrounds
 * @param hexColor Hex color code (e.g., '#3B82F6')
 * @param opacity Opacity value between 0 and 1
 * @returns RGBA color string
 */
export function getColorWithOpacity(hexColor: string, opacity: number = 0.1): string {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// ============== HELPER FUNCTIONS ==============

/**
 * Get the label for a given enum value from an options array
 */
export function getOptionLabel<T extends { value: string; label: string }>(
  options: readonly T[],
  value: string
): string {
  const option = options.find((o) => o.value === value);
  return option?.label ?? value;
}

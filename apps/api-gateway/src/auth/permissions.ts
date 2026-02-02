export enum UserRole {
  PARTNER = 'PARTNER',
  OPS_LEAD = 'OPS_LEAD',
  PRACTICE_LEAD = 'PRACTICE_LEAD',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  TEAM_MEMBER = 'TEAM_MEMBER',
  CONTRACTOR = 'CONTRACTOR',
  READ_ONLY = 'READ_ONLY',
}

// Roles that can view cost data (confidential)
export const COST_VISIBLE_ROLES = [UserRole.PARTNER, UserRole.OPS_LEAD];

// Roles that can manage users
export const ADMIN_ROLES = [UserRole.PARTNER];

// Roles that can manage people, projects, etc.
export const MANAGEMENT_ROLES = [
  UserRole.PARTNER,
  UserRole.OPS_LEAD,
  UserRole.PRACTICE_LEAD,
];

// Roles that can edit allocations and project data
export const EDIT_ROLES = [
  UserRole.PARTNER,
  UserRole.OPS_LEAD,
  UserRole.PRACTICE_LEAD,
  UserRole.PROJECT_MANAGER,
];

// Roles that can approve timesheets
export const APPROVER_ROLES = [
  UserRole.PARTNER,
  UserRole.OPS_LEAD,
  UserRole.PRACTICE_LEAD,
  UserRole.PROJECT_MANAGER,
];

// Helper functions
export const canViewCosts = (role: string): boolean =>
  COST_VISIBLE_ROLES.includes(role as UserRole);

export const canManageUsers = (role: string): boolean =>
  ADMIN_ROLES.includes(role as UserRole);

export const canManagePeople = (role: string): boolean =>
  MANAGEMENT_ROLES.includes(role as UserRole);

export const canEditAllocations = (role: string): boolean =>
  EDIT_ROLES.includes(role as UserRole);

export const canApproveTimesheets = (role: string): boolean =>
  APPROVER_ROLES.includes(role as UserRole);

export const isReadOnly = (role: string): boolean =>
  role === UserRole.READ_ONLY || role === UserRole.CONTRACTOR;

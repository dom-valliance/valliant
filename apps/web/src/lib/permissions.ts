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

// Permission helper functions
export const canViewCosts = (role: string | undefined): boolean =>
  role ? COST_VISIBLE_ROLES.includes(role as UserRole) : false;

export const canManageUsers = (role: string | undefined): boolean =>
  role ? ADMIN_ROLES.includes(role as UserRole) : false;

export const canEditPeople = (role: string | undefined): boolean =>
  role ? MANAGEMENT_ROLES.includes(role as UserRole) : false;

export const canEditProjects = (role: string | undefined): boolean =>
  role ? EDIT_ROLES.includes(role as UserRole) : false;

export const canApproveTimesheets = (role: string | undefined): boolean =>
  role ? EDIT_ROLES.includes(role as UserRole) : false;

export const isReadOnly = (role: string | undefined): boolean =>
  role === UserRole.READ_ONLY || role === UserRole.CONTRACTOR;

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    PARTNER: 'Partner',
    OPS_LEAD: 'Operations Lead',
    PRACTICE_LEAD: 'Practice Lead',
    PROJECT_MANAGER: 'Project Manager',
    TEAM_MEMBER: 'Team Member',
    CONTRACTOR: 'Contractor',
    READ_ONLY: 'Read Only',
  };
  return labels[role] || role;
};

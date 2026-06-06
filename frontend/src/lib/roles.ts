import type { Role } from '@/types';

export const STAFF_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN', 'TEACHER'];
export const SIGNUP_ROLES: Role[] = ['TEACHER', 'ADMIN'];

export const formatRoleLabel = (role: Role) =>
  role
    .toLowerCase()
    .split('_')
    .map(part => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');

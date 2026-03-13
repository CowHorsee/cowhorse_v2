import type { UserRole } from '../api/authApi';
import { USER_ROLES } from '../constants';

export type ManagedUser = {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
};

export const managedUsers: ManagedUser[] = [
  {
    user_id: 'USR-001',
    name: 'Ashley Chan',
    email: 'ashley.chan@cowhorse.com',
    role: USER_ROLES.ADMIN,
  },
  {
    user_id: 'USR-002',
    name: 'Aina Sofea',
    email: 'aina.sofea@cowhorse.com',
    role: USER_ROLES.ADMIN,
  },
  {
    user_id: 'USR-003',
    name: 'Daniel Tan',
    email: 'daniel.tan@cowhorse.com',
    role: USER_ROLES.ADMIN,
  },
  {
    user_id: 'USR-004',
    name: 'Sara Lim',
    email: 'sara.lim@cowhorse.com',
    role: USER_ROLES.ADMIN,
  },
  {
    user_id: 'USR-005',
    name: 'Haziq Rahman',
    email: 'haziq.rahman@cowhorse.com',
    role: USER_ROLES.ADMIN,
  },
];

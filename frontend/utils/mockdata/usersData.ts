import type { UserRole } from '../api/authApi';

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
    role: 'ADMIN',
  },
  {
    user_id: 'USR-002',
    name: 'Aina Sofea',
    email: 'aina.sofea@cowhorse.com',
    role: 'EMPLOYEE',
  },
  {
    user_id: 'USR-003',
    name: 'Daniel Tan',
    email: 'daniel.tan@cowhorse.com',
    role: 'MANAGER',
  },
  {
    user_id: 'USR-004',
    name: 'Sara Lim',
    email: 'sara.lim@cowhorse.com',
    role: 'EMPLOYEE',
  },
  {
    user_id: 'USR-005',
    name: 'Haziq Rahman',
    email: 'haziq.rahman@cowhorse.com',
    role: 'WAREHOUSE',
  },
];

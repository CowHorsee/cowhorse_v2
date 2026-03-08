import type { UserRole } from '../authApi';

export type ManagedUser = {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
};

export const managedUsers: ManagedUser[] = [
  {
    user_id: 'USR-001',
    name: 'Janson',
    email: 'janson@cowhorse.com',
    role: 'EMPLOYEE',
  },
  {
    user_id: 'USR-002',
    name: 'Wallace',
    email: 'wallace@cowhorse.com',
    role: 'MANAGER',
  }
];

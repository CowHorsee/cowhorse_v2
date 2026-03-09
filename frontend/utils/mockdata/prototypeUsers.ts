import type { AuthUser } from '../api/authApi';

export type PrototypeUserCredential = AuthUser & {
  password: string;
};

export const prototypeUsers: PrototypeUserCredential[] = [
  {
    user_id: 'proto-admin-01',
    name: 'Ashley Chan',
    email: 'ashley.chan@cowhorse.dev',
    role: 'ADMIN',
    password: 'Demo@Admin123',
  },
  {
    user_id: 'proto-manager-01',
    name: 'Siti Nur Aina',
    email: 'siti.aina@cowhorse.dev',
    role: 'MANAGER',
    password: 'Demo@Manager123',
  },
  {
    user_id: 'proto-employee-01',
    name: 'Daniel Lee',
    email: 'daniel.lee@cowhorse.dev',
    role: 'EMPLOYEE',
    password: 'Demo@Employee123',
  },
  {
    user_id: 'proto-warehouse-01',
    name: 'Nurul Huda',
    email: 'nurul.huda@cowhorse.dev',
    role: 'WAREHOUSE',
    password: 'Demo@Warehouse123',
  },
];

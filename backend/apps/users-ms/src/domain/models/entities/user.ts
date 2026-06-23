export type UserRole = 'admin' | 'operator' | 'client';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  clientId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

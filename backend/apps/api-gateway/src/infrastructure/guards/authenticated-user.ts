import type { UserRole } from '../../domain/models/user-role';

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: UserRole;
  clientId?: string;
}

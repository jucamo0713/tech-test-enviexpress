export interface AuthSession {
  id: string;
  userId: string;
  refreshToken: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  clientId?: string;
}

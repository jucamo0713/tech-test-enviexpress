export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  clientId?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

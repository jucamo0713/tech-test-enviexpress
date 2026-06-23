import { Injectable, signal } from '@angular/core';
import { AuthResponse, AuthUser } from '../../domain/models/auth.model';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const AUTH_USER_KEY = 'authUser';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  readonly auth = signal<AuthResponse | null>(null);
  readonly user = signal<AuthUser | null>(this.readStoredUser());

  setAuth(auth: AuthResponse): void {
    this.auth.set(auth);
    this.user.set(auth.user);
    localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(auth.user));
  }

  updateUser(user: AuthUser): void {
    const currentAuth = this.auth();
    if (currentAuth) {
      this.auth.set({ ...currentAuth, user });
    }
    this.user.set(user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  clear(): void {
    this.auth.set(null);
    this.user.set(null);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }

  accessToken(): string | null {
    const token = this.auth()?.accessToken ?? localStorage.getItem(ACCESS_TOKEN_KEY);

    if (!token) return null;

    if (this.isJwtExpired(token)) {
      this.clear();
      return null;
    }

    return token;
  }

  refreshToken(): string | null {
    return this.auth()?.refreshToken ?? localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  hasSession(): boolean {
    return !!this.accessToken();
  }

  isAccessTokenExpired(): boolean {
    const token = this.auth()?.accessToken ?? localStorage.getItem(ACCESS_TOKEN_KEY);
    return !token || this.isJwtExpired(token);
  }

  private readStoredUser(): AuthUser | null {
    const rawUser = localStorage.getItem(AUTH_USER_KEY);
    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser) as AuthUser;
    } catch {
      localStorage.removeItem(AUTH_USER_KEY);
      return null;
    }
  }

  private isJwtExpired(token: string): boolean {
    const payload = this.decodeJwtPayload(token);
    if (!payload?.exp) return true;

    const expiresAt = payload.exp * 1000;
    return Date.now() >= expiresAt;
  }

  private decodeJwtPayload(token: string): { exp?: number } | null {
    const [, encodedPayload] = token.split('.');
    if (!encodedPayload) return null;

    try {
      const normalizedPayload = encodedPayload
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');

      return JSON.parse(atob(normalizedPayload)) as { exp?: number };
    } catch {
      return null;
    }
  }
}

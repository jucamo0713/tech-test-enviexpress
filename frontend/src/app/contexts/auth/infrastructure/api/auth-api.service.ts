import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../../core/config';
import { AuthResponse } from '../../domain/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.config.apiBaseUrl}/auth/login`, {
      email,
      password,
    });
  }

  refresh(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.config.apiBaseUrl}/auth/refresh`, {
      refreshToken,
    });
  }

  registerClient(
    trackingCode: string,
    email: string,
    password: string,
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.config.apiBaseUrl}/auth/register-client`,
      { trackingCode, email, password },
    );
  }
}

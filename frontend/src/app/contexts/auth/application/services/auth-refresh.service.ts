import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, share, tap, throwError } from 'rxjs';
import { AuthResponse } from '../../domain/models/auth.model';
import { AuthApiService } from '../../infrastructure/api/auth-api.service';
import { AuthSessionService } from './auth-session.service';

@Injectable({ providedIn: 'root' })
export class AuthRefreshService {
  private refreshInProgress$?: Observable<AuthResponse>;
  private readonly session = inject(AuthSessionService);
  private readonly router = inject(Router);

  refresh(): Observable<AuthResponse> {
    if (this.refreshInProgress$) {
      return this.refreshInProgress$;
    }

    const refreshToken = this.session.refreshToken();

    if (!refreshToken || this.session.isRefreshTokenExpired()) {
      this.session.clear();
      this.router.navigate(['/login']);
      return throwError(() => new Error('Refresh token expired or not found'));
    }

    // Use inject inside the method to avoid circular dependency at construction if necessary,
    // though here it might be fine.
    const api = inject(AuthApiService);

    this.refreshInProgress$ = api.refresh(refreshToken).pipe(
      tap((auth) => this.session.setAuth(auth)),
      catchError((err) => {
        this.session.clear();
        this.router.navigate(['/auth/login']);
        return throwError(() => err);
      }),
      finalize(() => {
        this.refreshInProgress$ = undefined;
      }),
      share(),
    );

    return this.refreshInProgress$;
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../../core/config';
import {
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserProfile,
} from '../../domain/models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.config.apiBaseUrl}/users/me`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(
      `${this.config.apiBaseUrl}/users/me`,
      request,
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(
      `${this.config.apiBaseUrl}/users/me/password`,
      request,
    );
  }
}

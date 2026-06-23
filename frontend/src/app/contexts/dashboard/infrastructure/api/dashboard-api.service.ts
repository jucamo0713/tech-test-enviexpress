import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../../core/config';
import {
  DashboardPeriod,
  PackageStatusStats,
} from '../../domain/models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  packageStatusStats(
    period: DashboardPeriod,
    date: string,
  ): Observable<PackageStatusStats> {
    const params = new URLSearchParams({ period, date });
    return this.http.get<PackageStatusStats>(
      `${this.config.apiBaseUrl}/dashboard/package-status-stats?${params.toString()}`,
    );
  }
}

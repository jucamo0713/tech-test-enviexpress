import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { APP_CONFIG } from '../../../../core/config';
import {
  CreatePackageRequest,
  PaginatedPackages,
  PackageListFilters,
  PackageItem,
  UpdatePackageRequest,
  UpdatePackageStatusRequest,
} from '../../domain/models/package.model';

type PackageListApiResponse = PaginatedPackages & {
  packages?: PackageItem[];
};

@Injectable({ providedIn: 'root' })
export class PackagesApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  list(page = 1, limit = 10, filters: PackageListFilters = {}): Observable<PaginatedPackages> {
    const params = this.buildListParams(page, limit, filters);
    return this.http.get<PackageListApiResponse>(
      `${this.config.apiBaseUrl}/packages?${params.toString()}`,
    ).pipe(map((response) => this.normalizePaginatedPackages(response)));
  }

  listMine(page = 1, limit = 10, filters: PackageListFilters = {}): Observable<PaginatedPackages> {
    const params = this.buildListParams(page, limit, filters);
    return this.http.get<PackageListApiResponse>(
      `${this.config.apiBaseUrl}/packages/my?${params.toString()}`,
    ).pipe(map((response) => this.normalizePaginatedPackages(response)));
  }

  create(request: CreatePackageRequest): Observable<PackageItem> {
    return this.http.post<PackageItem>(`${this.config.apiBaseUrl}/packages`, request);
  }

  updateStatus(id: string, request: UpdatePackageStatusRequest): Observable<PackageItem> {
    return this.http.patch<PackageItem>(
      `${this.config.apiBaseUrl}/packages/${id}/status`,
      request,
    );
  }

  update(id: string, request: UpdatePackageRequest): Observable<PackageItem> {
    return this.http.patch<PackageItem>(
      `${this.config.apiBaseUrl}/packages/${id}`,
      request,
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.config.apiBaseUrl}/packages/${id}`);
  }

  publicStatus(trackingCode: string, email: string): Observable<PackageItem> {
    const params = new URLSearchParams({ trackingCode, email });
    return this.http.get<PackageItem>(
      `${this.config.apiBaseUrl}/packages/track?${params.toString()}`,
    );
  }

  statusStreamUrl(id: string, accessToken: string): string {
    return `${this.config.apiBaseUrl}/packages/${id}/status-stream?accessToken=${accessToken}`;
  }

  publicStatusStreamUrl(trackingCode: string, email: string): string {
    const params = new URLSearchParams({ trackingCode, email });
    return `${this.config.apiBaseUrl}/packages/track/status-stream?${params.toString()}`;
  }

  private buildListParams(
    page: number,
    limit: number,
    filters: PackageListFilters,
  ): URLSearchParams {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (filters.status) params.set('status', filters.status);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);

    return params;
  }

  private normalizePaginatedPackages(response: PackageListApiResponse): PaginatedPackages {
    const items = response.items ?? response.packages ?? [];

    return {
      items,
      page: response.page ?? 1,
      limit: response.limit ?? items.length,
      total: response.total ?? items.length,
      totalPages: response.totalPages ?? 1,
    };
  }
}

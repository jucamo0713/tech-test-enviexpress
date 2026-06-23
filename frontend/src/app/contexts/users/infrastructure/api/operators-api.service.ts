import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../../core/config';
import {
  CreateOperatorRequest,
  OperatorUser,
  PaginatedOperators,
} from '../../domain/models/operator.model';

@Injectable({ providedIn: 'root' })
export class OperatorsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  list(page = 1, limit = 10): Observable<PaginatedOperators> {
    return this.http.get<PaginatedOperators>(
      `${this.config.apiBaseUrl}/users/operators?page=${page}&limit=${limit}`,
    );
  }

  create(request: CreateOperatorRequest): Observable<OperatorUser> {
    return this.http.post<OperatorUser>(
      `${this.config.apiBaseUrl}/users/operators`,
      request,
    );
  }

  revokeAccess(id: string): Observable<OperatorUser> {
    return this.http.patch<OperatorUser>(
      `${this.config.apiBaseUrl}/users/operators/${id}/revoke`,
      {},
    );
  }
}

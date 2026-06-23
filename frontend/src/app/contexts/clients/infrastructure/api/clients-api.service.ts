import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs';
import { APP_CONFIG } from '../../../../core/config';
import {
  Client,
  ClientRegistrationStats,
  CreateClientRequest,
  PaginatedClients,
} from '../../domain/models/client.model';

type ClientListApiResponse = PaginatedClients & { clients?: Client[] };

@Injectable({ providedIn: 'root' })
export class ClientsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  list(page = 1, limit = 10): Observable<PaginatedClients> {
    return this.http.get<ClientListApiResponse>(
      `${this.config.apiBaseUrl}/clients?page=${page}&limit=${limit}`,
    ).pipe(map((response) => this.normalizePaginatedClients(response)));
  }

  create(request: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(`${this.config.apiBaseUrl}/clients`, request);
  }

  registrationStats(): Observable<ClientRegistrationStats> {
    return this.http.get<ClientRegistrationStats>(
      `${this.config.apiBaseUrl}/clients/registration-stats`,
    );
  }

  getByEmail(email: string): Observable<Client> {
    const params = new URLSearchParams({ email });
    return this.http.get<Client>(
      `${this.config.apiBaseUrl}/clients/by-email?${params.toString()}`,
    );
  }

  private normalizePaginatedClients(response: ClientListApiResponse): PaginatedClients {
    const items = response.items ?? response.clients ?? [];

    return {
      items,
      page: response.page ?? 1,
      limit: response.limit ?? items.length,
      total: response.total ?? items.length,
      totalPages: response.totalPages ?? 1,
      registrationStats: response.registrationStats,
    };
  }
}

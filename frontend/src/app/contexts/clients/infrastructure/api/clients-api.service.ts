import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../../../core/config';
import { Client, CreateClientRequest } from '../../domain/models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientsApiService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);

  list(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.config.apiBaseUrl}/clients`);
  }

  create(request: CreateClientRequest): Observable<Client> {
    return this.http.post<Client>(`${this.config.apiBaseUrl}/clients`, request);
  }
}

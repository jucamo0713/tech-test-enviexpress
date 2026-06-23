import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../../auth/application/services/auth-session.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { Client, ClientRegistrationStats } from '../../domain/models/client.model';
import { ClientsApiService } from '../../infrastructure/api/clients-api.service';

@Component({
  selector: 'app-clients-list-page',
  imports: [CommonModule, NavbarComponent],
  templateUrl: './clients-list-page.component.html',
  styleUrl: './clients-list-page.component.css',
})
export class ClientsListPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(AuthSessionService);
  private readonly clientsApi = inject(ClientsApiService);

  readonly clients = signal<Client[]>([]);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly registrationStats = signal<ClientRegistrationStats | undefined>(undefined);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const user = this.session.user();
    if (!this.session.hasSession()) {
      void this.router.navigateByUrl('/login');
      return;
    }
    if (user?.role !== 'admin') {
      void this.router.navigateByUrl(
        user?.role === 'client' ? '/client/packages' : '/operations',
      );
      return;
    }

    this.loadClients();
  }

  previousPage(): void {
    if (this.page() <= 1) return;
    this.page.update((page) => page - 1);
    this.loadClients();
  }

  nextPage(): void {
    if (this.page() >= this.totalPages()) return;
    this.page.update((page) => page + 1);
    this.loadClients();
  }

  private loadClients(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.clientsApi.list(this.page(), this.limit()).subscribe({
      next: (response) => {
        this.clients.set(response.items);
        this.page.set(response.page);
        this.limit.set(response.limit);
        this.total.set(response.total);
        this.totalPages.set(Math.max(response.totalPages, 1));
        this.registrationStats.set(response.registrationStats);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el listado de clientes');
        this.isLoading.set(false);
      },
    });
  }
}

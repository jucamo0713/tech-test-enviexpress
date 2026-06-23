import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../../../auth/infrastructure/api/auth-api.service';
import { AuthSessionService } from '../../../auth/application/services/auth-session.service';
import { Client, CreateClientRequest } from '../../../clients/domain/models/client.model';
import { ClientsApiService } from '../../../clients/infrastructure/api/clients-api.service';
import { ClientsPanelComponent } from '../../../clients/presentation/components/clients-panel.component';
import {
  CreatePackageRequest,
  PackageItem,
  UpdatePackageStatusRequest,
} from '../../domain/models/package.model';
import { PackagesApiService } from '../../infrastructure/api/packages-api.service';
import { PackageStatusPanelComponent } from '../components/package-status-panel.component';
import { PackagesPanelComponent } from '../components/packages-panel.component';

@Component({
  selector: 'app-operations-dashboard-page',
  imports: [
    CommonModule,
    ClientsPanelComponent,
    PackagesPanelComponent,
    PackageStatusPanelComponent,
  ],
  templateUrl: './operations-dashboard-page.component.html',
  styleUrl: './operations-dashboard-page.component.css',
})
export class OperationsDashboardPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly session = inject(AuthSessionService);
  private readonly authApi = inject(AuthApiService);
  private readonly clientsApi = inject(ClientsApiService);
  private readonly packagesApi = inject(PackagesApiService);
  private eventSource?: EventSource;

  readonly user = this.session.user;
  clients: Client[] = [];
  packages: PackageItem[] = [];
  selectedPackage?: PackageItem;
  streamMessage = 'Sin conexion SSE';

  ngOnInit(): void {
    if (!this.session.hasSession()) {
      void this.router.navigateByUrl('/login');
      return;
    }

    if (this.user()?.role === 'client') {
      void this.router.navigateByUrl('/client/packages');
      return;
    }

    this.loadAll();
  }

  ngOnDestroy(): void {
    this.eventSource?.close();
  }

  refresh(): void {
    const refreshToken = this.session.refreshToken();
    if (!refreshToken) return;
    this.authApi.refresh(refreshToken).subscribe((auth) => this.session.setAuth(auth));
  }

  logout(): void {
    this.session.clear();
    this.eventSource?.close();
    void this.router.navigateByUrl('/');
  }

  createClient(request: CreateClientRequest): void {
    this.clientsApi.create(request).subscribe((client) => {
      this.clients = [client, ...this.clients];
    });
  }

  createPackage(request: CreatePackageRequest): void {
    this.packagesApi.create(request).subscribe((item) => {
      this.packages = [item, ...this.packages];
    });
  }

  openPackage(packageItem: PackageItem): void {
    const accessToken = this.session.accessToken();
    if (!accessToken) return;

    this.selectedPackage = packageItem;
    this.eventSource?.close();
    this.eventSource = new EventSource(
      this.packagesApi.statusStreamUrl(packageItem.id, accessToken),
    );
    this.eventSource.addEventListener('package-status', (event) => {
      this.streamMessage = event.data;
    });
    this.eventSource.onerror = () => {
      this.streamMessage = 'Reconectando SSE...';
    };
  }

  updateStatus(request: UpdatePackageStatusRequest): void {
    if (!this.selectedPackage) return;

    this.packagesApi.updateStatus(this.selectedPackage.id, request).subscribe((updated) => {
      this.packages = this.packages.map((item) => item.id === updated.id ? updated : item);
      this.selectedPackage = updated;
    });
  }

  private loadAll(): void {
    this.clientsApi.list().subscribe((clients) => this.clients = clients);
    this.packagesApi.list().subscribe((response) => this.packages = response.items);
  }
}

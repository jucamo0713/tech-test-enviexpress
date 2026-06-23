import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../../../auth/infrastructure/api/auth-api.service';
import { AuthSessionService } from '../../../auth/application/services/auth-session.service';
import {
  CreatePackageRequest,
  PackageListFilters,
  PackageItem,
  UpdatePackageRequest,
  UpdatePackageStatusRequest,
} from '../../domain/models/package.model';
import { PackagesApiService } from '../../infrastructure/api/packages-api.service';
import { PackageStatusPanelComponent } from '../components/package-status-panel.component';
import { PackagesPanelComponent } from '../components/packages-panel.component';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-operations-dashboard-page',
  imports: [
    CommonModule,
    PackagesPanelComponent,
    PackageStatusPanelComponent,
    NavbarComponent,
  ],
  templateUrl: './operations-dashboard-page.component.html',
  styleUrl: './operations-dashboard-page.component.css',
})
export class OperationsDashboardPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly session = inject(AuthSessionService);
  private readonly authApi = inject(AuthApiService);
  private readonly packagesApi = inject(PackagesApiService);
  private eventSource?: EventSource;

  readonly user = this.session.user;
  readonly roleNames: Record<string, string> = {
    admin: 'Administrador',
    operator: 'Operador',
    client: 'Cliente',
  };
  readonly packages = signal<PackageItem[]>([]);
  readonly selectedPackage = signal<PackageItem | undefined>(undefined);
  readonly streamMessage = signal('Sin conexión SSE');
  readonly filters = signal<PackageListFilters>({});

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

  createPackage(request: CreatePackageRequest): void {
    this.packagesApi.create(request).subscribe((item) => {
      this.packages.update((packages) => [item, ...packages]);
    });
  }

  updatePackage(event: { id: string; request: UpdatePackageRequest }): void {
    this.packagesApi.update(event.id, event.request).subscribe((updated) => {
      this.packages.update((packages) =>
        packages.map((item) => item.id === updated.id ? updated : item),
      );
      if (this.selectedPackage()?.id === updated.id) {
        this.selectedPackage.set(updated);
      }
    });
  }

  deletePackage(id: string): void {
    this.packagesApi.delete(id).subscribe(() => {
      this.packages.update((packages) => packages.filter((item) => item.id !== id));
      if (this.selectedPackage()?.id === id) {
        this.selectedPackage.set(undefined);
        this.eventSource?.close();
      }
    });
  }

  applyFilters(filters: PackageListFilters): void {
    this.filters.set(filters);
    this.loadAll();
  }

  openPackage(packageItem: PackageItem): void {
    const accessToken = this.session.accessToken();
    if (!accessToken) return;

    this.selectedPackage.set(packageItem);
    this.eventSource?.close();
    this.eventSource = new EventSource(
      this.packagesApi.statusStreamUrl(packageItem.id, accessToken),
    );
    this.eventSource.addEventListener('package-status', (event) => {
      const payload = JSON.parse(event.data) as { package: Partial<PackageItem>; heartbeat: string };
      this.selectedPackage.update((current) => current ? { ...current, ...payload.package } : current);
      this.packages.update((packages) =>
        packages.map((item) =>
          item.id === payload.package.id ? { ...item, ...payload.package } : item,
        ),
      );
      this.streamMessage.set(`Actualizado ${this.formatDateTime(payload.heartbeat)}`);
    });
    this.eventSource.onerror = () => {
      this.streamMessage.set('Reconectando SSE...');
    };
  }

  closePackage(): void {
    this.selectedPackage.set(undefined);
    this.eventSource?.close();
  }

  updateStatus(request: UpdatePackageStatusRequest): void {
    const currentPackage = this.selectedPackage();
    if (!currentPackage) return;

    this.packagesApi.updateStatus(currentPackage.id, request).subscribe((updated) => {
      this.packages.update((packages) =>
        packages.map((item) => item.id === updated.id ? updated : item),
      );
      this.selectedPackage.set(updated);
    });
  }

  private loadAll(): void {
    this.packagesApi.list(1, 10, this.filters()).subscribe((response) => this.packages.set(response.items));
  }

  private formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  isAdmin(): boolean {
    return this.user()?.role === 'admin';
  }

  canCreatePackages(): boolean {
    return ['admin', 'operator'].includes(this.user()?.role ?? '');
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthSessionService } from '../../../auth/application/services/auth-session.service';
import { PackageItem } from '../../domain/models/package.model';
import { PackagesApiService } from '../../infrastructure/api/packages-api.service';

@Component({
  selector: 'app-client-packages-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './client-packages-page.component.html',
  styleUrl: './client-packages-page.component.css',
})
export class ClientPackagesPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(AuthSessionService);
  private readonly packagesApi = inject(PackagesApiService);

  readonly user = this.session.user;
  readonly packages = signal<PackageItem[]>([]);
  readonly errorMessage = signal('');
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly totalPages = signal(1);
  readonly total = signal(0);
  readonly isLoading = signal(false);
  readonly hasLoaded = signal(false);

  ngOnInit(): void {
    if (this.user()?.role !== 'client') {
      void this.router.navigateByUrl('/operations');
      return;
    }

    this.loadPackages();
  }

  previousPage(): void {
    if (this.page() <= 1) return;
    this.page.update((page) => page - 1);
    this.loadPackages();
  }

  nextPage(): void {
    if (this.page() >= this.totalPages()) return;
    this.page.update((page) => page + 1);
    this.loadPackages();
  }

  private loadPackages(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.packagesApi.listMine(this.page(), this.limit()).subscribe({
      next: (response) => {
        this.packages.set(response.items);
        this.page.set(response.page);
        this.limit.set(response.limit);
        this.total.set(response.total);
        this.totalPages.set(Math.max(response.totalPages, 1));
        this.hasLoaded.set(true);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el historial');
        this.hasLoaded.set(true);
        this.isLoading.set(false);
      },
    });
  }

  logout(): void {
    this.session.clear();
    void this.router.navigateByUrl('/');
  }
}

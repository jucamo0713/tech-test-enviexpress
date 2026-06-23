import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSessionService } from '../../../auth/application/services/auth-session.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { PackageItem, PackageListFilters, PACKAGE_STATUS_NAMES } from '../../domain/models/package.model';
import { PackagesApiService } from '../../infrastructure/api/packages-api.service';

@Component({
  selector: 'app-client-packages-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './client-packages-page.component.html',
  styleUrl: './client-packages-page.component.css',
})
export class ClientPackagesPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
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
  readonly filters = signal<PackageListFilters>({});
  readonly statusNames = PACKAGE_STATUS_NAMES;
  readonly statusOptions = [
    'created',
    'received',
    'in_transit',
    'failed_delivery',
    'delivered',
    'returned',
    'cancelled',
  ];

  readonly filtersForm = this.fb.nonNullable.group({
    status: [''],
    startDate: [''],
    endDate: [''],
  });

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

  applyFilters(): void {
    this.filters.set(this.normalizedFilters());
    this.page.set(1);
    this.loadPackages();
  }

  clearFilters(): void {
    this.filtersForm.reset();
    this.filters.set({});
    this.page.set(1);
    this.loadPackages();
  }

  copyToClipboard(text: string): void {
    void navigator.clipboard.writeText(text);
  }

  private loadPackages(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.packagesApi.listMine(this.page(), this.limit(), this.filters()).subscribe({
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

  private normalizedFilters(): PackageListFilters {
    const filters = this.filtersForm.getRawValue();

    return {
      status: filters.status || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    };
  }
}

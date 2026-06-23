import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { OperatorUser } from '../../domain/models/operator.model';
import { OperatorsApiService } from '../../infrastructure/api/operators-api.service';
import { PACKAGE_STATUS_NAMES } from '../../../packages/domain/models/package.model';

@Component({
  selector: 'app-operator-detail-page',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './operator-detail-page.component.html',
  styleUrl: './operator-detail-page.component.css',
})
export class OperatorDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly operatorsApi = inject(OperatorsApiService);

  readonly operator = signal<OperatorUser | null>(null);
  readonly history = signal<any[]>([]);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly isLoading = signal(true);
  readonly isLoadingHistory = signal(false);
  readonly errorMessage = signal('');

  readonly statusNames = PACKAGE_STATUS_NAMES;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      void this.router.navigateByUrl('/operators');
      return;
    }

    this.loadOperator(id);
    this.loadHistory(id);
  }

  loadOperator(id: string): void {
    this.operatorsApi.getById(id).subscribe({
      next: (operator) => {
        this.operator.set(operator);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la información del operador');
        this.isLoading.set(false);
      },
    });
  }

  loadHistory(id: string): void {
    this.isLoadingHistory.set(true);
    this.operatorsApi.getHistory(id, this.page(), this.limit()).subscribe({
      next: (response) => {
        this.history.set(response.items);
        this.total.set(response.total);
        this.totalPages.set(response.totalPages);
        this.isLoadingHistory.set(false);
      },
      error: () => {
        this.isLoadingHistory.set(false);
      },
    });
  }

  previousPage(): void {
    if (this.page() <= 1) return;
    this.page.update((p) => p - 1);
    const id = this.operator()?.id;
    if (id) this.loadHistory(id);
  }

  nextPage(): void {
    if (this.page() >= this.totalPages()) return;
    this.page.update((p) => p + 1);
    const id = this.operator()?.id;
    if (id) this.loadHistory(id);
  }

  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }
}

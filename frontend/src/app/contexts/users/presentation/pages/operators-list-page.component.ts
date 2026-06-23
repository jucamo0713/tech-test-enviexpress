import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSessionService } from '../../../auth/application/services/auth-session.service';
import { OperatorUser } from '../../domain/models/operator.model';
import { OperatorsApiService } from '../../infrastructure/api/operators-api.service';

@Component({
  selector: 'app-operators-list-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './operators-list-page.component.html',
  styleUrl: './operators-list-page.component.css',
})
export class OperatorsListPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(AuthSessionService);
  private readonly operatorsApi = inject(OperatorsApiService);
  private readonly fb = inject(FormBuilder);

  readonly operators = signal<OperatorUser[]>([]);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly isLoading = signal(false);
  readonly isCreating = signal(false);
  readonly errorMessage = signal('');
  readonly operatorPendingRevoke = signal<OperatorUser | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

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

    this.loadOperators();
  }

  createOperator(): void {
    if (this.form.invalid || this.isCreating()) {
      this.form.markAllAsTouched();
      return;
    }

    this.isCreating.set(true);
    this.errorMessage.set('');
    this.operatorsApi.create(this.form.getRawValue()).subscribe({
      next: (operator) => {
        this.operators.update((operators) => [operator, ...operators]);
        this.total.update((total) => total + 1);
        this.form.reset();
        this.isCreating.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo crear el operador');
        this.isCreating.set(false);
      },
    });
  }

  revokeAccess(operator: OperatorUser): void {
    this.operatorPendingRevoke.set(operator);
  }

  cancelRevoke(): void {
    this.operatorPendingRevoke.set(null);
  }

  confirmRevoke(): void {
    const operator = this.operatorPendingRevoke();
    if (!operator) return;
    if (!operator.active) return;

    this.operatorsApi.revokeAccess(operator.id).subscribe({
      next: (updated) => {
        this.operators.update((operators) =>
          operators.map((item) => item.id === updated.id ? updated : item),
        );
        this.cancelRevoke();
      },
      error: () => this.errorMessage.set('No se pudo revocar el acceso'),
    });
  }

  previousPage(): void {
    if (this.page() <= 1) return;
    this.page.update((page) => page - 1);
    this.loadOperators();
  }

  nextPage(): void {
    if (this.page() >= this.totalPages()) return;
    this.page.update((page) => page + 1);
    this.loadOperators();
  }

  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  private loadOperators(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.operatorsApi.list(this.page(), this.limit()).subscribe({
      next: (response) => {
        this.operators.set(response.items);
        this.page.set(response.page);
        this.limit.set(response.limit);
        this.total.set(response.total);
        this.totalPages.set(Math.max(response.totalPages, 1));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el listado de operadores');
        this.isLoading.set(false);
      },
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSessionService } from '../../../auth/application/services/auth-session.service';
import {
  DashboardPeriod,
  PackageStatusStatItem,
  PackageStatusStats,
} from '../../domain/models/dashboard.model';
import { DashboardApiService } from '../../infrastructure/api/dashboard-api.service';

const STATUS_COLORS: Record<string, string> = {
  created: '#2563eb',
  received: '#0f766e',
  in_transit: '#f59e0b',
  failed_delivery: '#dc2626',
  delivered: '#16a34a',
  returned: '#7c3aed',
  cancelled: '#64748b',
};

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-dashboard-page.component.html',
  styleUrl: './admin-dashboard-page.component.css',
})
export class AdminDashboardPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(AuthSessionService);
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly fb = inject(FormBuilder);

  readonly stats = signal<PackageStatusStats | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly periods: DashboardPeriod[] = ['day', 'week', 'month', 'year'];
  readonly form = this.fb.nonNullable.group({
    period: ['day' as DashboardPeriod],
    date: [new Date().toISOString().slice(0, 10)],
  });

  readonly slices = computed(() => {
    const stats = this.stats();
    if (!stats?.total) return [];

    let accumulated = 0;
    return stats.items
      .filter((item) => item.total > 0)
      .map((item) => {
        const start = accumulated / stats.total;
        accumulated += item.total;
        const end = accumulated / stats.total;

        return {
          ...item,
          color: this.colorFor(item.status),
          path: this.describeArc(50, 50, 38, start * 360, end * 360),
          percentage: Math.round((item.total / stats.total) * 100),
        };
      });
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

    this.loadStats();
  }

  loadStats(): void {
    const filters = this.form.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.dashboardApi.packageStatusStats(filters.period, filters.date).subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el dashboard');
        this.isLoading.set(false);
      },
    });
  }

  colorFor(status: string): string {
    return STATUS_COLORS[status] ?? '#334155';
  }

  percentageFor(item: PackageStatusStatItem): number {
    const total = this.stats()?.total ?? 0;
    return total ? Math.round((item.total / total) * 100) : 0;
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
    }).format(new Date(value));
  }

  private describeArc(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
  ): string {
    if (endAngle - startAngle >= 360) {
      return [
        `M ${centerX} ${centerY - radius}`,
        `A ${radius} ${radius} 0 1 1 ${centerX - 0.01} ${centerY - radius}`,
        `A ${radius} ${radius} 0 1 1 ${centerX} ${centerY - radius}`,
      ].join(' ');
    }

    const start = this.polarToCartesian(centerX, centerY, radius, endAngle);
    const end = this.polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return [
      `M ${centerX} ${centerY}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      'Z',
    ].join(' ');
  }

  private polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number,
  ) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AuthSessionService } from '../../../auth/application/services/auth-session.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import {
  DashboardPeriod,
  PackageStatusStatItem,
  PackageStatusStats,
} from '../../domain/models/dashboard.model';
import { DashboardApiService } from '../../infrastructure/api/dashboard-api.service';
import { PACKAGE_STATUS_NAMES } from '../../packages/domain/models/package.model';

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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    BaseChartDirective,
    NavbarComponent,
  ],
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
  readonly periodNames: Record<string, string> = {
    day: 'Hoy',
    week: 'Semana',
    month: 'Mes',
    year: 'Año',
  };
  readonly statusNames = PACKAGE_STATUS_NAMES;
  readonly form = this.fb.nonNullable.group({
    period: ['day' as DashboardPeriod],
    date: [new Date().toISOString().slice(0, 10)],
  });

  readonly chartData = computed<ChartData<'doughnut'>>(() => {
    const stats = this.stats();
    const items = stats?.items.filter((item) => item.total > 0) ?? [];

    return {
      labels: items.map((item) => this.statusNames[item.status] || item.status),
      datasets: [
        {
          data: items.map((item) => item.total),
          backgroundColor: items.map((item) => this.colorFor(item.status)),
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    };
  });

  readonly chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || 'estado';
            const value = Number(context.parsed || 0);
            const total = this.stats()?.total ?? 0;
            const percentage = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

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

}

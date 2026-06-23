import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PackageItem } from '../../domain/models/package.model';
import { PackagesApiService } from '../../infrastructure/api/packages-api.service';

@Component({
  selector: 'app-public-tracking-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './public-tracking-page.component.html',
  styleUrl: './public-tracking-page.component.css',
})
export class PublicTrackingPageComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly packagesApi = inject(PackagesApiService);
  private eventSource?: EventSource;

  readonly packageStatus = signal<PackageItem | undefined>(undefined);
  readonly streamMessage = signal('');
  readonly errorMessage = signal('');
  readonly isTracking = signal(false);

  readonly form = this.fb.nonNullable.group({
    trackingCode: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnDestroy(): void {
    this.eventSource?.close();
  }

  track(): void {
    this.errorMessage.set('');
    this.streamMessage.set('Conectando...');
    this.packageStatus.set(undefined);
    this.isTracking.set(true);
    this.eventSource?.close();
    const { trackingCode, email } = this.form.getRawValue();

    this.packagesApi.publicStatus(trackingCode, email).subscribe({
      next: (packageStatus) => {
        this.packageStatus.set(packageStatus);
        this.streamMessage.set(`Actualizado ${this.formatDateTime(new Date().toISOString())}`);
        this.openStatusStream(trackingCode, email);
        this.isTracking.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo validar la guia con ese correo');
        this.streamMessage.set('');
        this.isTracking.set(false);
      },
    });
  }

  private openStatusStream(trackingCode: string, email: string): void {
    this.eventSource = new EventSource(
      this.packagesApi.publicStatusStreamUrl(trackingCode, email),
    );

    this.eventSource.addEventListener('package-status', (event) => {
      const payload = JSON.parse(event.data) as { package: PackageItem; heartbeat: string };
      this.packageStatus.set(payload.package);
      this.streamMessage.set(`Actualizado ${this.formatDateTime(payload.heartbeat)}`);
      this.errorMessage.set('');
    });

    this.eventSource.onerror = () => {
      this.errorMessage.set(
        this.packageStatus()
          ? 'Reconectando el seguimiento...'
          : 'No se pudo validar la guia con ese correo',
      );
    };
  }

  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }
}

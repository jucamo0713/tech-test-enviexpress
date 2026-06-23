import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, inject } from '@angular/core';
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
  private readonly zone = inject(NgZone);
  private eventSource?: EventSource;

  packageStatus?: PackageItem;
  streamMessage = '';
  errorMessage = '';
  isTracking = false;

  readonly form = this.fb.nonNullable.group({
    trackingCode: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnDestroy(): void {
    this.eventSource?.close();
  }

  track(): void {
    this.errorMessage = '';
    this.streamMessage = 'Conectando...';
    this.packageStatus = undefined;
    this.isTracking = true;
    this.eventSource?.close();
    const { trackingCode, email } = this.form.getRawValue();

    this.packagesApi.publicStatus(trackingCode, email).subscribe({
      next: (packageStatus) => {
        this.packageStatus = packageStatus;
        this.streamMessage = `Actualizado ${this.formatDateTime(new Date().toISOString())}`;
        this.openStatusStream(trackingCode, email);
        this.isTracking = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo validar la guia con ese correo';
        this.streamMessage = '';
        this.isTracking = false;
      },
    });
  }

  private openStatusStream(trackingCode: string, email: string): void {
    this.eventSource = new EventSource(
      this.packagesApi.publicStatusStreamUrl(trackingCode, email),
    );

    this.eventSource.addEventListener('package-status', (event) => {
      this.zone.run(() => {
        const payload = JSON.parse(event.data) as { package: PackageItem; heartbeat: string };
        this.packageStatus = payload.package;
        this.streamMessage = `Actualizado ${this.formatDateTime(payload.heartbeat)}`;
        this.errorMessage = '';
      });
    });

    this.eventSource.onerror = () => {
      this.zone.run(() => {
        this.errorMessage = this.packageStatus
          ? 'Reconectando el seguimiento...'
          : 'No se pudo validar la guia con ese correo';
      });
    };
  }

  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }
}

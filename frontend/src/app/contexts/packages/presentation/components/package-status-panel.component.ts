import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  PackageItem,
  UpdatePackageStatusRequest,
} from '../../domain/models/package.model';

@Component({
  selector: 'app-package-status-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './package-status-panel.component.html',
  styleUrl: './package-status-panel.component.css',
})
export class PackageStatusPanelComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() selectedPackage?: PackageItem;
  @Input({ required: true }) streamMessage = 'Sin conexion SSE';
  @Output() updateStatus = new EventEmitter<UpdatePackageStatusRequest>();

  private readonly transitions: Record<string, string[]> = {
    created: ['received', 'cancelled'],
    received: ['in_transit', 'cancelled'],
    in_transit: ['received', 'delivered', 'failed_delivery'],
    failed_delivery: ['in_transit', 'returned'],
    delivered: [],
    returned: [],
    cancelled: [],
  };

  readonly form = this.fb.nonNullable.group({
    status: ['received', [Validators.required]],
    comment: [''],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['selectedPackage']) return;
    const [nextStatus] = this.validStatuses();
    if (nextStatus) {
      this.form.patchValue({ status: nextStatus, comment: '' });
    }
  }

  submit(): void {
    this.updateStatus.emit(this.form.getRawValue());
  }

  validStatuses(): string[] {
    return this.selectedPackage
      ? this.transitions[this.selectedPackage.status] ?? []
      : [];
  }

  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }
}

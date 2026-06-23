import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
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
export class PackageStatusPanelComponent {
  private readonly fb = inject(FormBuilder);

  @Input() selectedPackage?: PackageItem;
  @Input({ required: true }) streamMessage = 'Sin conexion SSE';
  @Output() updateStatus = new EventEmitter<UpdatePackageStatusRequest>();

  readonly statuses = [
    'received',
    'in_transit',
    'failed_delivery',
    'delivered',
    'returned',
    'cancelled',
  ];

  readonly form = this.fb.nonNullable.group({
    status: ['received', [Validators.required]],
    comment: [''],
  });

  submit(): void {
    this.updateStatus.emit(this.form.getRawValue());
  }
}

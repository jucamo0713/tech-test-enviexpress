import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../../clients/domain/models/client.model';
import {
  CreatePackageRequest,
  PackageItem,
} from '../../domain/models/package.model';

@Component({
  selector: 'app-packages-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './packages-panel.component.html',
  styleUrl: './packages-panel.component.css',
})
export class PackagesPanelComponent {
  private readonly fb = inject(FormBuilder);

  @Input({ required: true }) clients: Client[] = [];
  @Input({ required: true }) packages: PackageItem[] = [];
  @Output() createPackage = new EventEmitter<CreatePackageRequest>();
  @Output() selectPackage = new EventEmitter<PackageItem>();

  readonly form = this.fb.nonNullable.group({
    clientId: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(3)]],
    destinationAddress: ['', [Validators.required, Validators.minLength(5)]],
  });

  setClient(clientId: string): void {
    this.form.patchValue({ clientId });
  }

  submit(): void {
    this.createPackage.emit(this.form.getRawValue());
    this.form.reset();
  }
}

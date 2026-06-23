import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../../clients/domain/models/client.model';
import { ClientsApiService } from '../../../clients/infrastructure/api/clients-api.service';
import {
  CreatePackageRequest,
  PackageListFilters,
  PackageItem,
  UpdatePackageRequest,
} from '../../domain/models/package.model';

@Component({
  selector: 'app-packages-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './packages-panel.component.html',
  styleUrl: './packages-panel.component.css',
})
export class PackagesPanelComponent {
  private readonly fb = inject(FormBuilder);
  private readonly clientsApi = inject(ClientsApiService);

  @Input({ required: true }) packages: PackageItem[] = [];
  @Input() isAdmin = false;
  @Input() canCreate = false;
  @Output() createPackage = new EventEmitter<CreatePackageRequest>();
  @Output() selectPackage = new EventEmitter<PackageItem>();
  @Output() filtersChange = new EventEmitter<PackageListFilters>();
  @Output() updatePackage = new EventEmitter<{ id: string; request: UpdatePackageRequest }>();
  @Output() deletePackage = new EventEmitter<string>();

  readonly statusOptions = [
    'created',
    'received',
    'in_transit',
    'failed_delivery',
    'delivered',
    'returned',
    'cancelled',
  ];

  readonly isCreating = signal(false);
  readonly isLookingUpClient = signal(false);
  readonly foundClient = signal<Client | null>(null);
  readonly clientLookupCompleted = signal(false);
  readonly lookupMessage = signal('');
  readonly editingPackage = signal<PackageItem | null>(null);
  readonly packagePendingDelete = signal<PackageItem | null>(null);

  readonly form = this.fb.nonNullable.group({
    clientEmail: ['', [Validators.required, Validators.email]],
    clientName: [''],
    clientPhone: [''],
    clientAddress: [''],
    useClientAddress: [false],
    description: ['', [Validators.required, Validators.minLength(3)]],
    destinationAddress: ['', [Validators.required, Validators.minLength(5)]],
  });

  readonly editForm = this.fb.nonNullable.group({
    description: ['', [Validators.required, Validators.minLength(3)]],
    destinationAddress: ['', [Validators.required, Validators.minLength(5)]],
  });

  readonly filtersForm = this.fb.nonNullable.group({
    status: [''],
    startDate: [''],
    endDate: [''],
  });

  startCreate(): void {
    this.isCreating.set(true);
    this.clientLookupCompleted.set(false);
    this.foundClient.set(null);
    this.lookupMessage.set('');
    this.form.reset();
  }

  cancelCreate(): void {
    this.isCreating.set(false);
    this.clientLookupCompleted.set(false);
    this.foundClient.set(null);
    this.lookupMessage.set('');
    this.form.reset();
  }

  lookupClient(): void {
    const email = this.form.controls.clientEmail.value;
    if (this.form.controls.clientEmail.invalid || !email) return;

    this.isLookingUpClient.set(true);
    this.lookupMessage.set('');
    this.foundClient.set(null);
    this.clientLookupCompleted.set(false);

    this.clientsApi.getByEmail(email).subscribe({
      next: (client) => {
        this.foundClient.set(client);
        this.clientLookupCompleted.set(true);
        this.isLookingUpClient.set(false);
        this.lookupMessage.set(`Cliente encontrado: ${client.name}`);
        this.form.patchValue({
          clientName: client.name,
          clientPhone: client.phone,
          clientAddress: client.address,
        });
        this.syncClientAddress();
      },
      error: () => {
        this.foundClient.set(null);
        this.clientLookupCompleted.set(true);
        this.isLookingUpClient.set(false);
        this.lookupMessage.set('Cliente no encontrado. Completa sus datos.');
      },
    });
  }

  submit(): void {
    const client = this.foundClient();
    const rawValue = this.form.getRawValue();

    this.createPackage.emit({
      clientId: client?.id,
      clientEmail: rawValue.clientEmail,
      clientName: client ? undefined : rawValue.clientName,
      clientPhone: client ? undefined : rawValue.clientPhone,
      clientAddress: client ? undefined : rawValue.clientAddress,
      description: rawValue.description,
      destinationAddress: rawValue.destinationAddress,
    });
    this.cancelCreate();
  }

  startEdit(packageItem: PackageItem): void {
    this.editingPackage.set(packageItem);
    this.editForm.patchValue({
      description: packageItem.description,
      destinationAddress: packageItem.destinationAddress,
    });
  }

  cancelEdit(): void {
    this.editingPackage.set(null);
    this.editForm.reset();
  }

  submitEdit(): void {
    const packageItem = this.editingPackage();
    if (!packageItem || this.editForm.invalid) return;

    this.updatePackage.emit({
      id: packageItem.id,
      request: this.editForm.getRawValue(),
    });
    this.cancelEdit();
  }

  requestDelete(packageItem: PackageItem): void {
    this.packagePendingDelete.set(packageItem);
  }

  cancelDelete(): void {
    this.packagePendingDelete.set(null);
  }

  confirmDelete(): void {
    const packageItem = this.packagePendingDelete();
    if (!packageItem) return;

    this.deletePackage.emit(packageItem.id);
    this.cancelDelete();
  }

  canSubmit(): boolean {
    if (this.form.controls.clientEmail.invalid) return false;
    if (!this.clientLookupCompleted()) return false;
    if (!this.foundClient()) {
      if (!this.form.controls.clientName.value || this.form.controls.clientName.value.length < 2) return false;
      if (!this.form.controls.clientPhone.value) return false;
      if (!this.form.controls.clientAddress.value || this.form.controls.clientAddress.value.length < 5) return false;
    }

    return this.form.controls.description.valid &&
      this.form.controls.destinationAddress.valid;
  }

  applyFilters(): void {
    this.filtersChange.emit(this.normalizedFilters());
  }

  toggleUseClientAddress(): void {
    this.syncClientAddress();
  }

  syncClientAddress(): void {
    if (!this.form.controls.useClientAddress.value) {
      this.form.controls.destinationAddress.enable();
      return;
    }

    const address = this.foundClient()?.address || this.form.controls.clientAddress.value;
    this.form.controls.destinationAddress.setValue(address);
    this.form.controls.destinationAddress.disable();
  }

  clearFilters(): void {
    this.filtersForm.reset();
    this.filtersChange.emit({});
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

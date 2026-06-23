import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../domain/models/client.model';

@Component({
  selector: 'app-clients-panel',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients-panel.component.html',
  styleUrl: './clients-panel.component.css',
})
export class ClientsPanelComponent {
  private readonly fb = inject(FormBuilder);

  @Input({ required: true }) clients: Client[] = [];
  @Output() createClient = new EventEmitter<ReturnType<typeof this.form.getRawValue>>();
  @Output() selectClient = new EventEmitter<Client>();

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(5)]],
  });

  submit(): void {
    this.createClient.emit(this.form.getRawValue());
    this.form.reset();
  }
}

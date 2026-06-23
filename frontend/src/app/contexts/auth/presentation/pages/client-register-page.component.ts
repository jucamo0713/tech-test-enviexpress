import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSessionService } from '../../application/services/auth-session.service';
import { AuthApiService } from '../../infrastructure/api/auth-api.service';

@Component({
  selector: 'app-client-register-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-register-page.component.html',
  styleUrl: './client-register-page.component.css',
})
export class ClientRegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);
  private readonly session = inject(AuthSessionService);

  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    trackingCode: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  register(): void {
    this.errorMessage.set('');
    const { trackingCode, email, password } = this.form.getRawValue();

    this.authApi.registerClient(trackingCode, email, password).subscribe({
      next: (auth) => {
        this.session.setAuth(auth);
        void this.router.navigateByUrl('/client/packages');
      },
      error: () => {
        this.errorMessage.set('No se pudo validar la guia con ese correo');
      },
    });
  }
}

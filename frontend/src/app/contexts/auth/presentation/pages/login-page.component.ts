import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthSessionService } from '../../application/services/auth-session.service';
import { AuthApiService } from '../../infrastructure/api/auth-api.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);
  private readonly session = inject(AuthSessionService);

  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  login(): void {
    this.errorMessage.set('');
    const { email, password } = this.form.getRawValue();

    this.authApi.login(email, password).subscribe({
      next: (auth) => {
        this.session.setAuth(auth);
        void this.router.navigateByUrl(
          auth.user.role === 'client' ? '/client/packages' : '/operations',
        );
      },
      error: () => {
        this.errorMessage.set('No se pudo iniciar sesión');
      },
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthSessionService } from '../../../auth/application/services/auth-session.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar.component';
import { UserProfile } from '../../domain/models/profile.model';
import { ProfileApiService } from '../../infrastructure/api/profile-api.service';

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly session = inject(AuthSessionService);
  private readonly profileApi = inject(ProfileApiService);
  private readonly fb = inject(FormBuilder);

  readonly profile = signal<UserProfile | null>(null);
  readonly isLoading = signal(false);
  readonly isSavingProfile = signal(false);
  readonly isChangingPassword = signal(false);
  readonly message = signal('');
  readonly errorMessage = signal('');

  readonly profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', [Validators.required, Validators.minLength(8)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    if (!this.session.hasSession()) {
      void this.router.navigateByUrl('/login');
      return;
    }

    this.loadProfile();
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.isSavingProfile()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSavingProfile.set(true);
    this.clearMessages();
    this.profileApi.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (profile) => {
        this.applyProfile(profile);
        this.message.set('Perfil actualizado');
        this.isSavingProfile.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo actualizar el perfil');
        this.isSavingProfile.set(false);
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.isChangingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isChangingPassword.set(true);
    this.clearMessages();
    this.profileApi.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: (profile) => {
        this.applyProfile(profile);
        this.passwordForm.reset();
        this.message.set('Contraseña actualizada');
        this.isChangingPassword.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cambiar la contraseña');
        this.isChangingPassword.set(false);
      },
    });
  }

  backRoute(): string {
    const role = this.session.user()?.role;
    return role === 'client' ? '/client/packages' : '/operations';
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.clearMessages();
    this.profileApi.getProfile().subscribe({
      next: (profile) => {
        this.applyProfile(profile);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el perfil');
        this.isLoading.set(false);
      },
    });
  }

  private applyProfile(profile: UserProfile): void {
    this.profile.set(profile);
    this.profileForm.patchValue({
      name: profile.name,
    });
    this.session.updateUser({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      clientId: profile.clientId,
    });
  }

  private clearMessages(): void {
    this.message.set('');
    this.errorMessage.set('');
  }
}

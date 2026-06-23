import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthSessionService } from '../../../auth/application/services/auth-session.service';

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  private readonly router = inject(Router);
  readonly session = inject(AuthSessionService);

  goToPanel(): void {
    const user = this.session.user();
    void this.router.navigateByUrl(
      user?.role === 'client' ? '/client/packages' : '/operations',
    );
  }
}

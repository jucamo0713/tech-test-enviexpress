import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../../application/services/auth-session.service';

export const authGuard: CanActivateFn = () => {
  const session = inject(AuthSessionService);
  const router = inject(Router);

  if (session.hasSession()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

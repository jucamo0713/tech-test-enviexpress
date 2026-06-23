import { Routes } from '@angular/router';
import { authGuard } from './contexts/auth/infrastructure/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./contexts/home/presentation/pages/landing-page.component').then(
        (module) => module.LandingPageComponent,
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./contexts/auth/presentation/pages/login-page.component').then(
        (module) => module.LoginPageComponent,
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import(
        './contexts/auth/presentation/pages/client-register-page.component'
      ).then((module) => module.ClientRegisterPageComponent),
  },
  {
    path: 'track',
    loadComponent: () =>
      import(
        './contexts/packages/presentation/pages/public-tracking-page.component'
      ).then((module) => module.PublicTrackingPageComponent),
  },
  {
    path: 'client/packages',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './contexts/packages/presentation/pages/client-packages-page.component'
      ).then((module) => module.ClientPackagesPageComponent),
  },
  {
    path: 'operations',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './contexts/packages/presentation/pages/operations-dashboard-page.component'
      ).then((module) => module.OperationsDashboardPageComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

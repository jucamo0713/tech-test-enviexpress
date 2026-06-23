import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { routes } from './app.routes';
import { APP_CONFIG, appConfigFromEnvironment } from './core/config';
import {
  AUTH_TOKEN_READER,
  authTokenInterceptor,
  errorInterceptor,
  requestIdInterceptor,
  timeoutInterceptor,
} from './core/http';
import { provideAppI18n } from './core/i18n';
import { AppEffects, appReducers } from './shared/store';
import { AuthSessionService } from './contexts/auth/application/services/auth-session.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: APP_CONFIG, useValue: appConfigFromEnvironment },
    provideAppI18n(),
    {
      provide: AUTH_TOKEN_READER,
      deps: [AuthSessionService],
      useFactory: (session: AuthSessionService) => () => session.accessToken(),
    },
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        requestIdInterceptor,
        authTokenInterceptor,
        timeoutInterceptor,
        errorInterceptor,
      ]),
    ),
    provideStore(appReducers),
    provideCharts(withDefaultRegisterables()),
    provideEffects([AppEffects]),
    provideStoreDevtools({
      maxAge: 25,
      name: 'Frontend Architecture Store',
    }),
  ]
};

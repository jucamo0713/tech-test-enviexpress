import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AppError } from '../../core/errors';

export const AppActions = createActionGroup({
  source: 'App',
  events: {
    'Set Global Loading': props<{ loading: boolean }>(),
    'Report Error': props<{ error: AppError }>(),
    'Clear Error': emptyProps(),
  },
});


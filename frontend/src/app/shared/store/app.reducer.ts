import { ActionReducerMap, createReducer, on } from '@ngrx/store';
import { AppActions } from './app.actions';
import { AppState, AppUiState, initialAppUiState } from './app.state';

export const appUiReducer = createReducer<AppUiState>(
  initialAppUiState,
  on(AppActions.setGlobalLoading, (state, { loading }) => ({
    ...state,
    globalLoading: loading,
  })),
  on(AppActions.reportError, (state, { error }) => ({
    ...state,
    lastError: error,
  })),
  on(AppActions.clearError, (state) => ({
    ...state,
    lastError: null,
  })),
);

export const appReducers: ActionReducerMap<AppState> = {
  app: appUiReducer,
};


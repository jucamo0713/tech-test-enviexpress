import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppUiState } from './app.state';

export const selectAppUiState = createFeatureSelector<AppUiState>('app');

export const selectGlobalLoading = createSelector(
  selectAppUiState,
  (state) => state.globalLoading,
);

export const selectLastError = createSelector(
  selectAppUiState,
  (state) => state.lastError,
);


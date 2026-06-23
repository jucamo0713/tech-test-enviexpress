import { AppError } from '../../core/errors';

export interface AppUiState {
  readonly globalLoading: boolean;
  readonly lastError: AppError | null;
}

export interface AppState {
  readonly app: AppUiState;
}

export const initialAppUiState: AppUiState = {
  globalLoading: false,
  lastError: null,
};


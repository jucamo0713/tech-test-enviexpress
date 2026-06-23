export type AppErrorKind =
  | 'http'
  | 'network'
  | 'timeout'
  | 'validation'
  | 'unknown';

export interface AppError {
  readonly kind: AppErrorKind;
  readonly message: string;
  readonly statusCode?: number;
  readonly requestId?: string;
  readonly path?: string;
  readonly details?: unknown;
}


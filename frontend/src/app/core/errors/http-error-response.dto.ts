export interface HttpErrorResponseDto {
  readonly timestamp?: string;
  readonly requestId?: string;
  readonly httpStatusCode?: number;
  readonly message?: string | string[];
  readonly path?: string;
  readonly method?: string;
  readonly location?: string;
}


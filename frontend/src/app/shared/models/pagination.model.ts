export interface PaginationMetadata {
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
  readonly totalItems: number;
}

export interface Pagination<TItem> {
  readonly data: TItem[];
  readonly metadata: PaginationMetadata;
}


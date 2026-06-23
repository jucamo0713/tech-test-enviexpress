export interface PaginatedAggregationResultItem<T> {
  total: {
    total: number;
  };
  data: T[];
}

export type PaginatedAggregationResult<T> = PaginatedAggregationResultItem<T>[];

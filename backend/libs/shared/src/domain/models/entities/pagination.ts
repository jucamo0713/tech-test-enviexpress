/**
 * Represents metadata for pagination.
 */
export class PaginationMetadata {
  /**
   * The current page number.
   * @default 0
   */
  page: number = 0;
  /**
   * The number of items per page.
   * @default 0
   */
  limit: number = 0;
  /**
   * The total number of pages.
   * @default 0
   */
  totalPages: number = 0;

  /**
   * The total number of items across all pages.
   * @default 0
   */
  totalItems: number = 0;
}

/**
 * Represents a paginated response.
 * @template T - The type of items in the paginated data.
 */
export class Pagination<T> {
  /**
   * @param data - The list of items on the current page.
   * @param page - The current page number.
   * @param limit - The number of items per page.
   * @param totalItems - The total number of items across all pages.
   */
  constructor(
    data?: Array<T>,
    page?: number,
    limit?: number,
    totalItems?: number,
  ) {
    this.data = data ?? [];
    this.metadata = new PaginationMetadata();
    this.metadata.page = page ?? 0;
    this.metadata.limit = limit ?? 0;
    this.metadata.totalPages =
      totalItems && limit ? Math.ceil(totalItems / limit) : 0;
    this.metadata.totalItems = totalItems ?? 0;
  }

  /**
   * The list of items on the current page.
   * @default []
   */
  data: Array<T> = [];
  /**
   * Metadata related to the pagination.
   * @default new PaginationMetadata()
   */
  metadata: PaginationMetadata;
}

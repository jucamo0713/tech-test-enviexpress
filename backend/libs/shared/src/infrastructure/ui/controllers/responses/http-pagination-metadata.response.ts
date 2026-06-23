import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetadata } from '@shared/domain';

/**
 * Represents the metadata for pagination in HTTP responses.
 */
export class HttpPaginationMetadataResponse implements PaginationMetadata {
  @ApiProperty({ description: 'The current page number.' })
  page: number = 0;

  @ApiProperty({ description: 'The number of items per page.' })
  limit: number = 0;

  @ApiProperty({ description: 'The total number of pages.' })
  totalPages: number = 0;

  @ApiProperty({ description: 'The total number of items across all pages.' })
  totalItems: number = 0;
}

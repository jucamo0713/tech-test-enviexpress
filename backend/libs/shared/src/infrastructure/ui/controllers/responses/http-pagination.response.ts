import { ApiProperty } from '@nestjs/swagger';
import { Type } from '@nestjs/common';
import { Pagination } from '@shared/domain';
import { HttpPaginationMetadataResponse } from '@shared/infrastructure/ui/controllers/responses/http-pagination-metadata.response';
import { SharedControllersSwaggerConstants } from '@shared/infrastructure/ui/controllers/constants/controllers.swagger.constants';

/**
 * Constructor type returned by the paginated HTTP response factory.
 */
export type HttpPaginationResponseType<T extends Type<Pagination<unknown>>> =
  InstanceType<T>;

/**
 * Factory function to create a paginated HTTP response class.
 * @param dataType - The type of data contained in the pagination response.
 * @returns A class that implements Pagination<T>.
 */
export function HttpPaginationResponse<T>(
  dataType: Type<T>,
): Type<Pagination<T>> {
  class PaginatedResponse implements Pagination<T> {
    @ApiProperty({
      description:
        SharedControllersSwaggerConstants.PAGINATION_METADATA_DESCRIPTION,
      type: HttpPaginationMetadataResponse,
    })
    metadata: HttpPaginationMetadataResponse =
      new HttpPaginationMetadataResponse();

    @ApiProperty({
      description:
        SharedControllersSwaggerConstants.PAGINATION_DATA_DESCRIPTION,
      isArray: true,
      type: dataType,
    })
    data: T[] = [];
  }

  Object.defineProperty(PaginatedResponse, 'name', {
    value: `${dataType.name}PaginatedResponse`,
  });

  return PaginatedResponse;
}

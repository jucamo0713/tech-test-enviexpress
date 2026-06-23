import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { SharedControllersSwaggerConstants } from '@shared/infrastructure/ui/controllers/constants/controllers.swagger.constants';
import { SharedErrorMessagesConstants } from '@shared/domain/models/constants/shared-error-messages.constants';

/**
 * Base class for HTTP pagination requests.
 */
export class HttpBasePaginationRequest {
  @ApiProperty({
    description: SharedControllersSwaggerConstants.PAGE_PARAM_DESCRIPTION,
  })
  @IsPositive({
    message: SharedErrorMessagesConstants.PAGE_MUST_BE_POSITIVE,
  })
  @IsInt({
    message: SharedErrorMessagesConstants.PAGE_MUST_BE_INTEGER,
  })
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
    },
    {
      message: SharedErrorMessagesConstants.PAGE_MUST_BE_NUMBER,
    },
  )
  @IsNotEmpty({
    message: SharedErrorMessagesConstants.PAGE_MUST_NOT_BE_EMPTY,
  })
  @Type(() => Number)
  page!: number;

  @ApiProperty({
    description: SharedControllersSwaggerConstants.LIMIT_PARAM_DESCRIPTION,
  })
  @IsPositive({
    message: SharedErrorMessagesConstants.LIMIT_MUST_BE_POSITIVE,
  })
  @IsInt({
    message: SharedErrorMessagesConstants.LIMIT_MUST_BE_INTEGER,
  })
  @IsNumber(
    {
      allowInfinity: false,
      allowNaN: false,
    },
    {
      message: SharedErrorMessagesConstants.LIMIT_MUST_BE_NUMBER,
    },
  )
  @IsNotEmpty({
    message: SharedErrorMessagesConstants.LIMIT_MUST_NOT_BE_EMPTY,
  })
  @Type(() => Number)
  limit!: number;
}

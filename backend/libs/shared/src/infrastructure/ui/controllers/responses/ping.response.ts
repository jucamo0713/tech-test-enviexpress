import { ApiProperty } from '@nestjs/swagger';
import { SharedControllersSwaggerConstants } from '@shared/infrastructure/ui/controllers/constants/controllers.swagger.constants';

export class PingResponse {
  @ApiProperty({
    example: true,
    description: SharedControllersSwaggerConstants.PING_OK_DESCRIPTION,
  })
  ok: boolean;
  @ApiProperty({
    example: '2024-01-01T12:00:00Z',
    description: SharedControllersSwaggerConstants.PING_TS_DESCRIPTION,
  })
  ts: string;
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CancelTimeoutDecorator,
  LoggerDecorator,
} from '@shared/infrastructure';
import { SwaggerEndpointDecorator } from '@shared/infrastructure/ui/controllers/swagger-endpoint.decorator';
import { PingResponse } from '@shared/infrastructure/ui/controllers/responses/ping.response';
import {
  SharedControllersSwaggerConstants,
  SharedControllersSwaggerDescription,
  SharedControllersSwaggerSummary,
} from '@shared/infrastructure/ui/controllers/constants/controllers.swagger.constants';

@Controller('health')
@ApiTags(SharedControllersSwaggerConstants.HEALTH_CONTEXT)
export class HealthController {
  @Get()
  @SwaggerEndpointDecorator({
    summary: SharedControllersSwaggerSummary.PING,
    response: {
      type: PingResponse,
    },
    description: SharedControllersSwaggerDescription.PING,
    requireAuth: false,
  })
  @CancelTimeoutDecorator()
  @LoggerDecorator({ printLogs: false })
  ping(): PingResponse {
    return { ok: true, ts: new Date().toISOString() };
  }
}

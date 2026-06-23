import { Module } from '@nestjs/common';
import { GatewayModule } from './application/gateway.module';

@Module({
  imports: [GatewayModule],
})
export class ApiGatewayModule {}

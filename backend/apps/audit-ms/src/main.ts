import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppLogger, type EnvironmentVariables } from 'app/shared';
import { AuditMsModule } from './audit-ms.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AuditMsModule);
  const configService = app.get(ConfigService<EnvironmentVariables, true>);
  const redisUrl = configService.getOrThrow('REDIS_URL', { infer: true });
  app.get(AppLogger).log(`audit-ms subscribed to Redis at ${redisUrl}`, 'audit-ms');
}
void bootstrap();

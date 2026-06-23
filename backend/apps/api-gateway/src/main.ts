import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  AppLogger,
  configureNestApplicationGlobals,
  type EnvironmentVariables,
} from 'app/shared';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  configureNestApplicationGlobals(app);
  app.enableCors();

  const configService = app.get(ConfigService<EnvironmentVariables, true>);
  if (configService.getOrThrow('SWAGGER_ENABLED', { infer: true })) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(configService.getOrThrow('SWAGGER_TITLE', { infer: true }))
      .setDescription(
        configService.getOrThrow('SWAGGER_DESCRIPTION', { infer: true }),
      )
      .setVersion(configService.getOrThrow('SWAGGER_VERSION', { infer: true }))
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(
      configService.getOrThrow('SWAGGER_PATH', { infer: true }),
      app,
      document,
    );
  }

  const port = configService.getOrThrow('PORT', { infer: true });
  await app.listen(port);
  app.get(AppLogger).log(`api-gateway listening on ${port}`, 'ApiGateway');
}
void bootstrap();

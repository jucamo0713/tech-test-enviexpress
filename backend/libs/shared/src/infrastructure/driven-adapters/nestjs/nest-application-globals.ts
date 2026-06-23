import type {
  INestApplication,
  INestMicroservice,
} from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { ExceptionFilter } from './filters';
import {
  LoggerInterceptor,
  RequestContextInterceptor,
  TimeoutInterceptor,
} from './interceptors';
import { AppLogger } from './logger';

type NestApplicationWithGlobals = INestApplication | INestMicroservice;

export function configureNestApplicationGlobals(
  app: NestApplicationWithGlobals,
): void {
  app.useLogger(app.get(AppLogger));
  app.useGlobalFilters(app.get(ExceptionFilter));
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validateCustomDecorators: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(
    app.get(RequestContextInterceptor),
    app.get(LoggerInterceptor),
    app.get(TimeoutInterceptor),
  );
}

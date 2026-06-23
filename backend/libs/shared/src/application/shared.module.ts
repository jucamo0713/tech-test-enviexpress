import {
  Global,
  MiddlewareConsumer,
  Module,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { Controllers } from '@shared/infrastructure/ui/controllers';
import {
  CommandHandlers,
  EventHandlers,
  GatewayProviders,
  QueryHandlers,
  SharedProviders,
  UseCaseProviders,
} from './providers';
import { envValidationSchema } from './config';
import {
  AsyncContextMiddleware,
  DatabaseModule,
  RequestIdMiddleware,
} from '@shared/infrastructure/driven-adapters';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    CqrsModule,
    DatabaseModule,
  ],
  controllers: [...Controllers],
  providers: [
    ...UseCaseProviders,
    ...GatewayProviders,
    ...SharedProviders,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
  ],
  exports: [ConfigModule, CqrsModule, DatabaseModule, ...SharedProviders],
})
export class SharedModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, AsyncContextMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}

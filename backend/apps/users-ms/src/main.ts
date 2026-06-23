import { bootstrapGrpcMicroservice } from 'app/shared';
import { UsersMsModule } from './users-ms.module';

async function bootstrap() {
  await bootstrapGrpcMicroservice({
    appName: 'users-ms',
    module: UsersMsModule,
    packageName: 'users',
    protoFile: 'users.proto',
    urlEnv: 'GRPC_USERS_URL',
  });
}
void bootstrap();

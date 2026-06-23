import { bootstrapGrpcMicroservice } from 'app/shared';
import { AuthMsModule } from './auth-ms.module';

async function bootstrap() {
  await bootstrapGrpcMicroservice({
    appName: 'auth-ms',
    module: AuthMsModule,
    packageName: 'auth',
    protoFile: 'auth.proto',
    urlEnv: 'GRPC_AUTH_URL',
  });
}
void bootstrap();

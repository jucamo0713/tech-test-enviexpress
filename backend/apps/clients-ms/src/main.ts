import { bootstrapGrpcMicroservice } from 'app/shared';
import { ClientsMsModule } from './clients-ms.module';

async function bootstrap() {
  await bootstrapGrpcMicroservice({
    appName: 'clients-ms',
    module: ClientsMsModule,
    packageName: 'clients',
    protoFile: 'clients.proto',
    urlEnv: 'GRPC_CLIENTS_URL',
  });
}
void bootstrap();

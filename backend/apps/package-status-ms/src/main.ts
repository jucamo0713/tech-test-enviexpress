import { bootstrapGrpcMicroservice } from 'app/shared';
import { PackageStatusMsModule } from './package-status-ms.module';

async function bootstrap() {
  await bootstrapGrpcMicroservice({
    appName: 'package-status-ms',
    module: PackageStatusMsModule,
    packageName: 'package_status',
    protoFile: 'package-status.proto',
    urlEnv: 'GRPC_PACKAGE_STATUS_URL',
  });
}
void bootstrap();

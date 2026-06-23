import { bootstrapGrpcMicroservice } from 'app/shared';
import { PackagesMsModule } from './packages-ms.module';

async function bootstrap() {
  await bootstrapGrpcMicroservice({
    appName: 'packages-ms',
    module: PackagesMsModule,
    packageName: 'packages',
    protoFile: 'packages.proto',
    urlEnv: 'GRPC_PACKAGES_URL',
  });
}
void bootstrap();

import { bootstrapGrpcMicroservice } from 'app/shared';
import { AuditMsModule } from './audit-ms.module';

async function bootstrap() {
  await bootstrapGrpcMicroservice({
    appName: 'audit-ms',
    module: AuditMsModule,
    packageName: 'audit',
    protoFile: 'audit.proto',
    urlEnv: 'GRPC_AUDIT_URL',
  });
}
void bootstrap();

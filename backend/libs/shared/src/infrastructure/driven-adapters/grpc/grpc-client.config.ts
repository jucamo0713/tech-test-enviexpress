import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'node:path';

export interface GrpcClientConfig {
  packageName: string;
  protoFile: string;
  url: string;
}

export function buildGrpcClientOptions({
  packageName,
  protoFile,
  url,
}: GrpcClientConfig): GrpcOptions {
  return {
    transport: Transport.GRPC,
    options: {
      package: packageName,
      protoPath: join(
        process.cwd(),
        'libs/shared/src/infrastructure/contracts/proto',
        protoFile,
      ),
      url,
    },
  };
}

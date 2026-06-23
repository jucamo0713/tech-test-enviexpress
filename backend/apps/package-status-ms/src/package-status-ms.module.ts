import { Module } from '@nestjs/common';
import { PackageStatusModule } from './application/package-status.module';

@Module({
  imports: [PackageStatusModule],
})
export class PackageStatusMsModule {}

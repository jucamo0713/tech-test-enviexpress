import { Module } from '@nestjs/common';
import { PackagesModule } from './application/packages.module';

@Module({
  imports: [PackagesModule],
})
export class PackagesMsModule {}

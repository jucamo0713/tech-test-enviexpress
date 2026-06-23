import { Module } from '@nestjs/common';
import { AuditModule } from './application/audit.module';

@Module({
  imports: [AuditModule],
})
export class AuditMsModule {}

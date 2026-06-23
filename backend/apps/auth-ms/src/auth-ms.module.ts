import { Module } from '@nestjs/common';
import { AuthModule } from './application/auth.module';

@Module({
  imports: [AuthModule],
})
export class AuthMsModule {}

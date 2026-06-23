import { Module } from '@nestjs/common';
import { UsersModule } from './application/users.module';

@Module({
  imports: [UsersModule],
})
export class UsersMsModule {}

import { Module } from '@nestjs/common';
import { ClientsModule } from './application/clients.module';

@Module({
  imports: [ClientsModule],
})
export class ClientsMsModule {}

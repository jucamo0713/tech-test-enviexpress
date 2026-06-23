import { Command } from '@nestjs/cqrs';
import type { Client } from '../../entities/client';

export class UpdateClientCommand extends Command<Client> {
  constructor(
    public readonly id: string,
    public readonly payload: Partial<{
      name: string;
      email: string;
      phone: string;
      address: string;
      active: boolean;
    }>,
  ) {
    super();
  }
}

import { Command } from '@nestjs/cqrs';
import type { Client } from '../../entities/client';

export class CreateClientCommand extends Command<Client> {
  constructor(
    public readonly payload: {
      name: string;
      email: string;
      phone: string;
      address: string;
    },
  ) {
    super();
  }
}

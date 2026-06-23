import { Command } from '@nestjs/cqrs';

export class DeleteClientCommand extends Command<{ deleted: boolean }> {
  constructor(public readonly id: string) {
    super();
  }
}

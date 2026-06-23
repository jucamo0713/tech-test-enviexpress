import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterClientCommand } from '../../../domain/models/cqrs/commands/register-client.command';
import { RegisterClientUseCase } from '../../../domain/use-cases/register-client.use-case';

@CommandHandler(RegisterClientCommand)
export class RegisterClientCommandHandler
  implements ICommandHandler<RegisterClientCommand>
{
  constructor(private readonly useCase: RegisterClientUseCase) {}

  execute(command: RegisterClientCommand) {
    return this.useCase.execute(command.payload);
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateClientUserCommand } from '../../../domain/models/cqrs/commands/create-client-user.command';
import { CreateClientUserUseCase } from '../../../domain/use-cases/create-client-user.use-case';

@CommandHandler(CreateClientUserCommand)
export class CreateClientUserCommandHandler
  implements ICommandHandler<CreateClientUserCommand>
{
  constructor(private readonly useCase: CreateClientUserUseCase) {}

  execute(command: CreateClientUserCommand) {
    return this.useCase.execute(command.payload);
  }
}

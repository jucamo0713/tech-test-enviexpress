import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateOperatorCommand } from '../../../domain/models/cqrs/commands/create-operator.command';
import { CreateOperatorUseCase } from '../../../domain/use-cases/create-operator.use-case';

@CommandHandler(CreateOperatorCommand)
export class CreateOperatorCommandHandler
  implements ICommandHandler<CreateOperatorCommand>
{
  constructor(private readonly useCase: CreateOperatorUseCase) {}

  execute(command: CreateOperatorCommand) {
    return this.useCase.execute(command.payload);
  }
}

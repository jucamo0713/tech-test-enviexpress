import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from '../../../domain/models/cqrs/commands/change-password.command';
import { ChangePasswordUseCase } from '../../../domain/use-cases/change-password.use-case';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordCommandHandler
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(private readonly useCase: ChangePasswordUseCase) {}

  execute(command: ChangePasswordCommand) {
    return this.useCase.execute(command.payload);
  }
}

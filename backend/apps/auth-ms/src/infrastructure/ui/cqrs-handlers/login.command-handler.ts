import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../../../domain/models/cqrs/commands/login.command';
import { LoginUseCase } from '../../../domain/use-cases/login.use-case';

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
  constructor(private readonly useCase: LoginUseCase) {}

  execute(command: LoginCommand) {
    return this.useCase.execute(command.email, command.password);
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../../../domain/models/cqrs/commands/refresh-token.command';
import { RefreshTokenUseCase } from '../../../domain/use-cases/refresh-token.use-case';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(private readonly useCase: RefreshTokenUseCase) {}

  execute(command: RefreshTokenCommand) {
    return this.useCase.execute(command.refreshToken);
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RevokeOperatorAccessCommand } from '../../../domain/models/cqrs/commands/revoke-operator-access.command';
import { RevokeOperatorAccessUseCase } from '../../../domain/use-cases/revoke-operator-access.use-case';

@CommandHandler(RevokeOperatorAccessCommand)
export class RevokeOperatorAccessCommandHandler
  implements ICommandHandler<RevokeOperatorAccessCommand>
{
  constructor(private readonly useCase: RevokeOperatorAccessUseCase) {}

  execute(command: RevokeOperatorAccessCommand) {
    return this.useCase.execute(command.id);
  }
}

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProfileCommand } from '../../../domain/models/cqrs/commands/update-profile.command';
import { UpdateProfileUseCase } from '../../../domain/use-cases/update-profile.use-case';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileCommandHandler
  implements ICommandHandler<UpdateProfileCommand>
{
  constructor(private readonly useCase: UpdateProfileUseCase) {}

  execute(command: UpdateProfileCommand) {
    return this.useCase.execute(command.payload);
  }
}

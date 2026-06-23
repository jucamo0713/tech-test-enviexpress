import { Command } from '../commands/command';
import { AsyncResult } from './async-result';

export interface CommandHandler<TCommand extends Command<TResult>, TResult = void> {
  readonly commandType: TCommand['type'];
  execute(command: TCommand): AsyncResult<TResult>;
}


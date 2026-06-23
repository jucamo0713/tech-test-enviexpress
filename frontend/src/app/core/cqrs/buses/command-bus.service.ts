import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Command } from '../commands/command';
import { COMMAND_HANDLERS, CommandHandler } from '../handlers';
import { toObservable } from './result.util';

@Injectable({ providedIn: 'root' })
export class CommandBus {
  private readonly handlers = inject(COMMAND_HANDLERS, { optional: true });

  dispatch<TResult>(command: Command<TResult>): Observable<TResult> {
    const handler = this.handlers?.find(
      (candidate) => candidate.commandType === command.type,
    ) as CommandHandler<Command<TResult>, TResult> | undefined;

    if (!handler) {
      return throwError(
        () => new Error(`No command handler registered for ${command.type}`),
      );
    }

    return toObservable(handler.execute(command));
  }
}

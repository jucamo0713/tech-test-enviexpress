import type { Command, IEvent, Query } from '@nestjs/cqrs';

/**
 * Interface representing a CQRS (Command Query Responsibility Segregation) caller,
 * providing methods for dispatching commands, querying, and emitting events.
 *
 * This interface is designed to be implemented by classes that handle the
 * dispatching of commands, querying of data, and emitting of events
 * in a CQRS architecture.
 */
export interface CqrsCallerRepository {
  /**
   * Dispatches a command using the CQRS pattern.
   * @param command - The command to be dispatched.
   * @param args - Optional arguments to control logging behavior.
   * @param args.showCommand - Flag to indicate whether to log the command (optional).
   * @param args.showResult - Flag to indicate whether to log the result (optional).
   * @param args.showLogs - Flag to indicate whether to log additional information (optional).
   */
  dispatch<Result>(
    command: Command<Result>,
    args?: {
      showCommand?: boolean;
      showLogs?: boolean;
      showResult?: boolean;
    },
  ): Promise<Result>;

  /**
   * Emits an event using the CQRS pattern.
   * @param event - The event to be emitted.
   * @param args - Optional arguments to control logging behavior.
   * @param args.showEvent - Flag to indicate whether to log the event (optional).
   * @param args.showLogs - Flag to indicate whether to log additional information (optional).
   */
  emit(
    event: IEvent,
    args?: {
      showEvent?: boolean;
      showLogs?: boolean;
    },
  ): Promise<void>;

  /**
   * Executes a query using the CQRS pattern.
   * @param query - The query to be executed.
   * @param args - Optional arguments to control logging behavior.
   * @param args.showQuery - Flag to indicate whether to log the query (optional).
   * @param args.showResult - Flag to indicate whether to log the result (optional).
   * @param args.showLogs - Flag to indicate whether to log additional information (optional).
   */
  query<Result>(
    query: Query<Result>,
    args?: {
      showLogs?: boolean;
      showQuery?: boolean;
      showResult?: boolean;
    },
  ): Promise<Result>;
}

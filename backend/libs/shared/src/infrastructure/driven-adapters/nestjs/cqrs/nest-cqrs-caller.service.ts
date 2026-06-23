import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import type { Command, IEvent, Query } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { CqrsCallerRepository } from '@shared/domain/models/gateways/cqrs-caller.repository';

/**
 * A service that provides a unified interface for dispatching commands, emitting events, and executing queries.
 * It uses NestJS's CQRS module to handle these operations.
 * This service is designed to be used in a NestJS application and provides logging capabilities for each operation.
 */
@Injectable()
export class NestCqrsCaller implements CqrsCallerRepository {
  private logger: Logger = new Logger(NestCqrsCaller.name);

  /**
   * Constructor for the NestCqrsCaller class.
   * @param dispatcher - The command bus for dispatching commands.
   * @param consultant - The query bus for executing queries.
   * @param emitter - The event bus for publishing events.
   * @returns - An instance of the NestCqrsCaller class.
   */
  constructor(
    public readonly dispatcher: CommandBus,
    public readonly consultant: QueryBus,
    public readonly emitter: EventBus,
  ) {}

  /**
   * Dispatches a command using the command bus.
   * @async
   * @param command - The command to be dispatched.
   * @param [args] - Optional arguments for logging.
   * @param [args.showCommand] - Flag to indicate whether to log the command.
   * @param [args.showResult] - Flag to indicate whether to log the result.
   * @param [args.showLogs] - Flag to indicate when to display logs.
   * @returns - A promise resolving to the result of the command execution.
   */
  public async dispatch<Result>(
    command: Command<Result>,
    args?: {
      showCommand?: boolean;
      showLogs?: boolean;
      showResult?: boolean;
    },
  ): Promise<Result> {
    const {
      showCommand = true,
      showLogs = true,
      showResult = true,
    } = args ?? {};
    if (showLogs) {
      let log = `[${this.dispatch.name}] - INIT- Dispatching command ${command.constructor.name}`;
      if (showCommand) log += ` :: ${this.safeStringify(command)}`;
      this.logger.log(log);
    }
    const data = await this.dispatcher.execute(command);
    if (showLogs) {
      let log = `[${this.dispatch.name}] - FINISH- Dispatched command ${command.constructor.name}`;
      if (showResult) log += ` :: Result ${this.safeStringify(data)}`;
      this.logger.log(log);
    }
    return data;
  }

  /**
   * Emits an event using the event bus.
   * @async
   * @param event - The event to be emitted.
   * @param [args] - Optional arguments for logging.
   * @param [args.showLogs] - Flag to indicate when to display logs.
   * @param [args.showEvent] - Flag to indicate whether to log the event.
   * @returns - A promise resolving when the event is emitted.
   */
  public emit(
    event: IEvent,
    args?: {
      showEvent?: boolean;
      showLogs?: boolean;
    },
  ): Promise<void> {
    const { showEvent = true, showLogs = true } = args ?? {};
    if (showLogs) {
      let log = `[${this.emit.name}] - INIT- Emitting event ${event.constructor.name}`;
      if (showEvent) log += ` :: ${this.safeStringify(event)}`;
      this.logger.log(log);
    }
    this.emitter.publish(event);
    if (showLogs)
      this.logger.log(
        `[${this.emit.name}] - FINISH- Emitted event ${event.constructor.name}`,
      );
    return Promise.resolve();
  }

  /**
   * Executes a query using the query bus.
   * @async
   * @param query - The query to be executed.
   * @param [args] - Optional arguments for logging.
   * @param [args.showQuery] - Flag to indicate whether to log the query.
   * @param [args.showResult] - Flag to indicate whether to log the result.
   * @param [args.showLogs] -  Flag to indicate when to display logs.
   * @returns - A promise resolving to the result of the query execution.
   */
  public async query<Result>(
    query: Query<Result>,
    args?: {
      showLogs?: boolean;
      showQuery?: boolean;
      showResult?: boolean;
    },
  ): Promise<Result> {
    const { showLogs = true, showQuery = true, showResult = true } = args ?? {};
    if (showLogs) {
      let log = `[${this.query.name}] - INIT- Executing query ${query.constructor.name}`;
      if (showQuery) log += ` :: ${this.safeStringify(query)}`;
      this.logger.log(log);
    }
    const data = await this.consultant.execute(query);
    if (showLogs) {
      let log = `[${this.query.name}] - FINISH- Executed query ${query.constructor.name}`;
      if (showResult) log += ` :: Result ${this.safeStringify(data)}`;
      this.logger.log(log);
    }
    return data;
  }

  /**
   * Safely stringifies a value to avoid circular references.
   * @param value - The value to be stringify.
   * @returns - A string representation of the value or a placeholder if it cannot be serialized.
   */
  private safeStringify(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return '[Unserializable Object]';
    }
  }
}

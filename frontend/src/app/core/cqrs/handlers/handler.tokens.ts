import { InjectionToken } from '@angular/core';
import { Command } from '../commands/command';
import { Query } from '../queries/query';
import { CommandHandler } from './command-handler';
import { EventHandler } from './event-handler';
import { QueryHandler } from './query-handler';

export const COMMAND_HANDLERS = new InjectionToken<
  CommandHandler<Command<unknown>, unknown>[]
>('COMMAND_HANDLERS');

export const QUERY_HANDLERS = new InjectionToken<
  QueryHandler<Query<unknown>, unknown>[]
>('QUERY_HANDLERS');

export const EVENT_HANDLERS = new InjectionToken<EventHandler[]>(
  'EVENT_HANDLERS',
);

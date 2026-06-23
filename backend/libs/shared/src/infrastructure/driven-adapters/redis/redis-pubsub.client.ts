import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '@shared/application/config';
import type { DomainEvent } from '@shared/infrastructure/contracts';
import { ExceptionFilter } from '@shared/infrastructure/driven-adapters/nestjs/filters';
import { AsyncRequestContext } from '@shared/infrastructure/driven-adapters/nestjs/context';
import { resolveRequestId } from '@shared/infrastructure/driven-adapters/nestjs/middlewares';
import Redis from 'ioredis';

type RedisMessageHandler = (event: DomainEvent) => Promise<void> | void;

@Injectable()
export class RedisPubSubClient implements OnApplicationShutdown {
  private readonly logger = new Logger(RedisPubSubClient.name);
  private readonly redisUrl: string;
  private publisher?: Redis;
  private subscriber?: Redis;

  constructor(
    configService: ConfigService<EnvironmentVariables, true>,
  ) {
    this.redisUrl = configService.getOrThrow('REDIS_URL');
  }

  async publish(channel: string, event: DomainEvent): Promise<number> {
    const requestId = resolveRequestId(
      event.requestId ?? AsyncRequestContext.get('requestId'),
    );

    return this.getPublisher().publish(
      channel,
      JSON.stringify({
        ...event,
        requestId,
      }),
    );
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.getPublisher().get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async delete(key: string): Promise<void> {
    await this.getPublisher().del(key);
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.getPublisher().set(key, serialized, 'EX', ttlSeconds);
      return;
    }
    await this.getPublisher().set(key, serialized);
  }

  async subscribe(
    channel: string,
    handler: RedisMessageHandler,
  ): Promise<() => Promise<void>> {
    const listener = (receivedChannel: string, message: string) => {
      if (receivedChannel !== channel) {
        return;
      }

      const event = JSON.parse(message) as DomainEvent;
      const requestId = resolveRequestId(event.requestId);

      AsyncRequestContext.setData({ requestId }, async () => {
        try {
          await handler({
            ...event,
            requestId,
          });
        } catch (error) {
          this.logger.error(
            JSON.stringify(
              ExceptionFilter.toRedisPubSubExceptionDto(error, channel),
            ),
          );
        }
      });
    };

    const subscriber = this.getSubscriber();
    subscriber.on('message', listener);
    await subscriber.subscribe(channel);

    return async () => {
      subscriber.off('message', listener);
      await subscriber.unsubscribe(channel);
    };
  }

  async onApplicationShutdown(): Promise<void> {
    this.publisher?.disconnect();
    this.subscriber?.disconnect();
  }

  private getPublisher(): Redis {
    this.publisher ??= new Redis(this.redisUrl);
    return this.publisher;
  }

  private getSubscriber(): Redis {
    this.subscriber ??= this.getPublisher().duplicate();
    return this.subscriber;
  }
}

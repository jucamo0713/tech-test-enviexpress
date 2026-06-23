import {
  InternalServerErrorException,
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import { ClientSession, Connection } from 'mongoose';
import {
  DatabaseTransactionId,
  DatabaseTransactionRepository,
  ErrorUtils,
} from '@shared/domain';
/**
 * MongoDB implementation of the DatabaseTransactionRepository interface.
 */
@Injectable()
export class MongoTransactionRepository
  implements OnModuleDestroy, DatabaseTransactionRepository
{
  private static readonly transactions: Map<string, ClientSession> = new Map();

  private readonly logger = new Logger(MongoTransactionRepository.name);

  constructor(private readonly connection: Connection) {}

  getClientSession(transactionId: DatabaseTransactionId): ClientSession {
    return MongoTransactionRepository.getSession(transactionId);
  }

  async createTransaction(): Promise<DatabaseTransactionId> {
    this.logger.debug(`[${this.createTransaction.name}] - INIT`);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const transactionId = DatabaseTransactionId.generateInstance();
      MongoTransactionRepository.transactions.set(
        transactionId.toString(),
        session,
      );
      this.logger.debug(
        `[${this.createTransaction.name}] - FINISH - transactionId: ${transactionId.toString()}`,
      );
      return transactionId;
    } catch (error) {
      this.logger.error(
        `[${this.createTransaction.name}] - Failed to start transaction: ${ErrorUtils.resolveErrorMessage(error)}`,
      );
      await session.endSession().catch((endSessionError) => {
        this.logger.error(
          `[${this.createTransaction.name}] - Error ending session: ${ErrorUtils.resolveErrorMessage(endSessionError)}`,
        );
      });
      throw new InternalServerErrorException(
        'Failed to create database transaction',
      );
    }
  }

  async commitTransaction(transactionId: DatabaseTransactionId): Promise<void> {
    this.logger.debug(
      `[${this.commitTransaction.name}] - INIT - transactionId: ${transactionId.toString()}`,
    );
    const session = MongoTransactionRepository.getSession(transactionId);
    try {
      await session.commitTransaction();
      this.logger.debug(
        `[${this.commitTransaction.name}] - FINISH - transactionId: ${transactionId.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `[${this.commitTransaction.name}] - Error committing transaction: ${ErrorUtils.resolveErrorMessage(error)}`,
      );
      throw error;
    } finally {
      await session.endSession().catch((endSessionError) => {
        this.logger.error(
          `[${this.commitTransaction.name}] - Error ending session: ${ErrorUtils.resolveErrorMessage(endSessionError)}`,
        );
      });
      MongoTransactionRepository.transactions.delete(transactionId.toString());
    }
  }

  async rollbackTransaction(
    transactionId: DatabaseTransactionId,
  ): Promise<void> {
    this.logger.debug(
      `[${this.rollbackTransaction.name}] - INIT - transactionId: ${transactionId.toString()}`,
    );
    const session = MongoTransactionRepository.getSession(transactionId);
    try {
      await session.abortTransaction();
      this.logger.debug(
        `[${this.rollbackTransaction.name}] - FINISH - transactionId: ${transactionId.toString()}`,
      );
    } catch (error) {
      this.logger.error(
        `[${this.rollbackTransaction.name}] - Error rolling back transaction: ${ErrorUtils.resolveErrorMessage(error)}`,
      );
      throw error;
    } finally {
      await session.endSession().catch((endSessionError) => {
        this.logger.error(
          `[${this.rollbackTransaction.name}] - Error ending session: ${ErrorUtils.resolveErrorMessage(endSessionError)}`,
        );
      });
      MongoTransactionRepository.transactions.delete(transactionId.toString());
    }
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all(
      Array.from(MongoTransactionRepository.transactions.entries()).map(
        async ([id, session]) => {
          try {
            await session.abortTransaction().catch((error) => {
              this.logger.error(
                `[${this.onModuleDestroy.name}] - Error aborting transaction ${id}: ${ErrorUtils.resolveErrorMessage(error)}`,
              );
            });
          } finally {
            await session.endSession().catch((endSessionError) => {
              this.logger.error(
                `[${this.onModuleDestroy.name}] - Error ending session ${id}: ${ErrorUtils.resolveErrorMessage(endSessionError)}`,
              );
            });
            MongoTransactionRepository.transactions.delete(id);
          }
        },
      ),
    );
  }

  private static getSession(
    transactionId: DatabaseTransactionId,
  ): ClientSession {
    const session = this.transactions.get(transactionId.toString());
    if (!session) {
      throw new InternalServerErrorException('Transaction not found');
    }
    return session;
  }
}

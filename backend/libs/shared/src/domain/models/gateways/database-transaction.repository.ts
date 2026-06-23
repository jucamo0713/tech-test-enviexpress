import { DatabaseTransactionId } from '@shared/domain/models/value-objects/string';

export interface DatabaseTransactionRepository {
  /**
   * Commits a transaction.
   * @param transactionId
   * @returns A promise that resolves to `void`.
   */
  commitTransaction(transactionId: DatabaseTransactionId): Promise<void>;

  /**
   * Creates a new transaction.
   * @returns A promise that resolves to a transaction id.
   */
  createTransaction(): Promise<DatabaseTransactionId>;

  /**
   * Rolls back a transaction.
   * @param transactionId
   * @returns A promise that resolves to `void`.
   */
  rollbackTransaction(transactionId: DatabaseTransactionId): Promise<void>;
}

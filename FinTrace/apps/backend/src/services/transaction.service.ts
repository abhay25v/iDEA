// Transaction Service

import { TransactionModel, AccountModel } from '@models/mongodb';
import { getNeo4jSession } from '@config/neo4j';
import { Transaction, TransactionFilter, TransactionWithDetails } from '@shared/types';
import logger from '@utils/logger';
import { generateId } from '@utils';

export class TransactionService {
  /**
   * Create a new transaction
   */
  async createTransaction(data: {
    sourceAccountId: string;
    destinationAccountId: string;
    amount: number;
    type: string;
    description?: string;
  }): Promise<Transaction> {
    try {
      const transaction = new TransactionModel({
        id: generateId('TXN'),
        ...data,
        timestamp: new Date(),
        status: 'completed',
        reference: `REF_${Date.now()}`,
      });

      await transaction.save();

      // Update account balances
      await AccountModel.findByIdAndUpdate(data.sourceAccountId, {
        $inc: { balance: -data.amount },
        lastTransactionAt: new Date(),
      });

      await AccountModel.findByIdAndUpdate(data.destinationAccountId, {
        $inc: { balance: data.amount },
        lastTransactionAt: new Date(),
      });

      // Add to Neo4j
      const session = getNeo4jSession();
      try {
        await session.run(
          `
          MATCH (src:Account {accountId: $sourceId})
          MATCH (dst:Account {accountId: $destId})
          CREATE (src)-[:TRANSFERRED_TO {
            amount: $amount,
            timestamp: $timestamp,
            reference: $reference
          }]->(dst)
          `,
          {
            sourceId: data.sourceAccountId,
            destId: data.destinationAccountId,
            amount: data.amount,
            timestamp: transaction.timestamp.toISOString(),
            reference: transaction.reference,
          }
        );
      } finally {
        await session.close();
      }

      logger.info(`Transaction created: ${transaction.id}`);
      return transaction.toObject();
    } catch (error) {
      logger.error('Transaction creation error:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<TransactionWithDetails | null> {
    try {
      const transaction: any = await TransactionModel.findOne({ id }).lean();

      if (!transaction) {
        return null;
      }

      const sourceAccount: any = await AccountModel.findById(transaction.sourceAccountId).lean();
      const destAccount: any = await AccountModel.findById(transaction.destinationAccountId).lean();

      return {
        ...transaction,
        sourceAccount: sourceAccount || undefined,
        destinationAccount: destAccount || undefined,
      };
    } catch (error) {
      logger.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Get transactions with filters
   */
  async getTransactions(
    filters: TransactionFilter,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: Transaction[]; total: number }> {
    try {
      const query: any = {};

      if (filters.accountId) {
        query.$or = [
          { sourceAccountId: filters.accountId },
          { destinationAccountId: filters.accountId },
        ];
      }

      if (filters.dateRange) {
        query.timestamp = {
          $gte: filters.dateRange.start,
          $lte: filters.dateRange.end,
        };
      }

      if (filters.minAmount) {
        query.amount = { $gte: filters.minAmount };
      }

      if (filters.maxAmount) {
        query.amount = { ...query.amount, $lte: filters.maxAmount };
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      const skip = (page - 1) * pageSize;
      const total = await TransactionModel.countDocuments(query);
      const data = await TransactionModel.find(query).skip(skip).limit(pageSize).lean();

      return { data: data as any, total };
    } catch (error) {
      logger.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Import transactions from file
   */
  async importTransactions(transactions: any[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const txn of transactions) {
      try {
        await this.createTransaction(txn);
        success++;
      } catch (error) {
        logger.error('Transaction import error:', error);
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * Flag transaction as suspicious
   */
  async flagTransaction(id: string, reason: string): Promise<void> {
    try {
      await TransactionModel.findOneAndUpdate({ id }, { status: 'flagged' });
      logger.info(`Transaction flagged: ${id}, reason: ${reason}`);
    } catch (error) {
      logger.error('Error flagging transaction:', error);
      throw error;
    }
  }
}

export default new TransactionService();

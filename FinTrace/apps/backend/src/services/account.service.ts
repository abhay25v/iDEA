// Account Service

import { AccountModel, CustomerModel, TransactionModel } from '@models/mongodb';
import { Account, AccountWithRelations } from '@shared/types';
import logger from '@utils/logger';

export class AccountService {
  /**
   * Get account by ID with relations
   */
  async getAccountById(id: string): Promise<AccountWithRelations | null> {
    try {
      const account: any = await AccountModel.findById(id).lean();

      if (!account) {
        return null;
      }

      const customer = await CustomerModel.findById(account.customerId).lean();
      const transactionCount = await TransactionModel.countDocuments({
        $or: [{ sourceAccountId: id }, { destinationAccountId: id }],
      });

      const suspiciousTransactions = await TransactionModel.countDocuments({
        $or: [{ sourceAccountId: id }, { destinationAccountId: id }],
        status: 'flagged',
      });

      return {
        ...account,
        customer: customer || undefined,
        transactionCount,
        suspiciousTransactions,
      };
    } catch (error) {
      logger.error('Error fetching account:', error);
      throw error;
    }
  }

  /**
   * Get all accounts for a customer
   */
  async getCustomerAccounts(customerId: string): Promise<Account[]> {
    try {
      const accounts = await AccountModel.find({ customerId }).lean();
      return accounts as any;
    } catch (error) {
      logger.error('Error fetching customer accounts:', error);
      throw error;
    }
  }

  /**
   * Get high-risk accounts
   */
  async getHighRiskAccounts(threshold: number = 0.7, limit: number = 20): Promise<Account[]> {
    try {
      const accounts = await AccountModel.find({ riskScore: { $gte: threshold } })
        .sort({ riskScore: -1 })
        .limit(limit)
        .lean();

      return accounts as any;
    } catch (error) {
      logger.error('Error fetching high-risk accounts:', error);
      return [];
    }
  }

  /**
   * Update account risk score
   */
  async updateRiskScore(accountId: string, score: number): Promise<void> {
    try {
      await AccountModel.findByIdAndUpdate(accountId, { riskScore: score });
      logger.info(`Account risk score updated: ${accountId} → ${score}`);
    } catch (error) {
      logger.error('Error updating risk score:', error);
      throw error;
    }
  }

  /**
   * Flag account as suspicious
   */
  async flagAccount(accountId: string, reason: string): Promise<void> {
    try {
      await AccountModel.findByIdAndUpdate(accountId, { status: 'flagged' });
      logger.info(`Account flagged: ${accountId}, reason: ${reason}`);
    } catch (error) {
      logger.error('Error flagging account:', error);
      throw error;
    }
  }

  /**
   * Get account statistics
   */
  async getAccountStats(accountId: string): Promise<any> {
    try {
      const account: any = await AccountModel.findById(accountId);

      if (!account) {
        return null;
      }

      const totalTransactions = await TransactionModel.countDocuments({
        $or: [{ sourceAccountId: accountId }, { destinationAccountId: accountId }],
      });

      const totalVolume = await TransactionModel.aggregate([
        {
          $match: {
            $or: [{ sourceAccountId: accountId }, { destinationAccountId: accountId }],
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      const incomingVolume = await TransactionModel.aggregate([
        {
          $match: { destinationAccountId: accountId },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      const outgoingVolume = await TransactionModel.aggregate([
        {
          $match: { sourceAccountId: accountId },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      return {
        accountId,
        balance: account.balance,
        riskScore: account.riskScore,
        totalTransactions,
        totalVolume: totalVolume[0]?.total || 0,
        incomingVolume: incomingVolume[0]?.total || 0,
        outgoingVolume: outgoingVolume[0]?.total || 0,
      };
    } catch (error) {
      logger.error('Error getting account stats:', error);
      throw error;
    }
  }
}

export default new AccountService();

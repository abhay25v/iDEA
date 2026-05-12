// Analytics Service - Aggregations, trends, and metrics

import { TransactionModel, AccountModel, AlertModel } from '@models/mongodb';
import logger from '@utils/logger';

export class AnalyticsService {
  /**
   * Get fraud statistics
   */
  async getFraudStats() {
    try {
      const totalTransactions = await TransactionModel.countDocuments();
      const flaggedTransactions = await TransactionModel.countDocuments({ status: 'flagged' });
      const totalAccounts = await AccountModel.countDocuments();
      const highRiskAccounts = await AccountModel.countDocuments({ riskScore: { $gte: 0.7 } });
      const openAlerts = await AlertModel.countDocuments({ status: 'open' });
      const criticalAlerts = await AlertModel.countDocuments({ severity: 'critical' });

      return {
        totalTransactions,
        flaggedTransactions,
        fraudRate: totalTransactions > 0 ? (flaggedTransactions / totalTransactions) * 100 : 0,
        totalAccounts,
        highRiskAccounts,
        openAlerts,
        criticalAlerts,
      };
    } catch (error) {
      logger.error('Error fetching fraud stats:', error);
      throw error;
    }
  }

  /**
   * Get transaction volume trends (last 7 days)
   */
  async getTransactionTrends() {
    try {
      const days = 7;
      const trends = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = await TransactionModel.countDocuments({
          timestamp: {
            $gte: date,
            $lt: nextDate,
          },
        });

        const flagged = await TransactionModel.countDocuments({
          timestamp: {
            $gte: date,
            $lt: nextDate,
          },
          status: 'flagged',
        });

        trends.push({
          date: date.toISOString().split('T')[0],
          total: count,
          flagged,
          percentage: count > 0 ? (flagged / count) * 100 : 0,
        });
      }

      return trends;
    } catch (error) {
      logger.error('Error fetching transaction trends:', error);
      throw error;
    }
  }

  /**
   * Get risk score distribution
   */
  async getRiskDistribution() {
    try {
      const critical = await AccountModel.countDocuments({ riskScore: { $gte: 0.9 } });
      const high = await AccountModel.countDocuments({ riskScore: { $gte: 0.7, $lt: 0.9 } });
      const medium = await AccountModel.countDocuments({ riskScore: { $gte: 0.5, $lt: 0.7 } });
      const low = await AccountModel.countDocuments({ riskScore: { $lt: 0.5 } });

      return {
        critical,
        high,
        medium,
        low,
        total: critical + high + medium + low,
      };
    } catch (error) {
      logger.error('Error fetching risk distribution:', error);
      throw error;
    }
  }

  /**
   * Get top suspicious accounts
   */
  async getTopSuspiciousAccounts(limit: number = 10) {
    try {
      const accounts = await AccountModel.find()
        .sort({ riskScore: -1 })
        .limit(limit)
        .select('id accountNumber status riskScore balance')
        .lean();

      return accounts;
    } catch (error) {
      logger.error('Error fetching top suspicious accounts:', error);
      throw error;
    }
  }

  /**
   * Get alert severity breakdown
   */
  async getAlertSeverity() {
    try {
      const critical = await AlertModel.countDocuments({ severity: 'critical' });
      const high = await AlertModel.countDocuments({ severity: 'high' });
      const medium = await AlertModel.countDocuments({ severity: 'medium' });
      const low = await AlertModel.countDocuments({ severity: 'low' });

      return { critical, high, medium, low };
    } catch (error) {
      logger.error('Error fetching alert severity:', error);
      throw error;
    }
  }

  /**
   * Get transaction type breakdown
   */
  async getTransactionTypeBreakdown() {
    try {
      const types = await TransactionModel.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
      ]);

      return types;
    } catch (error) {
      logger.error('Error fetching transaction type breakdown:', error);
      throw error;
    }
  }

  /**
   * Get high-value transaction summary
   */
  async getHighValueTransactions(threshold: number = 50000, limit: number = 20) {
    try {
      const transactions = await TransactionModel.find({ amount: { $gte: threshold } })
        .sort({ amount: -1 })
        .limit(limit)
        .select('sourceAccountId destinationAccountId amount timestamp status')
        .lean();

      return transactions;
    } catch (error) {
      logger.error('Error fetching high-value transactions:', error);
      throw error;
    }
  }

  /**
   * Get customer KYC status breakdown
   */
  async getKYCBreakdown() {
    try {
      const breakdown = await AccountModel.aggregate([
        {
          $group: {
            _id: '$kycStatus',
            count: { $sum: 1 },
            avgRiskScore: { $avg: '$riskScore' },
          },
        },
      ]);

      return breakdown;
    } catch (error) {
      logger.error('Error fetching KYC breakdown:', error);
      throw error;
    }
  }
}

export default new AnalyticsService();

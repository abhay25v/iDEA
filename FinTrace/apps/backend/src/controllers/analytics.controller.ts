// Analytics Controller

import { Request, Response } from 'express';
import { sendResponse } from '@utils';
import analyticsService from '@services/analytics.service';
import logger from '@utils/logger';

export class AnalyticsController {
  /**
   * GET /api/analytics/fraud-stats
   * Get overall fraud statistics
   */
  async getFraudStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await analyticsService.getFraudStats();
      sendResponse(res, 200, { stats });
    } catch (error) {
      logger.error('Analytics error:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to fetch fraud stats');
    }
  }

  /**
   * GET /api/analytics/trends
   * Get transaction trends
   */
  async getTransactionTrends(req: Request, res: Response): Promise<void> {
    try {
      const trends = await analyticsService.getTransactionTrends();
      sendResponse(res, 200, { trends });
    } catch (error) {
      logger.error('Trends error:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to fetch trends');
    }
  }

  /**
   * GET /api/analytics/risk-distribution
   * Get risk score distribution
   */
  async getRiskDistribution(req: Request, res: Response): Promise<void> {
    try {
      const distribution = await analyticsService.getRiskDistribution();
      sendResponse(res, 200, { distribution });
    } catch (error) {
      logger.error('Risk distribution error:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to fetch risk distribution');
    }
  }

  /**
   * GET /api/analytics/top-suspicious
   * Get top suspicious accounts
   */
  async getTopSuspiciousAccounts(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt((req.query.limit as string) || '10', 10);
      const accounts = await analyticsService.getTopSuspiciousAccounts(limit);
      sendResponse(res, 200, { accounts });
    } catch (error) {
      logger.error('Top suspicious error:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to fetch suspicious accounts');
    }
  }

  /**
   * GET /api/analytics/alerts-severity
   * Get alert severity breakdown
   */
  async getAlertSeverity(req: Request, res: Response): Promise<void> {
    try {
      const severity = await analyticsService.getAlertSeverity();
      sendResponse(res, 200, { severity });
    } catch (error) {
      logger.error('Alert severity error:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to fetch alert severity');
    }
  }

  /**
   * GET /api/analytics/transaction-types
   * Get transaction type breakdown
   */
  async getTransactionTypeBreakdown(req: Request, res: Response): Promise<void> {
    try {
      const breakdown = await analyticsService.getTransactionTypeBreakdown();
      sendResponse(res, 200, { breakdown });
    } catch (error) {
      logger.error('Transaction type error:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to fetch transaction types');
    }
  }

  /**
   * GET /api/analytics/high-value
   * Get high-value transactions
   */
  async getHighValueTransactions(req: Request, res: Response): Promise<void> {
    try {
      const threshold = parseInt((req.query.threshold as string) || '50000', 10);
      const limit = parseInt((req.query.limit as string) || '20', 10);
      const transactions = await analyticsService.getHighValueTransactions(threshold, limit);
      sendResponse(res, 200, { transactions });
    } catch (error) {
      logger.error('High value transactions error:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to fetch high-value transactions');
    }
  }

  /**
   * GET /api/analytics/kyc-breakdown
   * Get KYC status breakdown
   */
  async getKYCBreakdown(req: Request, res: Response): Promise<void> {
    try {
      const breakdown = await analyticsService.getKYCBreakdown();
      sendResponse(res, 200, { breakdown });
    } catch (error) {
      logger.error('KYC breakdown error:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to fetch KYC breakdown');
    }
  }
}

export default new AnalyticsController();

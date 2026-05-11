// Transaction Controller

import { Request, Response } from 'express';
import { sendResponse } from '@utils';
import transactionService from '@services/transaction.service';
import logger from '@utils/logger';

export class TransactionController {
  /**
   * POST /api/transactions
   * Create a new transaction
   */
  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const transaction = await transactionService.createTransaction(req.body);
      sendResponse(res, 201, { transaction }, 'Transaction created successfully');
    } catch (error) {
      logger.error('Transaction creation error:', error);
      const message = error instanceof Error ? error.message : 'Transaction creation failed';
      sendResponse(res, 400, undefined, undefined, message);
    }
  }

  /**
   * GET /api/transactions
   * Get transactions with filters
   */
  async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, pageSize = 20, accountId, type, status } = req.query;

      const filters: any = {
        ...(accountId && { accountId: accountId as string }),
        ...(type && { type: type as string }),
        ...(status && { status: status as string }),
      };

      const { data, total } = await transactionService.getTransactions(
        filters,
        parseInt(page as string),
        parseInt(pageSize as string)
      );

      sendResponse(res, 200, {
        transactions: data,
        pagination: {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize as string)),
        },
      });
    } catch (error) {
      logger.error('Error fetching transactions:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to fetch transactions');
    }
  }

  /**
   * GET /api/transactions/:id
   * Get transaction by ID
   */
  async getTransactionById(req: Request, res: Response): Promise<void> {
    try {
      const transaction = await transactionService.getTransactionById(req.params.id);

      if (!transaction) {
        sendResponse(res, 404, undefined, undefined, 'Transaction not found');
        return;
      }

      sendResponse(res, 200, { transaction });
    } catch (error) {
      logger.error('Error fetching transaction:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to fetch transaction');
    }
  }

  /**
   * POST /api/transactions/import
   * Import transactions from file
   */
  async importTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { transactions } = req.body;

      if (!Array.isArray(transactions) || transactions.length === 0) {
        sendResponse(res, 400, undefined, undefined, 'Invalid transactions data');
        return;
      }

      const result = await transactionService.importTransactions(transactions);
      sendResponse(res, 200, result, 'Transactions imported');
    } catch (error) {
      logger.error('Transaction import error:', error);
      sendResponse(res, 500, undefined, undefined, 'Import failed');
    }
  }

  /**
   * PATCH /api/transactions/:id/flag
   * Flag transaction as suspicious
   */
  async flagTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { reason } = req.body;
      await transactionService.flagTransaction(req.params.id, reason || 'Manual flag');
      sendResponse(res, 200, undefined, 'Transaction flagged successfully');
    } catch (error) {
      logger.error('Error flagging transaction:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to flag transaction');
    }
  }
}

export default new TransactionController();

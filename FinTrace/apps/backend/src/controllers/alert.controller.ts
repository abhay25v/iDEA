// Alert Controller

import { Request, Response } from 'express';
import { sendResponse } from '@utils';
import { AlertModel } from '@models/mongodb';
import logger from '@utils/logger';

export class AlertController {
  /**
   * GET /api/alerts
   * Get alerts with filters and pagination
   */
  async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, pageSize = 20, status, severity, accountId } = req.query;

      const filters: any = {};
      if (status) filters.status = status as string;
      if (severity) filters.severity = severity as string;
      if (accountId) filters.accountId = accountId as string;

      const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);

      const [alerts, total] = await Promise.all([
        AlertModel.find(filters)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(pageSize as string)),
        AlertModel.countDocuments(filters),
      ]);

      sendResponse(res, 200, {
        alerts,
        pagination: {
          page: parseInt(page as string),
          pageSize: parseInt(pageSize as string),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize as string)),
        },
      });
    } catch (error) {
      logger.error('Error fetching alerts:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to fetch alerts');
    }
  }

  /**
   * GET /api/alerts/:id
   * Get alert by ID
   */
  async getAlertById(req: Request, res: Response): Promise<void> {
    try {
      const alert = await AlertModel.findById(req.params.id);

      if (!alert) {
        sendResponse(res, 404, undefined, undefined, 'Alert not found');
        return;
      }

      sendResponse(res, 200, { alert });
    } catch (error) {
      logger.error('Error fetching alert:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to fetch alert');
    }
  }

  /**
   * PATCH /api/alerts/:id/review
   * Mark alert as investigating and assign to investigator
   * Only admin and investigator can use this
   */
  async reviewAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        sendResponse(res, 401, undefined, undefined, 'User not authenticated');
        return;
      }

      const alert = await AlertModel.findByIdAndUpdate(
        req.params.id,
        {
          status: 'investigating',
          investigatorId: userId,
          reviewedAt: new Date(),
        },
        { new: true }
      );

      if (!alert) {
        sendResponse(res, 404, undefined, undefined, 'Alert not found');
        return;
      }

      logger.info(`Alert ${req.params.id} marked for review by ${userId}`);
      sendResponse(res, 200, { alert }, 'Alert marked for review');
    } catch (error) {
      logger.error('Error reviewing alert:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to review alert');
    }
  }

  /**
   * PATCH /api/alerts/:id/dismiss
   * Dismiss alert as false positive
   * Only admin and investigator can use this
   */
  async dismissAlert(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        sendResponse(res, 401, undefined, undefined, 'User not authenticated');
        return;
      }

      const alert = await AlertModel.findByIdAndUpdate(
        req.params.id,
        {
          status: 'false_positive',
          investigatorId: userId,
          resolvedAt: new Date(),
        },
        { new: true }
      );

      if (!alert) {
        sendResponse(res, 404, undefined, undefined, 'Alert not found');
        return;
      }

      logger.info(`Alert ${req.params.id} dismissed by ${userId}`);
      sendResponse(res, 200, { alert }, 'Alert dismissed');
    } catch (error) {
      logger.error('Error dismissing alert:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to dismiss alert');
    }
  }

  /**
   * PATCH /api/alerts/:id/resolve
   * Mark alert as resolved
   * Only admin and investigator can use this
   */
  async resolveAlert(req: Request, res: Response): Promise<void> {
    try {
      const { notes } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        sendResponse(res, 401, undefined, undefined, 'User not authenticated');
        return;
      }

      const alert = await AlertModel.findByIdAndUpdate(
        req.params.id,
        {
          status: 'resolved',
          investigatorId: userId,
          notes: notes || '',
          resolvedAt: new Date(),
        },
        { new: true }
      );

      if (!alert) {
        sendResponse(res, 404, undefined, undefined, 'Alert not found');
        return;
      }

      logger.info(`Alert ${req.params.id} resolved by ${userId}`);
      sendResponse(res, 200, { alert }, 'Alert resolved');
    } catch (error) {
      logger.error('Error resolving alert:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to resolve alert');
    }
  }
}

export default new AlertController();

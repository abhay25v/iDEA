// Alert Service

import { AlertModel, AccountModel } from '@models/mongodb';
import { Alert, AlertFilter, AlertWithDetails } from '@shared/types';
import logger from '@utils/logger';
import { generateId } from '@utils';

export class AlertService {
  /**
   * Create a new alert
   */
  async createAlert(data: {
    type: string;
    severity: string;
    title: string;
    description: string;
    accountId: string;
    fraudScore: number;
  }): Promise<Alert> {
    try {
      const alert = new AlertModel({
        id: generateId('ALR'),
        ...data,
        status: 'open',
        createdAt: new Date(),
      });

      await alert.save();
      logger.info(`Alert created: ${alert.id}`);
      return alert.toObject();
    } catch (error) {
      logger.error('Alert creation error:', error);
      throw error;
    }
  }

  /**
   * Get alert by ID with details
   */
  async getAlertById(id: string): Promise<AlertWithDetails | null> {
    try {
      const alert: any = await AlertModel.findOne({ id }).lean();

      if (!alert) {
        return null;
      }

      const account = await AccountModel.findById(alert.accountId).lean();

      return {
        ...alert,
        account: account || undefined,
      };
    } catch (error) {
      logger.error('Error fetching alert:', error);
      throw error;
    }
  }

  /**
   * Get alerts with filters
   */
  async getAlerts(
    filters: AlertFilter,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ data: Alert[]; total: number }> {
    try {
      const query: any = {};

      if (filters.severity) {
        query.severity = filters.severity;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.dateRange) {
        query.createdAt = {
          $gte: filters.dateRange.start,
          $lte: filters.dateRange.end,
        };
      }

      const skip = (page - 1) * pageSize;
      const total = await AlertModel.countDocuments(query);
      const data = await AlertModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean();

      return { data: data as any, total };
    } catch (error) {
      logger.error('Error fetching alerts:', error);
      throw error;
    }
  }

  /**
   * Update alert status
   */
  async updateAlertStatus(id: string, status: string, notes?: string): Promise<void> {
    try {
      const updateData: any = { status };

      if (notes) {
        updateData.notes = notes;
      }

      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
      }

      await AlertModel.findOneAndUpdate({ id }, updateData);
      logger.info(`Alert status updated: ${id} → ${status}`);
    } catch (error) {
      logger.error('Error updating alert:', error);
      throw error;
    }
  }

  /**
   * Get high-severity alerts
   */
  async getHighSeverityAlerts(limit: number = 10): Promise<Alert[]> {
    try {
      const alerts = await AlertModel.find({
        severity: { $in: ['critical', 'high'] },
        status: { $ne: 'resolved' },
      })
        .sort({ fraudScore: -1 })
        .limit(limit)
        .lean();

      return alerts as any;
    } catch (error) {
      logger.error('Error fetching high-severity alerts:', error);
      return [];
    }
  }

  /**
   * Bulk close resolved alerts
   */
  async bulkCloseAlerts(ids: string[]): Promise<void> {
    try {
      await AlertModel.updateMany({ id: { $in: ids } }, { status: 'false_positive', resolvedAt: new Date() });
      logger.info(`${ids.length} alerts closed`);
    } catch (error) {
      logger.error('Error bulk closing alerts:', error);
      throw error;
    }
  }
}

export default new AlertService();

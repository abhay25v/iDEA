// PDF Export Service - Generate FIU evidence packages

import PDFDocument from 'pdfkit';
import { AlertModel, TransactionModel, AccountModel } from '@models/mongodb';
import logger from '@utils/logger';
import fs from 'fs';
import path from 'path';

export class PDFExportService {
  /**
   * Generate FIU evidence PDF for an alert
   */
  async generateAlertEvidencePDF(alertId: string): Promise<Buffer> {
    try {
      const alert: any = await AlertModel.findOne({ id: alertId }).lean();
      if (!alert) {
        throw new Error('Alert not found');
      }

      const account: any = await AccountModel.findOne({ id: alert.accountId }).lean();
      const transactions = await TransactionModel.find({
        $or: [
          { sourceAccountId: alert.accountId },
          { destinationAccountId: alert.accountId },
        ],
      })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      // Convert to buffer
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));

      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on('error', reject);

        // Title
        doc.fontSize(20).text('FINANCIAL INVESTIGATION UNIT', { align: 'center' });
        doc.fontSize(12).text('FRAUD EVIDENCE REPORT', { align: 'center' });
        doc.moveDown();

        // Report header
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
        doc.text(`Alert ID: ${alertId}`, { align: 'right' });
        doc.moveDown();

        // Alert details section
        doc.fontSize(14).text('ALERT DETAILS');
        doc.fontSize(10);
        doc.text(`Title: ${alert.title}`);
        doc.text(`Description: ${alert.description}`);
        doc.text(`Severity: ${alert.severity.toUpperCase()}`);
        doc.text(`Fraud Score: ${(alert.fraudScore * 100).toFixed(2)}%`);
        doc.text(`Status: ${alert.status}`);
        doc.text(`Created: ${new Date(alert.createdAt).toLocaleString()}`);
        doc.moveDown();

        // Account details section
        if (account) {
          doc.fontSize(14).text('ACCOUNT INFORMATION');
          doc.fontSize(10);
          doc.text(`Account ID: ${account.id || account._id}`);
          doc.text(`Account Number: ${account.accountNumber || 'N/A'}`);
          doc.text(`Status: ${account.status}`);
          doc.text(`Balance: $${(account.balance || 0).toLocaleString()}`);
          doc.text(`KYC Status: ${account.kycStatus}`);
          doc.text(`Risk Score: ${(account.riskScore * 100).toFixed(1)}%`);
          doc.moveDown();
        } else {
          doc.fontSize(10).text('No account information available');
          doc.moveDown();
        }

        // Transaction chain section
        if (transactions.length > 0) {
          doc.fontSize(14).text('TRANSACTION CHAIN');
          doc.fontSize(9);

          transactions.slice(0, 20).forEach((txn: any, idx) => {
            doc.text(
              `${idx + 1}. ${new Date(txn.timestamp).toLocaleString()} - $${txn.amount.toLocaleString()} from ${txn.sourceAccountId} to ${txn.destinationAccountId}`
            );
          });

          if (transactions.length > 20) {
            doc.text(`... and ${transactions.length - 20} more transactions`);
          }
          doc.moveDown();
        }

        // Footer
        doc.fontSize(9).text('---');
        doc.text('This report is confidential and for authorized FIU personnel only.', { align: 'center' });

        doc.end();
      });
    } catch (error) {
      logger.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Generate transaction summary PDF
   */
  async generateTransactionSummaryPDF(accountId: string, dateRange?: { start: Date; end: Date }): Promise<Buffer> {
    try {
      const account: any = await AccountModel.findOne({ id: accountId }).lean();
      if (!account) {
        throw new Error('Account not found');
      }

      const query: any = {
        $or: [{ sourceAccountId: accountId }, { destinationAccountId: accountId }],
      };

      if (dateRange) {
        query.timestamp = {
          $gte: dateRange.start,
          $lte: dateRange.end,
        };
      }

      const transactions = await TransactionModel.find(query).sort({ timestamp: -1 }).lean();

      // Create PDF
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));

      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on('error', reject);

        doc.fontSize(16).text(`TRANSACTION SUMMARY`, { align: 'center' });
        doc.fontSize(10);
        doc.text(`Account: ${account.accountNumber || accountId}`);
        doc.text(`Generated: ${new Date().toLocaleString()}`);

        if (dateRange) {
          doc.text(
            `Period: ${dateRange.start.toLocaleDateString()} to ${dateRange.end.toLocaleDateString()}`
          );
        }

        doc.moveDown();

        // Stats
        const incomingTxns = transactions.filter((t: any) => t.destinationAccountId === accountId);
        const outgoingTxns = transactions.filter((t: any) => t.sourceAccountId === accountId);

        const totalIncoming = incomingTxns.reduce((sum: number, t: any) => sum + t.amount, 0);
        const totalOutgoing = outgoingTxns.reduce((sum: number, t: any) => sum + t.amount, 0);

        doc.fontSize(12).text('STATISTICS');
        doc.fontSize(10);
        doc.text(`Total Transactions: ${transactions.length}`);
        doc.text(`Incoming: ${incomingTxns.length} ($${totalIncoming.toLocaleString()})`);
        doc.text(`Outgoing: ${outgoingTxns.length} ($${totalOutgoing.toLocaleString()})`);
        doc.text(`Net Flow: $${(totalIncoming - totalOutgoing).toLocaleString()}`);
        doc.moveDown();

        // Transaction list
        doc.fontSize(12).text('TRANSACTIONS');
        doc.fontSize(8);

        transactions.slice(0, 30).forEach((txn: any, idx) => {
          const direction = txn.sourceAccountId === accountId ? 'OUT' : 'IN';
          doc.text(
            `${idx + 1}. [${direction}] ${new Date(txn.timestamp).toLocaleDateString()} $${txn.amount.toLocaleString()}`
          );
        });

        doc.end();
      });
    } catch (error) {
      logger.error('Error generating transaction summary PDF:', error);
      throw error;
    }
  }
}

export default new PDFExportService();

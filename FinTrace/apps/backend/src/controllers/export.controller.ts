// Export Controller - PDF and CSV export functionality

import { Request, Response } from 'express';
import { sendResponse } from '@utils';
import pdfExportService from '@services/pdf-export.service';
import logger from '@utils/logger';
import PDFDocument from 'pdfkit';

export class ExportController {
  /**
   * GET /api/export/test/pdf
   * Test PDF generation
   */
  async testPDF(req: Request, res: Response): Promise<void> {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));

      return new Promise((resolve) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="test.pdf"',
          });
          res.send(pdfBuffer);
          resolve();
        });

        // Simple test content
        doc.fontSize(24).text('TEST PDF', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text('This is a test PDF to verify PDFKit works.');
        doc.text('Line 2: Check if this content appears.');
        doc.text('Line 3: If you can read this, PDFKit is working!');
        
        doc.end();
      });
    } catch (error) {
      logger.error('Test PDF error:', error);
      sendResponse(res, 500, undefined, undefined, 'PDF test failed');
    }
  }

  /**
   * GET /api/export/alert/:id/pdf
   * Generate FIU evidence PDF for an alert
   */
  async exportAlertPDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        sendResponse(res, 400, undefined, undefined, 'Alert ID required');
        return;
      }

      const pdfBuffer = await pdfExportService.generateAlertEvidencePDF(id);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="alert_${id}_evidence.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      logger.error('PDF export error:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to generate PDF');
    }
  }

  /**
   * GET /api/export/account/:id/summary
   * Generate transaction summary PDF for an account
   */
  async exportAccountSummaryPDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      if (!id) {
        sendResponse(res, 400, undefined, undefined, 'Account ID required');
        return;
      }

      const dateRange =
        startDate && endDate
          ? {
              start: startDate,
              end: endDate,
            }
          : undefined;

      const pdfBuffer = await pdfExportService.generateTransactionSummaryPDF(id, dateRange);

      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="account_${id}_summary.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.send(pdfBuffer);
    } catch (error) {
      logger.error('PDF export error:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to generate PDF');
    }
  }

  /**
   * GET /api/export/transactions/csv
   * Export transactions as CSV
   */
  async exportTransactionsCSV(req: Request, res: Response): Promise<void> {
    try {
      const { TransactionModel } = require('@models/mongodb');

      const transactions = await TransactionModel.find().lean();

      let csv = 'ID,Source Account,Destination Account,Amount,Type,Timestamp,Status\n';

      transactions.forEach((txn: any) => {
        csv += `${txn.id},"${txn.sourceAccountId}","${txn.destinationAccountId}",${txn.amount},"${txn.type}","${txn.timestamp}","${txn.status}"\n`;
      });

      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="transactions.csv"',
      });

      res.send(csv);
    } catch (error) {
      logger.error('CSV export error:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to export CSV');
    }
  }

  /**
   * GET /api/export/alerts/csv
   * Export alerts as CSV
   */
  async exportAlertsCSV(req: Request, res: Response): Promise<void> {
    try {
      const { AlertModel } = require('@models/mongodb');

      const alerts = await AlertModel.find().lean();

      let csv = 'ID,Type,Severity,Title,Account ID,Fraud Score,Status,Created At\n';

      alerts.forEach((alert: any) => {
        csv += `${alert.id},"${alert.type}","${alert.severity}","${alert.title}","${alert.accountId}",${alert.fraudScore},"${alert.status}","${alert.createdAt}"\n`;
      });

      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="alerts.csv"',
      });

      res.send(csv);
    } catch (error) {
      logger.error('CSV export error:', error);
      sendResponse(res, 500, undefined, undefined, 'Failed to export CSV');
    }
  }
}

export default new ExportController();

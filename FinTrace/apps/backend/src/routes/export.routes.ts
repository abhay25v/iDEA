// Export Routes

import { Router, Request, Response } from 'express';
import exportController from '@controllers/export.controller';

const router: Router = Router();

// Test
router.get('/test/pdf', (req, res) => exportController.testPDF(req, res));

// PDF exports
router.get('/alert/:id/pdf', (req, res) => exportController.exportAlertPDF(req, res));
router.get('/account/:id/summary', (req, res) => exportController.exportAccountSummaryPDF(req, res));

// CSV exports
router.get('/transactions/csv', (req, res) => exportController.exportTransactionsCSV(req, res));
router.get('/alerts/csv', (req, res) => exportController.exportAlertsCSV(req, res));

export default router;

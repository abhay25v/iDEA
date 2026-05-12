// Analytics Routes

import { Router, Request, Response } from 'express';
import analyticsController from '@controllers/analytics.controller';

const router: Router = Router();

router.get('/fraud-stats', (req, res) => analyticsController.getFraudStats(req, res));
router.get('/trends', (req, res) => analyticsController.getTransactionTrends(req, res));
router.get('/risk-distribution', (req, res) => analyticsController.getRiskDistribution(req, res));
router.get('/top-suspicious', (req, res) => analyticsController.getTopSuspiciousAccounts(req, res));
router.get('/alerts-severity', (req, res) => analyticsController.getAlertSeverity(req, res));
router.get('/transaction-types', (req, res) => analyticsController.getTransactionTypeBreakdown(req, res));
router.get('/high-value', (req, res) => analyticsController.getHighValueTransactions(req, res));
router.get('/kyc-breakdown', (req, res) => analyticsController.getKYCBreakdown(req, res));

export default router;

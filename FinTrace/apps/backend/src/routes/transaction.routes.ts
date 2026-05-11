// Transaction Routes

import { Router } from 'express';
import transactionController from '@controllers/transaction.controller';
import { validateRequest, schemas } from '@middleware/validation';
import { authenticateToken, authorize } from '@middleware/auth';

const router: any = Router();

// All routes require authentication
router.use(authenticateToken);

router.post(
  '/',
  validateRequest(schemas.transaction),
  transactionController.createTransaction.bind(transactionController)
);

router.get('/', transactionController.getTransactions.bind(transactionController));

router.get('/:id', transactionController.getTransactionById.bind(transactionController));

router.post('/import', transactionController.importTransactions.bind(transactionController));

router.patch(
  '/:id/flag',
  authorize('admin', 'investigator'),
  transactionController.flagTransaction.bind(transactionController)
);

export default router;

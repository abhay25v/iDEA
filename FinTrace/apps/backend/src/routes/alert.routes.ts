// Alert Routes

import { Router, Request, Response } from 'express';
import alertController from '@controllers/alert.controller';
import { authenticateToken, authorize } from '@middleware/auth';

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET endpoints - all authenticated users can view
router.get('/', alertController.getAlerts.bind(alertController));

router.get('/:id', alertController.getAlertById.bind(alertController));

// Modify endpoints - only admin and investigator
router.patch(
  '/:id/review',
  authorize('admin', 'investigator'),
  alertController.reviewAlert.bind(alertController)
);

router.patch(
  '/:id/dismiss',
  authorize('admin', 'investigator'),
  alertController.dismissAlert.bind(alertController)
);

router.patch(
  '/:id/resolve',
  authorize('admin', 'investigator'),
  alertController.resolveAlert.bind(alertController)
);

export default router;

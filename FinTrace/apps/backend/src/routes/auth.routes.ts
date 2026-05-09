// Authentication Routes

import { Router } from 'express';
import authController from '@controllers/auth.controller';
import { validateRequest, schemas } from '@middleware/validation';
import { authenticateToken } from '@middleware/auth';

const router: any = Router();

router.post('/register', validateRequest(schemas.register), authController.register.bind(authController));
router.post('/login', validateRequest(schemas.login), authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authenticateToken, authController.logout.bind(authController));
router.get('/me', authenticateToken, authController.getCurrentUser.bind(authController));

export default router;

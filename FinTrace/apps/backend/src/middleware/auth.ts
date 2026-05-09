// JWT Authentication Middleware

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '@config';
import { sendResponse } from '@utils';
import logger from '@utils/logger';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    sendResponse(res, 401, undefined, undefined, 'Access token required');
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      email: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    sendResponse(res, 401, undefined, undefined, 'Invalid or expired token');
  }
}

export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendResponse(res, 401, undefined, undefined, 'User not authenticated');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendResponse(res, 403, undefined, undefined, 'Insufficient permissions');
      return;
    }

    next();
  };
}

export default { authenticateToken, authorize };

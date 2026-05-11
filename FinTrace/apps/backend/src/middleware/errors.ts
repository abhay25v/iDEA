// Error Handling Middleware

import { Request, Response, NextFunction } from 'express';
import { sendResponse } from '@utils';
import logger from '@utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Error:', err);

  if (err instanceof AppError) {
    sendResponse(res, err.statusCode, undefined, undefined, err.message);
    return;
  }

  // Unhandled error
  if (process.env.NODE_ENV === 'production') {
    sendResponse(res, 500, undefined, undefined, 'Internal server error');
  } else {
    sendResponse(res, 500, undefined, undefined, err.message);
  }
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default { AppError, errorHandler, asyncHandler };

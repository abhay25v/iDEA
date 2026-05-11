// Request Validation Middleware

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendResponse } from '@utils';

export function validateRequest(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      sendResponse(res, 400, undefined, undefined, `Validation error: ${messages}`);
      return;
    }

    req.body = value;
    next();
  };
}

// Common validation schemas
export const schemas = {
  login: Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().min(6).required(),
  }),

  register: Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    fullName: Joi.string().min(2).required(),
    password: Joi.string().min(6).required(),
  }),

  transaction: Joi.object({
    sourceAccountId: Joi.string().required(),
    destinationAccountId: Joi.string().required(),
    amount: Joi.number().positive().required(),
    type: Joi.string().valid('transfer', 'deposit', 'withdrawal', 'payment').required(),
    description: Joi.string(),
  }),

  account: Joi.object({
    accountNumber: Joi.string().required(),
    customerId: Joi.string().required(),
    accountType: Joi.string().valid('savings', 'checking', 'credit', 'loan').required(),
    balance: Joi.number().min(0),
  }),

  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    pageSize: Joi.number().min(1).max(100).default(20),
  }),
};

export default { validateRequest, schemas };

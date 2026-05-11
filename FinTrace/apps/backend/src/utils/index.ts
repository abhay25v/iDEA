// Utility functions for common operations

import { Response } from 'express';
import { ApiResponse } from '@shared/types';

/**
 * Send API response with consistent format
 */
export function sendResponse<T>(
  res: Response,
  statusCode: number,
  data?: T,
  message?: string,
  error?: string
): Response {
  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(error && { error }),
  };

  return res.status(statusCode).json(response);
}

/**
 * Generate fraud alert message
 */
export function generateAlertMessage(
  type: string,
  amount: number,
  accountId: string
): string {
  const messages: Record<string, string> = {
    rapid_layering: `Rapid layering detected on account ${accountId} with transaction of $${amount.toFixed(2)}`,
    circular_transfer: `Circular transfer detected involving account ${accountId} with amount $${amount.toFixed(2)}`,
    smurfing: `Potential smurfing activity on account ${accountId}`,
    dormant_activation: `Dormant account ${accountId} suddenly activated with $${amount.toFixed(2)} transaction`,
    high_velocity: `High velocity transactions on account ${accountId}`,
    kyc_mismatch: `KYC-Income mismatch detected on account ${accountId}`,
  };

  return messages[type] || `Suspicious activity detected on account ${accountId}`;
}

/**
 * Calculate risk score based on multiple factors
 */
export function calculateRiskScore(factors: Record<string, number>): number {
  const weights: Record<string, number> = {
    transactionRisk: 0.3,
    networkRisk: 0.25,
    behavioralRisk: 0.25,
    kycRisk: 0.2,
  };

  let score = 0;
  for (const [factor, weight] of Object.entries(weights)) {
    if (factor in factors) {
      score += factors[factor] * weight;
    }
  }

  return Math.min(Math.max(score, 0), 1); // Ensure score is between 0 and 1
}

/**
 * Check if score falls into risk category
 */
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 0.9) return 'critical';
  if (score >= 0.7) return 'high';
  if (score >= 0.4) return 'medium';
  return 'low';
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * Parse duration string to milliseconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error('Invalid duration format');

  const [, value, unit] = match;
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return parseInt(value, 10) * (multipliers[unit] || 1000);
}

export default {
  sendResponse,
  generateAlertMessage,
  calculateRiskScore,
  getRiskLevel,
  formatCurrency,
  generateId,
  parseDuration,
};

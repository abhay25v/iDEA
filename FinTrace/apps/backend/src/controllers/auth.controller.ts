// Authentication Controller

import { Request, Response } from 'express';
import { sendResponse } from '@utils';
import authService from '@services/auth.service';
import logger from '@utils/logger';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, fullName, password } = req.body;

      const user = await authService.register(email, fullName, password);
      sendResponse(res, 201, { user }, 'User registered successfully');
    } catch (error) {
      logger.error('Registration error:', error);
      const message = error instanceof Error ? error.message : 'Registration failed';
      sendResponse(res, 400, undefined, undefined, message);
    }
  }

  /**
   * POST /api/auth/login
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const { user, tokens } = await authService.login(email, password);
      sendResponse(res, 200, { user, tokens }, 'Login successful');
    } catch (error) {
      logger.error('Login error:', error);
      const message = error instanceof Error ? error.message : 'Login failed';
      sendResponse(res, 401, undefined, undefined, message);
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        sendResponse(res, 400, undefined, undefined, 'Refresh token required');
        return;
      }

      const tokens = await authService.refreshToken(refreshToken);
      sendResponse(res, 200, { tokens }, 'Token refreshed successfully');
    } catch (error) {
      logger.error('Token refresh error:', error);
      sendResponse(res, 401, undefined, undefined, 'Invalid refresh token');
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      logger.info(`User logged out: ${req.user?.email}`);
      sendResponse(res, 200, undefined, 'Logged out successfully');
    } catch (error) {
      sendResponse(res, 500, undefined, undefined, 'Logout failed');
    }
  }

  /**
   * GET /api/auth/me
   * Get current user profile
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendResponse(res, 401, undefined, undefined, 'Not authenticated');
        return;
      }

      sendResponse(res, 200, { user: req.user }, 'User profile retrieved');
    } catch (error) {
      sendResponse(res, 500, undefined, undefined, 'Failed to retrieve user profile');
    }
  }
}

export default new AuthController();

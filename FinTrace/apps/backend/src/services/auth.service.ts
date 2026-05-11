// Authentication Service

import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '@config';
import { UserModel } from '@models/mongodb';
import logger from '@utils/logger';
import { AuthPayload, AuthTokens, User } from '@shared/types';
import { parseDuration } from '@utils';

export class AuthService {
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async verifyAndMigratePassword(user: any, password: string): Promise<boolean> {
    const storedPassword = typeof user.password === 'string' ? user.password : '';

    // Normal path: stored password is already a bcrypt hash.
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
      return bcryptjs.compare(password, storedPassword);
    }

    // Backward compatibility: accept legacy plain-text passwords once, then upgrade in-place.
    if (storedPassword && storedPassword === password) {
      user.password = await bcryptjs.hash(password, 10);
      await user.save();
      logger.warn(`Upgraded legacy plain-text password for user: ${user.email}`);
      return true;
    }

    return false;
  }

  /**
   * Register a new user
   */
  async register(
    email: string,
    fullName: string,
    password: string,
    role: string = 'investigator'
  ): Promise<User> {
    const normalizedEmail = this.normalizeEmail(email);

    // Check if user exists
    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = new UserModel({
      email: normalizedEmail,
      fullName,
      password: hashedPassword,
      role,
    });

    await user.save();
    logger.info(`User registered: ${email}`);

    return this.sanitizeUser(user);
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    const normalizedEmail = this.normalizeEmail(email);

    // Find user
    const user: any = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.verifyAndMigratePassword(user, password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user);
    logger.info(`User logged in: ${email}`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(user: any): AuthTokens {
    const payload: AuthPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: 0, // Will be set below
    };

    // Access token
    const accessTokenDuration = parseDuration(config.jwt.expiryTime);
    const accessTokenExpirySeconds = Math.floor(accessTokenDuration / 1000);
    payload.exp = Math.floor(Date.now() / 1000) + accessTokenExpirySeconds;

    const accessToken = jwt.sign(payload, config.jwt.secret);

    // Refresh token (longer expiry)
    const refreshTokenDuration = parseDuration(config.jwt.refreshExpiryTime);
    const refreshTokenExpirySeconds = Math.floor(refreshTokenDuration / 1000);
    payload.exp = Math.floor(Date.now() / 1000) + refreshTokenExpirySeconds;

    const refreshToken = jwt.sign(payload, config.jwt.secret);

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenExpirySeconds,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.secret) as AuthPayload;
      const user: any = await UserModel.findById(payload.userId);

      if (!user) {
        throw new Error('User not found');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: any): User {
    const { password, ...sanitized } = user.toObject();
    return sanitized;
  }
}

export default new AuthService();

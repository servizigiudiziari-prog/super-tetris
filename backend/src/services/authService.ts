import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/env';
import database from '../config/database';
import { UserModel } from '../models/userModel';
import { AuthenticationError, ValidationError, ConflictError } from '../types';
import redis from '../config/redis';

const SALT_ROUNDS = 10;

export class AuthService {
  /**
   * Register a new user
   */
  static async register(
    username: string,
    email: string,
    password: string
  ): Promise<{ user: any; token: string; refreshToken: string }> {
    // Validate input
    if (!username || username.length < 3) {
      throw new ValidationError('Username must be at least 3 characters');
    }

    if (!email || !this.isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!password || password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // Check if email already exists
    if (await UserModel.emailExists(email)) {
      throw new ConflictError('Email already registered');
    }

    // Check if username already exists
    if (await UserModel.usernameExists(username)) {
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await UserModel.create(username, email, passwordHash);

    // Generate tokens
    const token = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in Redis
    await redis.set(
      `refresh_token:${user.id}`,
      refreshToken,
      30 * 24 * 60 * 60 // 30 days
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  static async login(
    email: string,
    password: string
  ): Promise<{ user: any; token: string; refreshToken: string }> {
    // Find user
    const user = await UserModel.findByEmailWithPassword(email);

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const token = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in Redis
    await redis.set(
      `refresh_token:${user.id}`,
      refreshToken,
      30 * 24 * 60 * 60 // 30 days
    );

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(
    refreshToken: string
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;

      // Check if refresh token exists in Redis
      const storedToken = await redis.get(`refresh_token:${decoded.id}`);

      if (!storedToken || storedToken !== refreshToken) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Find user
      const user = await UserModel.findById(decoded.id);

      if (!user) {
        throw new AuthenticationError('User not found');
      }

      // Generate new tokens
      const newToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Update refresh token in Redis
      await redis.set(
        `refresh_token:${user.id}`,
        newRefreshToken,
        30 * 24 * 60 * 60
      );

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  static async logout(userId: string): Promise<void> {
    await redis.del(`refresh_token:${userId}`);
  }

  /**
   * Generate JWT access token
   */
  private static generateAccessToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiration,
      }
    );
  }

  /**
   * Generate JWT refresh token
   */
  private static generateRefreshToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.refreshExpiration,
      }
    );
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (err) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get user with password
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const userWithPassword = await UserModel.findByEmailWithPassword(user.email);

    // Verify old password
    const isValid = await bcrypt.compare(oldPassword, userWithPassword.password_hash);
    if (!isValid) {
      throw new AuthenticationError('Invalid current password');
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new ValidationError('New password must be at least 8 characters');
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await database.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHash, userId]
    );

    // Invalidate all refresh tokens
    await redis.del(`refresh_token:${userId}`);
  }
}

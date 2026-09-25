import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { config } from '../config/index';
import { Role, Status } from '../generated/client';
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
  buildInternalServiceHeaders,
} from '@nexacommerce/common';
import { createLogger } from '@nexacommerce/logger';
import crypto from 'crypto';

const logger = createLogger('auth-service');

type AuthEmailType = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

export class AuthService {
  private async dispatchAuthEmail(options: {
    type: AuthEmailType;
    email: string;
    name: string;
    token: string;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${config.notificationServiceUrl}/notifications/internal/auth-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...buildInternalServiceHeaders('auth-service'),
        },
        body: JSON.stringify(options),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        logger.error(`Notification service rejected ${options.type} delivery with status ${response.status}`);
        return false;
      }
      return true;
    } catch {
      // Do not return provider details or email tokens to the public client.
      // Durable retry/outbox delivery is introduced in Phase 3.
      logger.error(`Notification service unavailable while dispatching ${options.type}`);
      return false;
    }
  }

  async register(data: { name: string; email: string; password: string }) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: Role.CUSTOMER,
      status: Status.ACTIVE,
    });

    // Generate email verification token
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours

    await userRepository.createEmailVerificationToken(token, user.id, expiresAt);
    const verificationEmailAccepted = await this.dispatchAuthEmail({
      type: 'EMAIL_VERIFICATION',
      email: user.email,
      name: user.name,
      token,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      verificationEmailAccepted,
      createdAt: user.createdAt,
    };
  }

  async login(credentials: { email: string; password: string }, context?: { ipAddress?: string; userAgent?: string }) {
    const user = await userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== Status.ACTIVE) {
      throw new UnauthorizedError(`User account is ${user.status.toLowerCase()}`);
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, jti: crypto.randomUUID() },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn as any }
    );

    // Save refresh token
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7 days
    await userRepository.saveRefreshToken(refreshToken, user.id, refreshExpiresAt);

    // Record login metrics
    await userRepository.createLoginHistory(user.id, context?.ipAddress, context?.userAgent);
    await userRepository.updateLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
      },
    };
  }

  async logout(token: string) {
    const existingToken = await userRepository.findRefreshToken(token);
    if (!existingToken) {
      throw new NotFoundError('Token not found');
    }
    await userRepository.revokeRefreshToken(token);
  }

  async refreshToken(oldRefreshToken: string) {
    let payload: any;
    try {
      payload = jwt.verify(oldRefreshToken, config.jwtRefreshSecret);
    } catch (err) {
      throw new UnauthorizedError('Invalid refresh token signature');
    }

    const storedToken = await userRepository.findRefreshToken(oldRefreshToken);
    if (!storedToken) {
      throw new UnauthorizedError('Refresh token does not exist');
    }

    if (storedToken.isRevoked) {
      // Security measure: if a token is reused after being revoked, suspect an attack
      throw new UnauthorizedError('Refresh token has been revoked');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Invalidate old token
    await userRepository.revokeRefreshToken(oldRefreshToken);

    const user = await userRepository.findById(storedToken.userId);
    if (!user || user.status !== Status.ACTIVE) {
      throw new UnauthorizedError('User account associated with this token is inactive');
    }

    // Generate new token pair
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, jti: crypto.randomUUID() },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiresIn as any }
    );

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7); // 7 days
    await userRepository.saveRefreshToken(newRefreshToken, user.id, refreshExpiresAt);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    // For security reasons, don't expose if the user exists
    if (!user) {
      return { accepted: true };
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    await userRepository.createPasswordResetToken(token, user.id, expiresAt);
    this.dispatchAuthEmail({
      type: 'PASSWORD_RESET',
      email: user.email,
      name: user.name,
      token,
    });

    return { accepted: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetTokenRecord = await userRepository.findPasswordResetToken(token);
    if (!resetTokenRecord) {
      throw new ValidationError('Invalid or expired reset token');
    }

    if (resetTokenRecord.isUsed) {
      throw new ValidationError('Reset token has already been used');
    }

    if (new Date() > resetTokenRecord.expiresAt) {
      throw new ValidationError('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.update(resetTokenRecord.userId, { passwordHash });
    await userRepository.usePasswordResetToken(token);
  }

  async verifyEmail(token: string) {
    const verificationRecord = await userRepository.findEmailVerificationToken(token);
    if (!verificationRecord) {
      throw new ValidationError('Invalid or expired verification token');
    }

    if (verificationRecord.isUsed) {
      throw new ValidationError('Verification token has already been used');
    }

    if (new Date() > verificationRecord.expiresAt) {
      throw new ValidationError('Verification token has expired');
    }

    await userRepository.update(verificationRecord.userId, { emailVerified: true });
    await userRepository.useEmailVerificationToken(token);
  }

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepository.update(userId, { passwordHash });
  }

  async resendVerification(email: string) {
    const user = await userRepository.findByEmail(email);
    // Keep one response shape for missing, verified, and unverified accounts.
    if (!user || user.emailVerified) {
      return { accepted: true };
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours

    await userRepository.createEmailVerificationToken(token, user.id, expiresAt);
    this.dispatchAuthEmail({
      type: 'EMAIL_VERIFICATION',
      email: user.email,
      name: user.name,
      token,
    });

    return { accepted: true };
  }
}

export const authService = new AuthService();
export default authService;

import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { successResponse } from '@nexacommerce/common';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@nexacommerce/validation';
import { config } from '../config';

const ACCESS_COOKIE = 'nexa_access_token';
const REFRESH_COOKIE = 'nexa_refresh_token';

function readCookie(req: Request, name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(';')) {
    const [key, ...valueParts] = part.trim().split('=');
    if (key === name) return decodeURIComponent(valueParts.join('='));
  }
  return undefined;
}

function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  const sharedOptions = {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    domain: config.cookieDomain,
  } as const;

  res.cookie(ACCESS_COOKIE, accessToken, {
    ...sharedOptions,
    path: '/',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...sharedOptions,
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res: Response): void {
  const sharedOptions = {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    domain: config.cookieDomain,
  } as const;
  res.clearCookie(ACCESS_COOKIE, { ...sharedOptions, path: '/' });
  res.clearCookie(REFRESH_COOKIE, { ...sharedOptions, path: '/api/v1/auth' });
}

export class AuthController {
  register = async (req: Request, res: Response) => {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.register(validatedData);
    res.status(201).json(successResponse(user, 'User registered successfully'));
  };

  login = async (req: Request, res: Response) => {
    const validatedData = loginSchema.parse(req.body);
    const context = {
      ipAddress: req.ip || (req.headers['x-forwarded-for'] as string),
      userAgent: req.headers['user-agent'],
    };
    const result = await authService.login(validatedData, context);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json(successResponse({ user: result.user }, 'Login successful'));
  };

  logout = async (req: Request, res: Response) => {
    const refreshToken = readCookie(req, REFRESH_COOKIE) ?? req.body?.refreshToken;
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } finally {
      clearAuthCookies(res);
    }
    res.status(200).json(successResponse(null, 'Logout successful'));
  };

  refreshToken = async (req: Request, res: Response) => {
    const refreshToken = readCookie(req, REFRESH_COOKIE) ?? refreshTokenSchema.parse(req.body).refreshToken;
    const result = await authService.refreshToken(refreshToken);
    setAuthCookies(res, result.accessToken, result.refreshToken);
    res.status(200).json(successResponse({ refreshed: true }, 'Session refreshed successfully'));
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(email);
    // Even if user not found, return status success for security
    res.status(200).json(successResponse(result, 'If the email exists, password reset instructions will be sent'));
  };

  resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    await authService.resetPassword(token, newPassword);
    res.status(200).json(successResponse(null, 'Password reset successful'));
  };

  verifyEmail = async (req: Request, res: Response) => {
    const token = req.body?.token;
    if (!token || typeof token !== 'string') {
      res.status(400).json({ success: false, message: 'Verification token is required' });
      return;
    }
    await authService.verifyEmail(token);
    res.status(200).json(successResponse(null, 'Email verified successfully'));
  };

  getMe = async (req: Request, res: Response) => {
    // req.user is set by gateway auth headers in gateway (X-User-Id) or locally by authentication middleware
    const userId = req.headers['x-user-id'] as string || (req.user?.userId);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const user = await authService.getMe(userId);
    res.status(200).json(successResponse(user, 'User profile retrieved'));
  };

  changePassword = async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string || (req.user?.userId);
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' });
      return;
    }
    await authService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json(successResponse(null, 'Password changed successfully'));
  };

  resendVerification = async (req: Request, res: Response) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await authService.resendVerification(email);
    res.status(200).json(successResponse(result, 'If the email exists and is unverified, verification instructions will be sent'));
  };
}

export const authController = new AuthController();
export default authController;

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
    res.status(200).json(successResponse(result, 'Login successful'));
  };

  logout = async (req: Request, res: Response) => {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    await authService.logout(refreshToken);
    res.status(200).json(successResponse(null, 'Logout successful'));
  };

  refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    const result = await authService.refreshToken(refreshToken);
    res.status(200).json(successResponse(result, 'Tokens refreshed successfully'));
  };

  forgotPassword = async (req: Request, res: Response) => {
    const { email } = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(email);
    // Even if user not found, return status success for security
    res.status(200).json(successResponse(result, 'If the email exists, a password reset token was generated'));
  };

  resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    await authService.resetPassword(token, newPassword);
    res.status(200).json(successResponse(null, 'Password reset successful'));
  };

  verifyEmail = async (req: Request, res: Response) => {
    const token = req.query.token as string || req.body.token;
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
}

export const authController = new AuthController();
export default authController;

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../src/repositories/user.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

import { AuthService } from '../../src/services/auth.service';
import { userRepository } from '../../src/repositories/user.repository';

const mockUserRepo = userRepository as jest.Mocked<typeof userRepository>;
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@test.com',
  passwordHash: 'hashed',
  role: 'CUSTOMER' as any,
  status: 'ACTIVE' as any,
  emailVerified: false,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, status: 202 } as Response);
  });

  describe('register', () => {
    it('creates a new user when email is not taken', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(mockUser);
      mockUserRepo.createEmailVerificationToken.mockResolvedValue({} as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

      const result = await service.register({ name: 'Test', email: 'test@test.com', password: 'pass123' });

      expect(result.email).toBe('test@test.com');
      expect(result).not.toHaveProperty('emailVerificationToken');
      expect(mockUserRepo.create).toHaveBeenCalledTimes(1);
      expect(mockUserRepo.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'CUSTOMER' }));
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/notifications/internal/auth-email'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('throws ValidationError when email already exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register({ name: 'Test', email: 'test@test.com', password: 'pass123' }))
        .rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('returns tokens on valid credentials', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');
      mockUserRepo.saveRefreshToken.mockResolvedValue({} as any);
      mockUserRepo.createLoginHistory.mockResolvedValue({} as any);
      mockUserRepo.updateLastLogin.mockResolvedValue({} as any);

      const result = await service.login({ email: 'test@test.com', password: 'pass123' });

      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('throws UnauthorizedError for non-existent user', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'none@none.com', password: 'pass' }))
        .rejects.toThrow('Invalid email or password');
    });

    it('throws UnauthorizedError for inactive user', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ ...mockUser, status: 'SUSPENDED' as any });

      await expect(service.login({ email: 'test@test.com', password: 'pass' }))
        .rejects.toThrow('suspended');
    });

    it('throws UnauthorizedError for wrong password', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toThrow('Invalid email or password');
    });
  });

  describe('logout', () => {
    it('revokes existing refresh token', async () => {
      mockUserRepo.findRefreshToken.mockResolvedValue({ token: 'tok', isRevoked: false } as any);
      mockUserRepo.revokeRefreshToken.mockResolvedValue({} as any);

      await service.logout('tok');
      expect(mockUserRepo.revokeRefreshToken).toHaveBeenCalledWith('tok');
    });

    it('throws NotFoundError when token does not exist', async () => {
      mockUserRepo.findRefreshToken.mockResolvedValue(null);

      await expect(service.logout('bad-token')).rejects.toThrow('Token not found');
    });
  });

  describe('forgotPassword', () => {
    it('does not expose a reset token for an existing email', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);
      mockUserRepo.createPasswordResetToken.mockResolvedValue({} as any);

      const result = await service.forgotPassword('test@test.com');
      expect(result).toEqual({ accepted: true });
      expect(result).not.toHaveProperty('resetToken');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('returns the same generic result for a non-existent email', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('no@no.com');
      expect(result).toEqual({ accepted: true });
      expect(result).not.toHaveProperty('resetToken');
      expect(mockUserRepo.createPasswordResetToken).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('updates password for valid token', async () => {
      const future = new Date(Date.now() + 3600000);
      mockUserRepo.findPasswordResetToken.mockResolvedValue({ isUsed: false, expiresAt: future, userId: 'user-1' } as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      mockUserRepo.update.mockResolvedValue({} as any);
      mockUserRepo.usePasswordResetToken.mockResolvedValue({} as any);

      await service.resetPassword('valid-token', 'newPass123');
      expect(mockUserRepo.update).toHaveBeenCalledWith('user-1', { passwordHash: 'new-hash' });
    });

    it('throws for invalid token', async () => {
      mockUserRepo.findPasswordResetToken.mockResolvedValue(null);

      await expect(service.resetPassword('bad', 'newPass')).rejects.toThrow('Invalid or expired reset token');
    });

    it('throws for already used token', async () => {
      mockUserRepo.findPasswordResetToken.mockResolvedValue({ isUsed: true, expiresAt: new Date(), userId: 'u1' } as any);

      await expect(service.resetPassword('used', 'newPass')).rejects.toThrow('already been used');
    });

    it('throws for expired token', async () => {
      const past = new Date(Date.now() - 1000);
      mockUserRepo.findPasswordResetToken.mockResolvedValue({ isUsed: false, expiresAt: past, userId: 'u1' } as any);

      await expect(service.resetPassword('exp', 'newPass')).rejects.toThrow('expired');
    });
  });

  describe('resendVerification', () => {
    it('returns the same generic result for missing and verified accounts', async () => {
      mockUserRepo.findByEmail.mockResolvedValueOnce(null);
      await expect(service.resendVerification('missing@test.com'))
        .resolves.toEqual({ accepted: true });

      mockUserRepo.findByEmail.mockResolvedValueOnce({ ...mockUser, emailVerified: true });
      await expect(service.resendVerification('verified@test.com'))
        .resolves.toEqual({ accepted: true });

      expect(mockUserRepo.createEmailVerificationToken).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('returns user for valid userId', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await service.getMe('user-1');
      expect(result.id).toBe('user-1');
      expect(result.email).toBe('test@test.com');
    });

    it('throws NotFoundError for unknown userId', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(service.getMe('unknown')).rejects.toThrow('User not found');
    });
  });
});

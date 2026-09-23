import { prisma } from '../prisma/client';
import { Prisma, Status } from '../generated/client';
import crypto from 'crypto';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: Status) {
    return prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async countByFilter(where: Prisma.UserWhereInput) {
    return prisma.user.count({ where });
  }

  async findAndCountAll(params: { skip: number; take: number; role?: string; status?: string }) {
    const where: Prisma.UserWhereInput = {};
    if (params.role) where.role = params.role as any;
    if (params.status) where.status = params.status as any;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  // Refresh Token
  async saveRefreshToken(token: string, userId: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: {
        token: hashToken(token),
        userId,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token: hashToken(token) },
    });
  }

  async revokeRefreshToken(token: string) {
    return prisma.refreshToken.update({
      where: { token: hashToken(token) },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
  }

  // Password Reset Token
  async createPasswordResetToken(token: string, userId: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: {
        token: hashToken(token),
        userId,
        expiresAt,
      },
    });
  }

  async findPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({
      where: { token: hashToken(token) },
    });
  }

  async usePasswordResetToken(token: string) {
    return prisma.passwordResetToken.update({
      where: { token: hashToken(token) },
      data: { isUsed: true },
    });
  }

  // Email Verification Token
  async createEmailVerificationToken(token: string, userId: string, expiresAt: Date) {
    return prisma.emailVerificationToken.create({
      data: {
        token: hashToken(token),
        userId,
        expiresAt,
      },
    });
  }

  async findEmailVerificationToken(token: string) {
    return prisma.emailVerificationToken.findUnique({
      where: { token: hashToken(token) },
    });
  }

  async useEmailVerificationToken(token: string) {
    return prisma.emailVerificationToken.update({
      where: { token: hashToken(token) },
      data: { isUsed: true },
    });
  }

  // Login History
  async createLoginHistory(userId: string, ipAddress?: string, userAgent?: string) {
    return prisma.loginHistory.create({
      data: {
        userId,
        ipAddress,
        userAgent,
      },
    });
  }

  async updateLastLogin(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}

export const userRepository = new UserRepository();

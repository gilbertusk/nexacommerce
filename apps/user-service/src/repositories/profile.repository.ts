import { prisma } from '../prisma/client';
import { UserProfile } from '../generated/client';

export class ProfileRepository {
  async findByUserId(userId: string) {
    return prisma.userProfile.findUnique({
      where: { userId },
    });
  }

  async upsert(userId: string, data: { displayName?: string; phone?: string; avatar?: string; gender?: string; dateOfBirth?: Date }) {
    return prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }
}

export const profileRepository = new ProfileRepository();
export default profileRepository;

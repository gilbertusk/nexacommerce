jest.mock('../../src/repositories/seller.repository', () => ({
  sellerRepository: {
    findById: jest.fn(),
    updateById: jest.fn(),
  },
}));

import { sellerRepository } from '../../src/repositories/seller.repository';
import { userService } from '../../src/services/user.service';

describe('seller moderation status', () => {
  beforeEach(() => jest.clearAllMocks());

  it('persists approval status and verification metadata', async () => {
    jest.mocked(sellerRepository.findById).mockResolvedValue({ id: 'profile-1' } as never);
    jest.mocked(sellerRepository.updateById).mockImplementation(async (_id, data) => data as never);

    const result = await userService.updateSellerProfileStatus('profile-1', 'ACTIVE');

    expect(result).toMatchObject({ status: 'ACTIVE', isVerified: true });
    expect(result.verifiedAt).toBeInstanceOf(Date);
  });

  it('persists rejection without marking the seller verified', async () => {
    jest.mocked(sellerRepository.findById).mockResolvedValue({ id: 'profile-1' } as never);
    jest.mocked(sellerRepository.updateById).mockImplementation(async (_id, data) => data as never);

    const result = await userService.updateSellerProfileStatus('profile-1', 'REJECTED');

    expect(result).toEqual({ status: 'REJECTED', isVerified: false, verifiedAt: null });
  });

  it('rejects statuses outside the moderation lifecycle', async () => {
    jest.mocked(sellerRepository.findById).mockResolvedValue({ id: 'profile-1' } as never);

    await expect(userService.updateSellerProfileStatus('profile-1', 'APPROVED')).rejects.toThrow(
      'Invalid seller profile status',
    );
    expect(sellerRepository.updateById).not.toHaveBeenCalled();
  });
});

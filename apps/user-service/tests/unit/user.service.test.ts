jest.mock('../../src/repositories/seller.repository', () => ({
  sellerRepository: {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    updateById: jest.fn(),
    setDispatchOrigin: jest.fn(),
    setDispatchOriginVerification: jest.fn(),
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

describe('seller dispatch origin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('saves a seller-submitted origin without verifying it', async () => {
    // Arrange
    jest.mocked(sellerRepository.findByUserId).mockResolvedValue({ id: 'profile-1' } as never);
    jest.mocked(sellerRepository.setDispatchOrigin).mockResolvedValue({} as never);

    // Act
    await userService.setSellerDispatchOrigin('seller-1', 'Bandung', 'Jawa Barat');

    // Assert: the repository clears verification, so a seller cannot
    // self-certify the location that prices a customer's shipping.
    expect(sellerRepository.setDispatchOrigin).toHaveBeenCalledWith(
      'seller-1',
      'Bandung',
      'Jawa Barat',
    );
    expect(sellerRepository.setDispatchOriginVerification).not.toHaveBeenCalled();
  });

  it('rejects a seller origin submission for a profile that does not exist', async () => {
    // Arrange
    jest.mocked(sellerRepository.findByUserId).mockResolvedValue(null as never);

    // Act + Assert
    await expect(
      userService.setSellerDispatchOrigin('seller-1', 'Bandung', 'Jawa Barat'),
    ).rejects.toThrow('Seller profile not found');
  });

  it('lets an administrator verify a submitted origin', async () => {
    // Arrange
    jest
      .mocked(sellerRepository.findById)
      .mockResolvedValue({ id: 'profile-1', originCity: 'Bandung', originProvince: 'Jawa Barat' } as never);
    jest.mocked(sellerRepository.setDispatchOriginVerification).mockResolvedValue({} as never);

    // Act
    await userService.verifySellerDispatchOrigin('profile-1', true);

    // Assert
    expect(sellerRepository.setDispatchOriginVerification).toHaveBeenCalledWith('profile-1', true);
  });

  it('refuses to verify an origin that was never provided', async () => {
    // Arrange
    jest
      .mocked(sellerRepository.findById)
      .mockResolvedValue({ id: 'profile-1', originCity: null, originProvince: null } as never);

    // Act + Assert
    await expect(userService.verifySellerDispatchOrigin('profile-1', false)).resolves.toBeDefined();
    await expect(userService.verifySellerDispatchOrigin('profile-1', true)).rejects.toThrow(
      /has not been provided/,
    );
  });
});

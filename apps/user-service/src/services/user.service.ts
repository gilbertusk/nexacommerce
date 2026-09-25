import { profileRepository } from '../repositories/profile.repository';
import { sellerRepository } from '../repositories/seller.repository';
import { addressRepository } from '../repositories/address.repository';
import { config } from '../config';
import { AppError, NotFoundError, ValidationError, ConflictError, ForbiddenError, buildInternalServiceHeaders } from '@nexacommerce/common';

export class UserService {
  // --- Profile ---
  async getProfile(userId: string) {
    let profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      // Return a virtual empty profile structure
      return {
        userId,
        displayName: null,
        phone: null,
        avatar: null,
        gender: null,
        dateOfBirth: null,
      };
    }
    return profile;
  }

  async updateProfile(userId: string, data: { displayName?: string; phone?: string; avatar?: string; gender?: string; dateOfBirth?: Date }) {
    return profileRepository.upsert(userId, data);
  }

  // --- Auth Service Internal Calls ---
  private async makeAuthRequest(path: string, method: string, body?: any) {
    const url = `${config.authServiceUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...buildInternalServiceHeaders('user-service'),
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const resBody = await response.json() as any;
      if (!response.ok) {
        const statusCode = response.status >= 500 ? 502 : response.status;
        throw new AppError(resBody.message || 'Auth Service request failed', statusCode);
      }
      return resBody.data;
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError('Auth Service unavailable', 502);
    }
  }

  // --- Admin Methods ---
  async listUsers(query: { page?: number; limit?: number; role?: string; status?: string }) {
    const queryString = new URLSearchParams(query as any).toString();
    const result = await this.makeAuthRequest(`/auth/internal/users?${queryString}`, 'GET');

    const users = result.items || [];
    const enrichedUsers = await Promise.all(
      users.map(async (user: any) => {
        const profile = await profileRepository.findByUserId(user.id);
        return {
          ...user,
          profile: profile || null,
        };
      })
    );

    return {
      ...result,
      items: enrichedUsers,
    };
  }

  async getUserById(id: string) {
    const user = await this.makeAuthRequest(`/auth/internal/users/${id}`, 'GET');
    const profile = await profileRepository.findByUserId(id);
    return {
      ...user,
      profile: profile || null,
    };
  }

  async updateUserStatus(id: string, status: string) {
    return this.makeAuthRequest(`/auth/internal/users/${id}/status`, 'PATCH', { status });
  }

  // --- Addresses ---
  async getAddresses(userId: string) {
    return addressRepository.findByUserId(userId);
  }

  async createAddress(userId: string, data: any) {
    const addressCount = await addressRepository.countByUserId(userId);
    
    // First address is always default
    if (addressCount === 0) {
      data.isDefault = true;
    }

    if (data.isDefault) {
      await addressRepository.unsetDefaults(userId);
    }

    return addressRepository.create(userId, data);
  }

  async updateAddress(userId: string, addressId: string, data: any) {
    const address = await addressRepository.findById(addressId);
    if (!address) {
      throw new NotFoundError('Address not found');
    }
    if (address.userId !== userId) {
      throw new ForbiddenError('You do not own this address');
    }

    if (data.isDefault) {
      await addressRepository.unsetDefaults(userId, addressId);
    }

    return addressRepository.update(addressId, data);
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await addressRepository.findById(addressId);
    if (!address) {
      throw new NotFoundError('Address not found');
    }
    if (address.userId !== userId) {
      throw new ForbiddenError('You do not own this address');
    }

    const totalAddresses = await addressRepository.countByUserId(userId);

    if (address.isDefault) {
      if (totalAddresses === 1) {
        throw new ValidationError('Cannot delete the only address if it is set as default.');
      }
      
      // If we have other addresses, delete this one and make the first remaining address default
      await addressRepository.delete(addressId);
      const remaining = await addressRepository.findByUserId(userId);
      if (remaining.length > 0) {
        await addressRepository.update(remaining[0].id, { isDefault: true });
      }
    } else {
      await addressRepository.delete(addressId);
    }

    return { id: addressId };
  }

  // --- Seller Profiles ---
  /**
   * Dispatch origins for shipping quotes.
   *
   * Every requested seller appears in the result. `dispatchReady` is true only
   * for an active seller with a verified structured origin, so the caller can
   * refuse a quote and name the seller responsible instead of substituting a
   * default location.
   */
  async getDispatchOrigins(sellerIds: string[]) {
    const profiles = await sellerRepository.findDispatchOrigins(sellerIds);
    const byUserId = new Map(profiles.map((p) => [p.userId, p]));

    return sellerIds.map((sellerId) => {
      const profile = byUserId.get(sellerId);
      const dispatchReady = Boolean(
        profile &&
          profile.status === 'ACTIVE' &&
          profile.originCity &&
          profile.originProvince &&
          profile.originVerifiedAt,
      );
      return {
        sellerId,
        storeName: profile?.storeName ?? null,
        status: profile?.status ?? null,
        originCity: dispatchReady ? profile!.originCity : null,
        originProvince: dispatchReady ? profile!.originProvince : null,
        dispatchReady,
      };
    });
  }

  async createSellerProfile(userId: string, data: any) {
    const existing = await sellerRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictError('Seller profile already exists for this user');
    }
    return sellerRepository.create(userId, data);
  }

  async getSellerProfile(userId: string) {
    const profile = await sellerRepository.findByUserId(userId);
    if (!profile) {
      throw new NotFoundError('Seller profile not found');
    }
    return profile;
  }

  async updateSellerProfile(userId: string, data: any) {
    const existing = await sellerRepository.findByUserId(userId);
    if (!existing) {
      throw new NotFoundError('Seller profile not found');
    }
    return sellerRepository.update(userId, data);
  }

  /**
   * Set the seller's own dispatch origin. Always leaves it unverified, so a
   * seller cannot self-certify the location that prices customer shipping.
   */
  async setSellerDispatchOrigin(userId: string, originCity: string, originProvince: string) {
    const existing = await sellerRepository.findByUserId(userId);
    if (!existing) {
      throw new NotFoundError('Seller profile not found');
    }
    return sellerRepository.setDispatchOrigin(userId, originCity, originProvince);
  }

  /** Administrator decision on a proposed dispatch origin. */
  async verifySellerDispatchOrigin(id: string, verified: boolean) {
    const profile = await sellerRepository.findById(id);
    if (!profile) {
      throw new NotFoundError('Seller profile not found');
    }
    if (verified && (!profile.originCity || !profile.originProvince)) {
      throw new ValidationError('Cannot verify a dispatch origin that has not been provided');
    }
    return sellerRepository.setDispatchOriginVerification(id, verified);
  }

  async getAddressById(addressId: string) {
    return addressRepository.findById(addressId);
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await addressRepository.findById(addressId);
    if (!address) {
      throw new NotFoundError('Address not found');
    }
    if (address.userId !== userId) {
      throw new ForbiddenError('You do not own this address');
    }

    await addressRepository.unsetDefaults(userId);
    return addressRepository.update(addressId, { isDefault: true });
  }

  async listSellerProfiles(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      sellerRepository.findAll({ skip, take: limit }),
      sellerRepository.countAll(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateSellerProfileStatus(id: string, status: string) {
    const profile = await sellerRepository.findById(id);
    if (!profile) {
      throw new NotFoundError('Seller profile not found');
    }

    if (!['ACTIVE', 'REJECTED', 'SUSPENDED'].includes(status)) {
      throw new ValidationError('Invalid seller profile status');
    }

    const isVerified = status === 'ACTIVE';
    const updateData = {
      status,
      isVerified,
      verifiedAt: isVerified ? new Date() : null,
    };

    return sellerRepository.updateById(id, updateData);
  }
}

export const userService = new UserService();
export default userService;

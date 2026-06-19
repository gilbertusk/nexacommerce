import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dateOfBirth: z.preprocess((arg) => {
    if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
  }, z.date()).optional(),
});

export const createAddressSchema = z.object({
  label: z.string().min(2, 'Label is required'),
  recipientName: z.string().min(2, 'Recipient name is required'),
  phone: z.string().min(5, 'Phone is required'),
  street: z.string().min(5, 'Street is required'),
  city: z.string().min(2, 'City is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export const createSellerProfileSchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  storeDescription: z.string().optional(),
  storeLogo: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  storeBanner: z.string().url('Invalid banner URL').optional().or(z.literal('')),
  storeAddress: z.string().optional(),
});

import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { successResponse } from '@nexacommerce/common';
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
  createSellerProfileSchema,
} from '@nexacommerce/validation';

export class UserController {
  // --- Profile ---
  getProfile = async (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User ID header is missing' });
      return;
    }
    const profile = await userService.getProfile(userId);
    res.status(200).json(successResponse(profile, 'User profile retrieved successfully'));
  };

  updateProfile = async (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User ID header is missing' });
      return;
    }
    const validatedData = updateProfileSchema.parse(req.body);
    const profile = await userService.updateProfile(userId, validatedData);
    res.status(200).json(successResponse(profile, 'User profile updated successfully'));
  };

  // --- Admin ---
  listUsers = async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const role = req.query.role as string;
    const status = req.query.status as string;

    const result = await userService.listUsers({ page, limit, role, status });
    res.status(200).json(successResponse(result, 'Users list retrieved successfully'));
  };

  getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.status(200).json(successResponse(user, 'User details retrieved successfully'));
  };

  updateUserStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ success: false, message: 'Status is required' });
      return;
    }
    const result = await userService.updateUserStatus(id, status);
    res.status(200).json(successResponse(result, 'User status updated successfully'));
  };

  // --- Addresses ---
  getAddresses = async (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User ID header is missing' });
      return;
    }
    const addresses = await userService.getAddresses(userId);
    res.status(200).json(successResponse(addresses, 'User addresses retrieved successfully'));
  };

  createAddress = async (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User ID header is missing' });
      return;
    }
    const validatedData = createAddressSchema.parse(req.body);
    const address = await userService.createAddress(userId, validatedData);
    res.status(201).json(successResponse(address, 'Address created successfully'));
  };

  updateAddress = async (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User ID header is missing' });
      return;
    }
    const { id } = req.params;
    const validatedData = updateAddressSchema.parse(req.body);
    const address = await userService.updateAddress(userId, id, validatedData);
    res.status(200).json(successResponse(address, 'Address updated successfully'));
  };

  deleteAddress = async (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User ID header is missing' });
      return;
    }
    const { id } = req.params;
    const result = await userService.deleteAddress(userId, id);
    res.status(200).json(successResponse(result, 'Address deleted successfully'));
  };

  // --- Seller Profiles ---
  createSellerProfile = async (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User ID header is missing' });
      return;
    }
    const validatedData = createSellerProfileSchema.parse(req.body);
    const profile = await userService.createSellerProfile(userId, validatedData);
    res.status(201).json(successResponse(profile, 'Seller profile created successfully'));
  };

  getSellerProfile = async (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User ID header is missing' });
      return;
    }
    const profile = await userService.getSellerProfile(userId);
    res.status(200).json(successResponse(profile, 'Seller profile retrieved successfully'));
  };

  updateSellerProfile = async (req: Request, res: Response) => {
    const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'User ID header is missing' });
      return;
    }
    const validatedData = createSellerProfileSchema.partial().parse(req.body);
    const profile = await userService.updateSellerProfile(userId, validatedData);
    res.status(200).json(successResponse(profile, 'Seller profile updated successfully'));
  };
}

export const userController = new UserController();
export default userController;

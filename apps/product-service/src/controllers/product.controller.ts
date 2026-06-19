import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { successResponse } from '@nexacommerce/common';
import {
  createCategorySchema,
  createBrandSchema,
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '@nexacommerce/validation';

export class ProductController {
  // --- Category ---
  async getCategories(req: Request, res: Response) {
    const categories = await productService.getCategories();
    res.status(200).json(successResponse(categories, 'Categories retrieved successfully'));
  }

  async createCategory(req: Request, res: Response) {
    const validatedData = createCategorySchema.parse(req.body);
    const category = await productService.createCategory(validatedData);
    res.status(201).json(successResponse(category, 'Category created successfully'));
  }

  // --- Brand ---
  async getBrands(req: Request, res: Response) {
    const brands = await productService.getBrands();
    res.status(200).json(successResponse(brands, 'Brands retrieved successfully'));
  }

  async createBrand(req: Request, res: Response) {
    const validatedData = createBrandSchema.parse(req.body);
    const brand = await productService.createBrand(validatedData);
    res.status(201).json(successResponse(brand, 'Brand created successfully'));
  }

  async updateBrand(req: Request, res: Response) {
    const { id } = req.params;
    const validatedData = createBrandSchema.partial().parse(req.body);
    const brand = await productService.updateBrand(id, validatedData);
    res.status(200).json(successResponse(brand, 'Brand updated successfully'));
  }

  async deleteBrand(req: Request, res: Response) {
    const { id } = req.params;
    await productService.deleteBrand(id);
    res.status(200).json(successResponse(null, 'Brand deleted successfully'));
  }

  // --- Product ---
  async getProducts(req: Request, res: Response) {
    const query = productQuerySchema.parse(req.query);
    const result = await productService.getProducts(query);
    res.status(200).json(successResponse(result, 'Products retrieved successfully'));
  }

  async getProductById(req: Request, res: Response) {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json(successResponse(product, 'Product retrieved successfully'));
  }

  async createProduct(req: Request, res: Response) {
    const userId = req.headers['x-user-id'] as string;
    const data = {
      ...req.body,
      sellerId: req.body.sellerId || userId,
    };
    const validatedData = createProductSchema.parse(data);
    const product = await productService.createProduct(validatedData);
    res.status(201).json(successResponse(product, 'Product created successfully'));
  }

  async updateProduct(req: Request, res: Response) {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const validatedData = updateProductSchema.parse(req.body);
    const product = await productService.updateProduct(req.params.id, actor, validatedData);
    res.status(200).json(successResponse(product, 'Product updated successfully'));
  }

  async deleteProduct(req: Request, res: Response) {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    await productService.deleteProduct(req.params.id, actor);
    res.status(200).json(successResponse(null, 'Product deleted successfully'));
  }

  // --- Product Images ---
  async addProductImage(req: Request, res: Response) {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const { url, alt, sortOrder, isMain } = req.body;
    if (!url) {
      res.status(400).json({ success: false, message: 'Image URL is required' });
      return;
    }

    const image = await productService.addProductImage(req.params.id, actor, { url, alt, sortOrder, isMain });
    res.status(201).json(successResponse(image, 'Product image added successfully'));
  }

  async updateProductImage(req: Request, res: Response) {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const { imageId } = req.params;
    const { alt, sortOrder, isMain } = req.body;

    const image = await productService.updateProductImage(req.params.id, imageId, actor, { alt, sortOrder, isMain });
    res.status(200).json(successResponse(image, 'Product image updated successfully'));
  }

  async deleteProductImage(req: Request, res: Response) {
    const userId = req.headers['x-user-id'] as string;
    const userRole = req.headers['x-user-role'] as string;
    const actor = { userId, role: userRole };

    const { imageId } = req.params;
    const result = await productService.deleteProductImage(req.params.id, imageId, actor);
    res.status(200).json(successResponse(result, 'Product image deleted successfully'));
  }
}

export const productController = new ProductController();
export default productController;

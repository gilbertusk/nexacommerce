jest.mock('../../src/repositories/product.repository');
jest.mock('../../src/repositories/category.repository');
jest.mock('../../src/repositories/brand.repository');
jest.mock('../../src/services/product-media-storage.service', () => ({
  productMediaStorage: {
    uploadProductImage: jest.fn(),
    deleteProductImageByUrl: jest.fn(),
  },
}));

import { ProductService } from '../../src/services/product.service';
import { productRepository } from '../../src/repositories/product.repository';
import { categoryRepository } from '../../src/repositories/category.repository';
import { brandRepository } from '../../src/repositories/brand.repository';
import { productMediaStorage } from '../../src/services/product-media-storage.service';

const mockProductRepo = productRepository as jest.Mocked<typeof productRepository>;
const mockCategoryRepo = categoryRepository as jest.Mocked<typeof categoryRepository>;
const mockBrandRepo = brandRepository as jest.Mocked<typeof brandRepository>;
const mockMediaStorage = productMediaStorage as jest.Mocked<typeof productMediaStorage>;

const mockProduct = {
  id: 'prod-1', name: 'Test Product', slug: 'test-product', description: 'desc',
  price: 100000, stock: 10, weight: 500, status: 'ACTIVE' as any,
  sellerId: 'seller-1', categoryId: 'cat-1', brandId: null,
  rating: 0, totalReviews: 0, createdAt: new Date(), updatedAt: new Date(),
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    service = new ProductService();
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('creates category when slug is unique', async () => {
      mockCategoryRepo.findBySlug.mockResolvedValue(null);
      mockCategoryRepo.create.mockResolvedValue({ id: 'cat-1', name: 'Electronics', slug: 'electronics' } as any);

      const result = await service.createCategory({ name: 'Electronics', slug: 'electronics' });
      expect(result.slug).toBe('electronics');
    });

    it('throws ConflictError when slug exists', async () => {
      mockCategoryRepo.findBySlug.mockResolvedValue({ id: 'cat-1' } as any);

      await expect(service.createCategory({ name: 'Dup', slug: 'electronics' }))
        .rejects.toThrow('Category slug already exists');
    });
  });

  describe('createBrand', () => {
    it('creates brand when slug is unique', async () => {
      mockBrandRepo.findBySlug.mockResolvedValue(null);
      mockBrandRepo.create.mockResolvedValue({ id: 'brand-1', name: 'Nike', slug: 'nike' } as any);

      const result = await service.createBrand({ name: 'Nike', slug: 'nike' });
      expect(result.name).toBe('Nike');
    });

    it('throws ConflictError when slug exists', async () => {
      mockBrandRepo.findBySlug.mockResolvedValue({ id: 'b1' } as any);

      await expect(service.createBrand({ name: 'Dup', slug: 'nike' }))
        .rejects.toThrow('Brand slug already exists');
    });
  });

  describe('createProduct', () => {
    it('creates product successfully', async () => {
      mockCategoryRepo.findById.mockResolvedValue({ id: 'cat-1' } as any);
      mockProductRepo.findBySlug.mockResolvedValue(null);
      mockProductRepo.create.mockResolvedValue(mockProduct as any);

      const result = await service.createProduct({
        name: 'Test', slug: 'test-product', description: 'desc',
        price: 100000, stock: 10, weight: 500, categoryId: 'cat-1', sellerId: 'seller-1',
      });
      expect(result.id).toBe('prod-1');
    });

    it('throws NotFoundError when category does not exist', async () => {
      mockCategoryRepo.findById.mockResolvedValue(null);

      await expect(service.createProduct({
        name: 'Test', slug: 'test', description: 'desc',
        price: 100, stock: 1, weight: 100, categoryId: 'bad-cat', sellerId: 'seller-1',
      })).rejects.toThrow('Category not found');
    });

    it('throws ConflictError when slug already exists', async () => {
      mockCategoryRepo.findById.mockResolvedValue({ id: 'cat-1' } as any);
      mockProductRepo.findBySlug.mockResolvedValue(mockProduct as any);

      await expect(service.createProduct({
        name: 'Test', slug: 'test-product', description: 'desc',
        price: 100, stock: 1, weight: 100, categoryId: 'cat-1', sellerId: 'seller-1',
      })).rejects.toThrow('Product slug already exists');
    });
  });

  describe('getProductById', () => {
    it('returns product when found', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct as any);

      const result = await service.getProductById('prod-1');
      expect(result.id).toBe('prod-1');
    });

    it('throws NotFoundError when product does not exist', async () => {
      mockProductRepo.findById.mockResolvedValue(null);

      await expect(service.getProductById('bad')).rejects.toThrow('Product not found');
    });
  });

  describe('addProductImage', () => {
    it('rejects non-HTTPS or credential-bearing image URLs before repository access', async () => {
      await expect(service.addProductImage('prod-1', { userId: 'seller-1', role: 'SELLER' }, {
        url: 'http://images.example/item.jpg',
      })).rejects.toThrow('HTTPS URL');
      await expect(service.addProductImage('prod-1', { userId: 'seller-1', role: 'SELLER' }, {
        url: 'https://user:password@images.example/item.jpg',
      })).rejects.toThrow('HTTPS URL');
      expect(mockProductRepo.findById).not.toHaveBeenCalled();
    });

    it('adds a valid HTTPS image for the owning seller', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct as any);
      mockProductRepo.countImages.mockResolvedValue(0);
      mockProductRepo.addImage.mockResolvedValue({ id: 'image-1', url: 'https://images.example/item.jpg' } as any);

      const result = await service.addProductImage('prod-1', { userId: 'seller-1', role: 'SELLER' }, {
        url: 'https://images.example/item.jpg',
      });

      expect(mockProductRepo.addImage).toHaveBeenCalledWith('prod-1', expect.objectContaining({ isMain: true }));
      expect(result.id).toBe('image-1');
    });
  });

  describe('uploadProductImage', () => {
    it('stores a normalized image and creates the first image as main for the product owner', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct as any);
      mockMediaStorage.uploadProductImage.mockResolvedValue({
        key: 'products/prod-1/image.webp',
        url: 'https://cdn.example.com/products/prod-1/image.webp',
      });
      mockProductRepo.countImages.mockResolvedValue(0);
      mockProductRepo.unsetMainImages.mockResolvedValue({ count: 0 } as any);
      mockProductRepo.addImage.mockResolvedValue({ id: 'image-1', isMain: true } as any);

      const result = await service.uploadProductImage('prod-1', { userId: 'seller-1', role: 'SELLER' }, {
        buffer: Buffer.from('image'), size: 5,
      });

      expect(mockMediaStorage.uploadProductImage).toHaveBeenCalledWith('prod-1', expect.objectContaining({ size: 5 }));
      expect(mockProductRepo.addImage).toHaveBeenCalledWith('prod-1', expect.objectContaining({
        url: 'https://cdn.example.com/products/prod-1/image.webp', isMain: true, sortOrder: 0,
      }));
      expect(result.id).toBe('image-1');
    });

    it('rejects another seller before storing bytes', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct as any);

      await expect(service.uploadProductImage('prod-1', { userId: 'seller-2', role: 'SELLER' }, {
        buffer: Buffer.from('image'), size: 5,
      })).rejects.toThrow('not authorized');
      expect(mockMediaStorage.uploadProductImage).not.toHaveBeenCalled();
    });

    it('removes the uploaded object if saving image metadata fails', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct as any);
      mockMediaStorage.uploadProductImage.mockResolvedValue({
        key: 'products/prod-1/image.webp',
        url: 'https://cdn.example.com/products/prod-1/image.webp',
      });
      mockProductRepo.countImages.mockResolvedValue(2);
      mockProductRepo.addImage.mockRejectedValue(new Error('database unavailable'));

      await expect(service.uploadProductImage('prod-1', { userId: 'seller-1', role: 'SELLER' }, {
        buffer: Buffer.from('image'), size: 5,
      })).rejects.toThrow('database unavailable');
      expect(mockMediaStorage.deleteProductImageByUrl).toHaveBeenCalledWith('https://cdn.example.com/products/prod-1/image.webp');
    });
  });

  describe('deleteProduct', () => {
    it('archives product when requester is the owner', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct as any);
      mockProductRepo.update.mockResolvedValue({ ...mockProduct, status: 'ARCHIVED' as any } as any);

      const result = await service.deleteProduct('prod-1', { userId: 'seller-1', role: 'SELLER' });
      expect(result.status).toBe('ARCHIVED');
    });

    it('throws ForbiddenError when requester is not the owner', async () => {
      mockProductRepo.findById.mockResolvedValue(mockProduct as any);

      await expect(service.deleteProduct('prod-1', { userId: 'other-seller', role: 'SELLER' }))
        .rejects.toThrow('authorized');
    });
  });
});

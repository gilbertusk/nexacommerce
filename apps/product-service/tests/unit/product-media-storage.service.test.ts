import sharp from 'sharp';

const mockSend = jest.fn();
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({ send: mockSend, destroy: jest.fn() })),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
  DeleteObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

import { ProductMediaStorageService } from '../../src/services/product-media-storage.service';

describe('ProductMediaStorageService', () => {
  const envKeys = [
    'MEDIA_S3_BUCKET', 'MEDIA_S3_ACCESS_KEY_ID', 'MEDIA_S3_SECRET_ACCESS_KEY',
    'MEDIA_PUBLIC_BASE_URL', 'MEDIA_S3_ENDPOINT', 'MEDIA_S3_REGION',
  ] as const;
  const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  const service = new ProductMediaStorageService();

  beforeEach(() => {
    mockSend.mockReset().mockResolvedValue({});
    process.env.MEDIA_S3_BUCKET = 'nexa-media';
    process.env.MEDIA_S3_ACCESS_KEY_ID = 'test-access';
    process.env.MEDIA_S3_SECRET_ACCESS_KEY = 'test-secret';
    process.env.MEDIA_PUBLIC_BASE_URL = 'https://cdn.example.com/assets';
    process.env.MEDIA_S3_ENDPOINT = 'http://127.0.0.1:9000';
    process.env.MEDIA_S3_REGION = 'ap-southeast-1';
  });

  afterAll(() => {
    for (const key of envKeys) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  });

  it('decodes and normalizes a valid PNG to WebP before storing', async () => {
    const input = await sharp({ create: { width: 16, height: 12, channels: 3, background: '#e5e7eb' } })
      .png().toBuffer();

    const result = await service.uploadProductImage('product-1', { buffer: input, size: input.length });

    expect(result.url).toMatch(/^https:\/\/cdn\.example\.com\/assets\/products\/product-1\/[\w-]+\.webp$/);
    expect(mockSend).toHaveBeenCalledTimes(1);
    const command = mockSend.mock.calls[0][0] as { input: { Bucket: string; ContentType: string; Body: Buffer; Key: string } };
    expect(command.input).toMatchObject({ Bucket: 'nexa-media', ContentType: 'image/webp' });
    expect(command.input.Key).toMatch(/^products\/product-1\//);
    expect((await sharp(command.input.Body).metadata()).format).toBe('webp');
  });

  it('rejects non-image bytes without contacting object storage', async () => {
    const input = Buffer.from('not an image');
    await expect(service.uploadProductImage('product-1', { buffer: input, size: input.length }))
      .rejects.toThrow('valid supported image');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('fails closed when required storage configuration is missing', async () => {
    const input = await sharp({ create: { width: 1, height: 1, channels: 3, background: '#fff' } }).png().toBuffer();
    delete process.env.MEDIA_S3_BUCKET;

    await expect(service.uploadProductImage('product-1', { buffer: input, size: input.length }))
      .rejects.toMatchObject({ statusCode: 503 });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('does not expose provider errors when object storage fails', async () => {
    const input = await sharp({ create: { width: 1, height: 1, channels: 3, background: '#fff' } }).png().toBuffer();
    mockSend.mockRejectedValueOnce(new Error('private endpoint and credentials detail'));

    await expect(service.uploadProductImage('product-1', { buffer: input, size: input.length }))
      .rejects.toThrow('Product media storage is unavailable');
  });

  it('rejects insecure object-storage endpoints in production', async () => {
    const input = await sharp({ create: { width: 1, height: 1, channels: 3, background: '#fff' } }).png().toBuffer();
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      await expect(service.uploadProductImage('product-1', { buffer: input, size: input.length }))
        .rejects.toMatchObject({ statusCode: 503 });
      expect(mockSend).not.toHaveBeenCalled();
    } finally {
      if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previousNodeEnv;
    }
  });
});

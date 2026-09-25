import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sharp, { Metadata, Sharp } from 'sharp';
import { AppError, ValidationError } from '@nexacommerce/common';
import { randomUUID } from 'crypto';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_INPUT_PIXELS = 40_000_000;
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp']);

type MediaConfig = {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
  endpoint?: string;
};

function readMediaConfig(): MediaConfig {
  const { MEDIA_S3_BUCKET, MEDIA_S3_ACCESS_KEY_ID, MEDIA_S3_SECRET_ACCESS_KEY, MEDIA_PUBLIC_BASE_URL } = process.env;
  if (!MEDIA_S3_BUCKET || !MEDIA_S3_ACCESS_KEY_ID || !MEDIA_S3_SECRET_ACCESS_KEY || !MEDIA_PUBLIC_BASE_URL) {
    throw new AppError('Product media storage is not configured', 503);
  }

  let publicBase: URL;
  try {
    publicBase = new URL(MEDIA_PUBLIC_BASE_URL);
  } catch {
    throw new AppError('Product media public URL configuration is invalid', 503);
  }
  if (
    !['http:', 'https:'].includes(publicBase.protocol) ||
    publicBase.username || publicBase.password || publicBase.search || publicBase.hash ||
    (process.env.NODE_ENV === 'production' && publicBase.protocol !== 'https:')
  ) {
    throw new AppError('Product media public URL configuration is invalid', 503);
  }

  const endpoint = process.env.MEDIA_S3_ENDPOINT;
  if (endpoint) {
    let parsedEndpoint: URL;
    try {
      parsedEndpoint = new URL(endpoint);
    } catch {
      throw new AppError('Product media S3 endpoint configuration is invalid', 503);
    }
    if (
      !['http:', 'https:'].includes(parsedEndpoint.protocol) || parsedEndpoint.username || parsedEndpoint.password ||
      (process.env.NODE_ENV === 'production' && parsedEndpoint.protocol !== 'https:')
    ) {
      throw new AppError('Product media S3 endpoint configuration is invalid', 503);
    }
  }

  return {
    bucket: MEDIA_S3_BUCKET,
    region: process.env.MEDIA_S3_REGION || 'ap-southeast-1',
    accessKeyId: MEDIA_S3_ACCESS_KEY_ID,
    secretAccessKey: MEDIA_S3_SECRET_ACCESS_KEY,
    publicBaseUrl: MEDIA_PUBLIC_BASE_URL.replace(/\/+$/, ''),
    ...(endpoint ? { endpoint } : {}),
  };
}

export function assertMediaStorageConfigured() {
  readMediaConfig();
}

export class ProductMediaStorageService {
  private client: S3Client | null = null;
  private clientConfig: MediaConfig | null = null;

  private getClient(config: MediaConfig) {
    if (
      this.client && this.clientConfig && this.clientConfig.endpoint === config.endpoint &&
      this.clientConfig.region === config.region && this.clientConfig.accessKeyId === config.accessKeyId &&
      this.clientConfig.secretAccessKey === config.secretAccessKey
    ) {
      return this.client;
    }
    this.client?.destroy();
    this.clientConfig = config;
    this.client = new S3Client({
      region: config.region,
      ...(config.endpoint ? { endpoint: config.endpoint, forcePathStyle: true } : {}),
      credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    });
    return this.client;
  }

  async uploadProductImage(productId: string, input: { buffer: Buffer; size: number }) {
    if (input.size <= 0 || input.size > MAX_UPLOAD_BYTES || input.buffer.length !== input.size) {
      throw new ValidationError('Image must be between 1 byte and 5 MB');
    }

    let image: Sharp;
    let metadata: Metadata;
    try {
      image = sharp(input.buffer, { limitInputPixels: MAX_INPUT_PIXELS, failOn: 'error', animated: false });
      metadata = await image.metadata();
    } catch {
      throw new ValidationError('Uploaded file is not a valid supported image');
    }

    if (
      !metadata.format || !ALLOWED_FORMATS.has(metadata.format) || !metadata.width || !metadata.height ||
      metadata.pages && metadata.pages > 1 || metadata.width * metadata.height > MAX_INPUT_PIXELS
    ) {
      throw new ValidationError('Only static JPEG, PNG, and WebP images up to 40 megapixels are supported');
    }

    let body: Buffer;
    try {
      body = await image.rotate().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 }).toBuffer();
    } catch {
      throw new ValidationError('Uploaded image could not be decoded');
    }

    const config = readMediaConfig();
    const key = `products/${productId}/${randomUUID()}.webp`;
    const url = `${config.publicBaseUrl}/${key.split('/').map(encodeURIComponent).join('/')}`;
    if (url.length > 2048) throw new AppError('Product media public URL configuration is too long', 503);
    try {
      await this.getClient(config).send(new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: body,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      }));
    } catch {
      throw new AppError('Product media storage is unavailable', 503);
    }

    return { key, url };
  }

  async deleteProductImageByUrl(imageUrl: string) {
    const publicBaseUrl = process.env.MEDIA_PUBLIC_BASE_URL;
    if (!publicBaseUrl) return;
    let image: URL;
    let base: URL;
    try {
      image = new URL(imageUrl);
      base = new URL(publicBaseUrl);
    } catch {
      return;
    }
    const basePath = base.pathname.replace(/\/+$/, '');
    if (image.origin !== base.origin || !image.pathname.startsWith(`${basePath}/`)) return;

    let key: string;
    try {
      key = image.pathname.slice(basePath.length + 1).split('/').map(decodeURIComponent).join('/');
    } catch {
      return;
    }
    if (!key.startsWith('products/') || key.includes('..')) return;
    const config = readMediaConfig();
    try {
      await this.getClient(config).send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
    } catch {
      throw new AppError('Product media storage is unavailable', 503);
    }
  }
}

export const productMediaStorage = new ProductMediaStorageService();

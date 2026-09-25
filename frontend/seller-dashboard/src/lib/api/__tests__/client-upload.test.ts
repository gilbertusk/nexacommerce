import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiUpload } from '../client';

describe('apiUpload', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends multipart data with session cookies and lets the browser set its boundary header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { id: 'image-1' } }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);
    const data = new FormData();
    data.append('image', new Blob(['image-bytes'], { type: 'image/png' }), 'image.png');

    const result = await apiUpload<{ success: boolean; data: { id: string } }>(
      '/api/v1/products/products/product-1/images/upload', data,
    );

    expect(result.data.id).toBe('image-1');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/products/products/product-1/images/upload'),
      expect.objectContaining({ method: 'POST', body: data, credentials: 'include' }),
    );
    const requestOptions = fetchMock.mock.calls[0][1] as RequestInit;
    expect(requestOptions.headers).toBeUndefined();
  });
});

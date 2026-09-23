const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  _sessionMarker?: string,
): Promise<T> {
  void _sessionMarker;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const message =
      (body as { message?: string; error?: string })?.message ??
      (body as { message?: string; error?: string })?.error ??
      `HTTP ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return body as T;
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { method: 'GET' }, token);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token);
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, token);
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, token);
}

export async function apiDelete<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' }, token);
}

export { ApiError };

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

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? body?.error ?? message;
    } catch {
      // ignore parse error, keep default message
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

function buildHeaders(_sessionMarker?: string): HeadersInit {
  void _sessionMarker;
  return {
    'Content-Type': 'application/json',
  };
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(token),
    cache: 'no-store',
    credentials: 'include',
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PATCH',
    headers: buildHeaders(token),
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(token),
    credentials: 'include',
  });
  return handleResponse<T>(res);
}

export { ApiError };

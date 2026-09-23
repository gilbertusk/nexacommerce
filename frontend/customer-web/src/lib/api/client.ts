const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface ApiErrorResponse {
  success: false;
  message?: string;
  error?: string;
}

function extractErrorMessage(body: ApiErrorResponse): string {
  return body.message ?? body.error ?? "Terjadi kesalahan pada server.";
}

async function request<T>(
  path: string,
  options: RequestInit,
  _sessionMarker?: string
): Promise<T> {
  void _sessionMarker;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string> | undefined),
    },
    credentials: "include",
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return undefined as T;
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(body as ApiErrorResponse));
  }

  return body as T;
}

export function apiGet<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { method: "GET" }, token);
}

export function apiPost<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
  return request<T>(
    path,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    token
  );
}

export function apiPut<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
  return request<T>(
    path,
    {
      method: "PUT",
      body: JSON.stringify(body),
    },
    token
  );
}

export function apiDelete<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { method: "DELETE" }, token);
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface ApiErrorResponse {
  success: false;
  message?: string;
  error?: string;
  /** Machine-readable cause, when the endpoint supplies one. */
  reason?: string;
  details?: unknown;
}

function extractErrorMessage(body: ApiErrorResponse): string {
  return body.message ?? body.error ?? "Terjadi kesalahan pada server.";
}

/**
 * An error carrying the server's machine-readable `reason`.
 *
 * Some endpoints refuse a request for a specific, actionable cause — a shipping
 * quote blocked because a seller has no verified origin, for example. Throwing a
 * bare Error would discard that and leave the UI with only prose to match on.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly reason?: string;
  readonly details?: unknown;

  constructor(message: string, status: number, reason?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.reason = reason;
    this.details = details;
  }
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
    const errorBody = body as ApiErrorResponse;
    throw new ApiError(
      extractErrorMessage(errorBody),
      response.status,
      errorBody.reason,
      errorBody.details,
    );
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

export function apiPostWithHeaders<T>(
  path: string,
  body: unknown,
  extraHeaders: Record<string, string>,
  token?: string
): Promise<T> {
  return request<T>(
    path,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: extraHeaders,
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

export function apiPatch<T>(
  path: string,
  body: unknown,
  token?: string
): Promise<T> {
  return request<T>(
    path,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
    token
  );
}

export function apiDelete<T>(path: string, token?: string): Promise<T> {
  return request<T>(path, { method: "DELETE" }, token);
}

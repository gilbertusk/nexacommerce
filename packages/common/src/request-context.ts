import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { getRequestId, REQUEST_ID_HEADER, runWithRequestId } from '@nexacommerce/logger';

/**
 * HTTP adapter for request correlation.
 *
 * The context itself lives in `@nexacommerce/logger`, because its purpose is
 * that log lines from one customer action can be found together. This module
 * adds the Express entry point and the outbound header, so one customer action
 * is traceable across every service hop it causes.
 */

export { getRequestId, REQUEST_ID_HEADER, runWithRequestId };

/**
 * Shape a caller-supplied id must have to be trusted.
 *
 * Correlation ids are written to logs, so an unchecked value lets a caller
 * inject newlines and forge log entries, or bloat every line with a huge
 * string. A value outside this shape is discarded rather than sanitised, since
 * there is no cost to generating a fresh one.
 */
const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{8,128}$/;

function normalizeIncomingId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return SAFE_REQUEST_ID.test(trimmed) ? trimmed : undefined;
}

/**
 * Express middleware establishing the correlation id for a request.
 *
 * An id from an upstream caller is reused so a trace spans services. The id is
 * echoed on the response so a customer or support agent can quote it.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = normalizeIncomingId(req.headers[REQUEST_ID_HEADER]) ?? crypto.randomUUID();
  res.setHeader(REQUEST_ID_HEADER, requestId);
  runWithRequestId(requestId, () => next());
}

/**
 * Correlation header for an outbound internal call. Empty outside a request
 * context, so callers can spread it unconditionally.
 */
export function requestIdHeader(): Record<string, string> {
  const requestId = getRequestId();
  return requestId ? { [REQUEST_ID_HEADER]: requestId } : {};
}

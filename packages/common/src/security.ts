import crypto from 'crypto';
import { NextFunction, Request, RequestHandler, Response } from 'express';

const DEVELOPMENT_INTERNAL_TOKEN = 'development-only-internal-token';

function constantTimeEqual(left: string, right: string): boolean {
  const leftDigest = crypto.createHash('sha256').update(left).digest();
  const rightDigest = crypto.createHash('sha256').update(right).digest();
  return crypto.timingSafeEqual(leftDigest, rightDigest);
}

export function getInternalServiceToken(): string {
  const token = process.env.INTERNAL_SERVICE_TOKEN?.trim();
  if (token) return token;

  if (process.env.NODE_ENV === 'production') {
    throw new Error('INTERNAL_SERVICE_TOKEN must be configured in production');
  }

  return DEVELOPMENT_INTERNAL_TOKEN;
}

export function buildInternalServiceHeaders(serviceName: string): Record<string, string> {
  return {
    'X-Internal-Service': serviceName,
    'X-Internal-Token': getInternalServiceToken(),
  };
}

export function isAuthenticatedInternalServiceRequest(
  req: Request,
  allowedServices: readonly string[],
): boolean {
  let expectedToken: string;
  try {
    expectedToken = getInternalServiceToken();
  } catch {
    return false;
  }

  const serviceName = req.header('x-internal-service') ?? '';
  const suppliedToken = req.header('x-internal-token') ?? '';
  return (
    allowedServices.includes(serviceName) &&
    suppliedToken.length > 0 &&
    constantTimeEqual(suppliedToken, expectedToken)
  );
}

export function createInternalServiceGuard(allowedServices: readonly string[]): RequestHandler {
  // Resolve this while routes are constructed so a production service cannot
  // start with an unauthenticated internal API surface.
  const expectedToken = getInternalServiceToken();

  return (req: Request, res: Response, next: NextFunction) => {
    const serviceName = req.header('x-internal-service') ?? '';
    const suppliedToken = req.header('x-internal-token') ?? '';
    if (
      !allowedServices.includes(serviceName) ||
      suppliedToken.length === 0 ||
      !constantTimeEqual(suppliedToken, expectedToken)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: authenticated internal service call required',
      });
    }

    next();
  };
}

export function assertProductionSecret(
  name: string,
  value: string | undefined,
  disallowedValues: readonly string[] = [],
): string {
  const normalized = value?.trim();
  if (
    process.env.NODE_ENV === 'production' &&
    (!normalized || disallowedValues.some((candidate) => constantTimeEqual(normalized, candidate)))
  ) {
    throw new Error(`${name} must be set to a non-placeholder value in production`);
  }

  return normalized || '';
}

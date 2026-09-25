import type { NextFunction, Request, Response } from 'express';
import {
  getRequestId,
  REQUEST_ID_HEADER,
  requestIdHeader,
  requestIdMiddleware,
  runWithRequestId,
} from '../src/request-context';

function fakeRequest(headers: Record<string, unknown> = {}): Request {
  return { headers } as unknown as Request;
}

function fakeResponse() {
  const headers: Record<string, string> = {};
  const res = {
    setHeader: (name: string, value: string) => {
      headers[name] = value;
    },
  } as unknown as Response;
  return { res, headers };
}

/** Run the middleware and capture the id visible to downstream handlers. */
function run(req: Request): { observed?: string; responseHeader?: string } {
  const { res, headers } = fakeResponse();
  let observed: string | undefined;
  const next: NextFunction = () => {
    observed = getRequestId();
  };
  requestIdMiddleware(req, res, next);
  return { observed, responseHeader: headers[REQUEST_ID_HEADER] };
}

describe('request correlation', () => {
  test('generates an id when the caller supplies none', () => {
    // Act
    const { observed, responseHeader } = run(fakeRequest());

    // Assert
    expect(observed).toMatch(/^[0-9a-f-]{36}$/);
    expect(responseHeader).toBe(observed);
  });

  test('reuses a valid id from an upstream caller so a trace spans services', () => {
    // Act
    const { observed, responseHeader } = run(
      fakeRequest({ [REQUEST_ID_HEADER]: 'gateway-abc123' }),
    );

    // Assert
    expect(observed).toBe('gateway-abc123');
    expect(responseHeader).toBe('gateway-abc123');
  });

  test('replaces an id that is malformed rather than trusting it into the logs', () => {
    // Arrange: newlines would forge log entries; oversized values bloat them.
    const hostile = ['short', 'has space', 'inject\nline', 'x'.repeat(200), '<script>'];

    for (const value of hostile) {
      // Act
      const { observed } = run(fakeRequest({ [REQUEST_ID_HEADER]: value }));

      // Assert
      expect(observed).not.toBe(value);
      expect(observed).toMatch(/^[0-9a-f-]{36}$/);
    }
  });

  test('exposes no id outside a request', () => {
    // Assert
    expect(getRequestId()).toBeUndefined();
    expect(requestIdHeader()).toEqual({});
  });

  test('forwards the current id on an outbound internal call', () => {
    // Act
    const forwarded = runWithRequestId('trace-1234abcd', () => requestIdHeader());

    // Assert
    expect(forwarded).toEqual({ [REQUEST_ID_HEADER]: 'trace-1234abcd' });
  });

  test('keeps the id across an await boundary', async () => {
    // Act: async continuations must stay correlated, which is the whole point
    // of using AsyncLocalStorage rather than a module-level variable.
    const seen = await runWithRequestId('trace-async01', async () => {
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 1));
      return getRequestId();
    });

    // Assert
    expect(seen).toBe('trace-async01');
  });

  test('keeps concurrent requests from seeing each other ids', async () => {
    // Act
    const [first, second] = await Promise.all([
      runWithRequestId('trace-firstaa', async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return getRequestId();
      }),
      runWithRequestId('trace-secondb', async () => {
        await new Promise((resolve) => setTimeout(resolve, 1));
        return getRequestId();
      }),
    ]);

    // Assert
    expect(first).toBe('trace-firstaa');
    expect(second).toBe('trace-secondb');
  });
});

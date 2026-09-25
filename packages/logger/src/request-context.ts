import { AsyncLocalStorage } from 'async_hooks';

/**
 * Ambient correlation id for the work currently in flight.
 *
 * It lives here, next to the logger, because its reason for existing is that
 * log lines from one customer action must be findable together. The HTTP
 * adapter that populates it lives in `@nexacommerce/common`, which depends on
 * this package rather than the other way round.
 *
 * `AsyncLocalStorage` is used instead of threading the id through every
 * signature: the alternative is editing every call site in the codebase for a
 * value almost none of them use, and any missed one silently breaks the trace.
 */

export const REQUEST_ID_HEADER = 'x-request-id';

interface RequestContext {
  requestId: string;
}

const storage = new AsyncLocalStorage<RequestContext>();

/** The current correlation id, or undefined when there is no context. */
export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

/**
 * Run `fn` under `requestId`. Used by the HTTP middleware and by broker
 * consumers, which have no HTTP request and key their context on the event id.
 */
export function runWithRequestId<T>(requestId: string, fn: () => T): T {
  return storage.run({ requestId }, fn);
}

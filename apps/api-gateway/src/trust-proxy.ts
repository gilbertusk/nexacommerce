import net from 'net';

/**
 * Express `trust proxy` value derived from `TRUST_PROXY`.
 *
 * The rate-limit key is `req.ip`. What `req.ip` means depends entirely on this
 * setting, and both wrong answers are dangerous:
 *
 * - Not trusting a real load balancer collapses every customer onto the
 *   balancer's address, so one noisy client rate-limits everyone.
 * - Trusting everything (`true`) lets any client choose its own key by sending
 *   `X-Forwarded-For`, which defeats the limiter.
 *
 * Accepted values:
 * - unset, empty, or `false`: no proxy; the socket peer address is the client.
 * - a positive integer N: trust exactly N proxy hops in front of the gateway
 *   (e.g. `1` for one load balancer). `req.ip` is the address the outermost
 *   trusted hop saw, never a value the client wrote further left.
 * - a comma-separated list of proxy addresses/CIDRs and Express names
 *   (`loopback`, `linklocal`, `uniquelocal`), e.g. `10.0.0.0/8,loopback`.
 *
 * `true`/`all` is refused: it is never a correct production setting.
 */
export type TrustProxySetting = false | number | string[];

const NAMED_RANGES = new Set(['loopback', 'linklocal', 'uniquelocal']);

function isAddressOrCidr(entry: string): boolean {
  const [address, prefix, ...rest] = entry.split('/');
  if (rest.length > 0) return false;
  const family = net.isIP(address);
  if (family === 0) return false;
  if (prefix === undefined) return true;
  if (!/^\d{1,3}$/.test(prefix)) return false;
  const bits = Number(prefix);
  return family === 4 ? bits <= 32 : bits <= 128;
}

export function parseTrustProxy(raw: string | undefined): TrustProxySetting {
  const value = (raw ?? '').trim();
  if (value === '' || value.toLowerCase() === 'false') return false;

  if (/^\d+$/.test(value)) {
    const hops = Number(value);
    if (!Number.isSafeInteger(hops) || hops < 1 || hops > 10) {
      throw new Error('TRUST_PROXY hop count must be an integer between 1 and 10');
    }
    return hops;
  }

  const lower = value.toLowerCase();
  if (lower === 'true' || lower === 'all' || lower === '*') {
    throw new Error('TRUST_PROXY=true trusts client-supplied X-Forwarded-For; configure a hop count or proxy CIDRs');
  }

  const entries = value.split(',').map((entry) => entry.trim()).filter(Boolean);
  for (const entry of entries) {
    if (!NAMED_RANGES.has(entry) && !isAddressOrCidr(entry)) {
      throw new Error(`TRUST_PROXY entry "${entry}" is not an IP address, CIDR, or loopback/linklocal/uniquelocal`);
    }
  }
  if (entries.length === 0) return false;
  return entries;
}

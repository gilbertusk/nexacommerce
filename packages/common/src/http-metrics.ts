import { NextFunction, Request, RequestHandler, Response } from 'express';

const DURATION_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10] as const;

interface RequestCounter {
  service: string;
  method: string;
  route: string;
  status: string;
  count: number;
}

interface DurationHistogram {
  service: string;
  method: string;
  route: string;
  count: number;
  sum: number;
  buckets: number[];
}

const requests = new Map<string, RequestCounter>();
const durations = new Map<string, DurationHistogram>();
const inFlight = new Map<string, number>();

function label(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

function labels(values: Record<string, string>): string {
  return Object.entries(values)
    .map(([key, value]) => `${key}="${label(value)}"`)
    .join(',');
}

/**
 * Produce a bounded route label when Express does not expose a route pattern
 * (notably proxy middleware). IDs and opaque tokens must never become metric
 * labels because that creates unbounded cardinality.
 */
export function normalizeHttpRoute(path: string): string {
  const normalized = path
    .split('/')
    .map((segment) => {
      if (/^[0-9]+$/.test(segment)) return ':id';
      if (/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment)) return ':id';
      if (/^[0-9a-f]{24}$/i.test(segment)) return ':id';
      if (segment.length > 48) return ':value';
      return segment;
    })
    .join('/');
  return (normalized || '/').slice(0, 160);
}

export function recordHttpRequest(input: {
  service: string;
  method: string;
  route: string;
  status: number;
  durationSeconds: number;
}): void {
  const service = input.service;
  const method = input.method.toUpperCase();
  const route = normalizeHttpRoute(input.route);
  const status = String(input.status);

  const requestKey = [service, method, route, status].join('\u0000');
  const request = requests.get(requestKey) ?? { service, method, route, status, count: 0 };
  request.count += 1;
  requests.set(requestKey, request);

  const durationKey = [service, method, route].join('\u0000');
  const duration = durations.get(durationKey) ?? {
    service,
    method,
    route,
    count: 0,
    sum: 0,
    buckets: DURATION_BUCKETS.map(() => 0),
  };
  duration.count += 1;
  duration.sum += Math.max(0, input.durationSeconds);
  DURATION_BUCKETS.forEach((bucket, index) => {
    if (input.durationSeconds <= bucket) duration.buckets[index] += 1;
  });
  durations.set(durationKey, duration);
}

export function httpMetricsMiddleware(service: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const started = process.hrtime.bigint();
    inFlight.set(service, (inFlight.get(service) ?? 0) + 1);
    let recorded = false;

    const finish = () => {
      if (recorded) return;
      recorded = true;
      inFlight.set(service, Math.max(0, (inFlight.get(service) ?? 1) - 1));
      const elapsed = Number(process.hrtime.bigint() - started) / 1_000_000_000;
      const route = typeof req.route?.path === 'string' ? req.route.path : req.path;
      recordHttpRequest({ service, method: req.method, route, status: res.statusCode, durationSeconds: elapsed });
    };

    res.once('finish', finish);
    res.once('close', finish);
    next();
  };
}

export function renderHttpPrometheusMetrics(): string {
  const lines = [
    '# HELP nexacommerce_http_requests_total HTTP requests completed by service, method, route, and status.',
    '# TYPE nexacommerce_http_requests_total counter',
  ];

  for (const request of [...requests.values()].sort((a, b) =>
    [a.service, a.method, a.route, a.status].join('|').localeCompare([b.service, b.method, b.route, b.status].join('|')))) {
    lines.push(
      `nexacommerce_http_requests_total{${labels({ service: request.service, method: request.method, route: request.route, status: request.status })}} ${request.count}`,
    );
  }

  lines.push('# HELP nexacommerce_http_request_duration_seconds HTTP request duration in seconds.');
  lines.push('# TYPE nexacommerce_http_request_duration_seconds histogram');
  for (const duration of [...durations.values()].sort((a, b) =>
    [a.service, a.method, a.route].join('|').localeCompare([b.service, b.method, b.route].join('|')))) {
    const base = { service: duration.service, method: duration.method, route: duration.route };
    DURATION_BUCKETS.forEach((bucket, index) => {
      lines.push(
        `nexacommerce_http_request_duration_seconds_bucket{${labels({ ...base, le: String(bucket) })}} ${duration.buckets[index]}`,
      );
    });
    lines.push(
      `nexacommerce_http_request_duration_seconds_bucket{${labels({ ...base, le: '+Inf' })}} ${duration.count}`,
    );
    lines.push(`nexacommerce_http_request_duration_seconds_sum{${labels(base)}} ${duration.sum}`);
    lines.push(`nexacommerce_http_request_duration_seconds_count{${labels(base)}} ${duration.count}`);
  }

  lines.push('# HELP nexacommerce_http_in_flight_requests HTTP requests currently being processed.');
  lines.push('# TYPE nexacommerce_http_in_flight_requests gauge');
  for (const [service, count] of [...inFlight.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`nexacommerce_http_in_flight_requests{${labels({ service })}} ${count}`);
  }

  return `${lines.join('\n')}\n`;
}

/** Test-only/process-lifecycle reset. */
export function resetHttpMetrics(): void {
  requests.clear();
  durations.clear();
  inFlight.clear();
}

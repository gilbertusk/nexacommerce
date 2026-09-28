import { auditQueue, expectedQueueSpecs } from '../src/topology';

describe('topology audit', () => {
  const spec = expectedQueueSpecs().find((candidate) => candidate.name === 'shipping-service.order-events')!;
  const bindings = spec.bindings.map((binding) => ({ source: binding.exchange, routing_key: binding.routingKey }));

  it('derives main, dead-letter, and per-route retry queues for every binding', () => {
    const names = expectedQueueSpecs().map((candidate) => candidate.name);
    expect(names).toEqual(expect.arrayContaining([
      'shipping-service.order-events',
      'shipping-service.order-events.dead',
      'shipping-service.order-events.retry.order_paid',
    ]));
    expect(new Set(names).size).toBe(names.length);
  });

  it('accepts a matching durable quorum queue', () => {
    const result = auditQueue(spec, { name: spec.name, type: 'quorum', durable: true, arguments: spec.arguments }, bindings);
    expect(result).toMatchObject({ ok: true, issues: [] });
  });

  it('reports a classic queue as needing migration rather than repairing it', () => {
    const result = auditQueue(spec, { name: spec.name, type: 'classic', durable: true, arguments: {}, messages: 7 }, bindings);
    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.issue)).toEqual(['CLASSIC_NEEDS_MIGRATION']);
    expect(result.messages).toBe(7);
  });

  it('reports argument drift, transience, missing bindings, and missing queues', () => {
    const drifted = auditQueue(spec, {
      name: spec.name,
      type: 'quorum',
      durable: false,
      arguments: { ...spec.arguments, 'x-delivery-limit': 5 },
    }, []);
    expect(drifted.issues.map((issue) => issue.issue).sort()).toEqual(['ARGUMENT_MISMATCH', 'MISSING_BINDING', 'NOT_DURABLE']);
    expect(auditQueue(spec, undefined).issues.map((issue) => issue.issue)).toEqual(['MISSING']);
  });
});

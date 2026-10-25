import fs from 'fs';
import os from 'os';
import path from 'path';
import { rabbitEndpoints, rabbitSocketOptions, redisConnectionSettings } from '../src/broker-connection';

describe('broker connection settings', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'broker-conn-'));
  const ca = path.join(dir, 'ca.pem');
  fs.writeFileSync(ca, 'test-ca');
  afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

  it('splits a multi-node RabbitMQ URL list', () => {
    expect(rabbitEndpoints('amqp://a:1/v, amqp://b:1/v ,amqp://c:1/v')).toEqual(['amqp://a:1/v', 'amqp://b:1/v', 'amqp://c:1/v']);
    expect(() => rabbitEndpoints(' , ')).toThrow();
  });

  it('adds verified TLS options only for amqps endpoints', () => {
    expect(rabbitSocketOptions('amqp://h:5672', { RABBITMQ_TLS_CA_FILE: ca })).toEqual({});
    const options = rabbitSocketOptions('amqps://u:p@rmq-1.internal:5671/v', { RABBITMQ_TLS_CA_FILE: ca });
    expect(options).toMatchObject({ servername: 'rmq-1.internal', rejectUnauthorized: true });
    expect((options.ca as Buffer[])[0].toString()).toBe('test-ca');
  });

  it('keeps direct Redis mode unchanged and enables TLS for rediss', () => {
    expect(redisConnectionSettings('redis://h:6379', {})).toEqual({ url: 'redis://h:6379', options: {} });
    const tls = redisConnectionSettings('rediss://u:p@h:6380', { REDIS_TLS_CA_FILE: ca });
    expect(tls.options.tls).toMatchObject({ rejectUnauthorized: true });
  });

  it('builds Sentinel settings with ACL credentials from the URL', () => {
    const settings = redisConnectionSettings('redis://api-gateway:s3cret@ignored:6379/2', {
      REDIS_SENTINELS: '10.0.0.1:26379,10.0.0.2:26380',
      REDIS_SENTINEL_NAME: 'nexa-primary',
      REDIS_SENTINEL_PASSWORD: 'sentinel-secret',
    });
    expect(settings.url).toBeUndefined();
    expect(settings.options).toMatchObject({
      sentinels: [{ host: '10.0.0.1', port: 26379 }, { host: '10.0.0.2', port: 26380 }],
      name: 'nexa-primary',
      username: 'api-gateway',
      password: 's3cret',
      sentinelPassword: 'sentinel-secret',
      db: 2,
    });
    expect(() => redisConnectionSettings('redis://h:6379', { REDIS_SENTINELS: 'h:26379' })).toThrow(/REDIS_SENTINEL_NAME/);
  });
});

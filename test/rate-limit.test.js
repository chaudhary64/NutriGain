/**
 * lib/rate-limit.js — fixed-window limiter: 10 attempts per 15 minutes, keyed
 * on client address plus a caller-supplied identifier (usually the email).
 *
 * Each test uses its own address so the module-level bucket map cannot leak
 * state between them.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { checkRateLimit } from '../lib/rate-limit.js';

const FIXED_WINDOW_SECONDS = 15 * 60;

const from = (ip) =>
  new Request('http://localhost/api/auth/login', {
    headers: { 'x-forwarded-for': ip },
  });

test('ten attempts pass and the eleventh is refused', () => {
  const request = from('10.0.0.1');

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    assert.equal(checkRateLimit(request, 'user@example.com').allowed, true, `attempt ${attempt}`);
  }

  const blocked = checkRateLimit(request, 'user@example.com');
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0, 'a blocked caller needs to know when to retry');
  assert.ok(blocked.retryAfterSeconds <= FIXED_WINDOW_SECONDS);
});

test('the bucket is per client address, not global', () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    checkRateLimit(from('10.0.0.2'), 'shared@example.com');
  }
  assert.equal(checkRateLimit(from('10.0.0.2'), 'shared@example.com').allowed, false);
  assert.equal(checkRateLimit(from('10.0.0.3'), 'shared@example.com').allowed, true);
});

test('the bucket is per identifier on the same address', () => {
  const request = from('10.0.0.4');

  for (let attempt = 0; attempt < 10; attempt += 1) {
    checkRateLimit(request, 'first@example.com');
  }

  assert.equal(checkRateLimit(request, 'first@example.com').allowed, false);
  assert.equal(checkRateLimit(request, 'second@example.com').allowed, true);
});

test('the identifier is matched case-insensitively', () => {
  const request = from('10.0.0.5');

  for (let attempt = 0; attempt < 10; attempt += 1) {
    checkRateLimit(request, 'Case@Example.com');
  }

  assert.equal(checkRateLimit(request, 'case@example.com').allowed, false);
});

test('a request with no forwarding headers still gets a bucket', () => {
  const bare = new Request('http://localhost/api/auth/login');

  for (let attempt = 0; attempt < 10; attempt += 1) {
    checkRateLimit(bare, 'bare@example.com');
  }

  assert.equal(checkRateLimit(bare, 'bare@example.com').allowed, false);
});

test('the first address in a forwarded chain is the one counted', () => {
  const request = new Request('http://localhost/api/auth/login', {
    headers: { 'x-forwarded-for': '10.0.0.6, 172.16.0.1, 172.16.0.2' },
  });
  const sameClient = from('10.0.0.6');

  for (let attempt = 0; attempt < 10; attempt += 1) {
    checkRateLimit(request, 'chain@example.com');
  }

  assert.equal(checkRateLimit(sameClient, 'chain@example.com').allowed, false);
});

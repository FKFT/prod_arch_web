const test = require('node:test');
const assert = require('node:assert/strict');
const { register } = require('./metrics');

test('registers the http_requests_total counter', async () => {
  const metric = await register.getSingleMetric('http_requests_total');
  assert.ok(metric, 'http_requests_total should be registered');
});

test('registers the http_request_duration_seconds histogram', async () => {
  const metric = await register.getSingleMetric('http_request_duration_seconds');
  assert.ok(metric, 'http_request_duration_seconds should be registered');
});

test('exposes default Node.js process metrics alongside custom ones', async () => {
  const output = await register.metrics();
  assert.match(output, /process_cpu_user_seconds_total/);
  assert.match(output, /http_requests_total/);
});

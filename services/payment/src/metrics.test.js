const test = require('node:test');
const assert = require('node:assert/strict');
const { register } = require('./metrics');

test('registers the payments_total counter', async () => {
  const metric = await register.getSingleMetric('payments_total');
  assert.ok(metric, 'payments_total should be registered');
});

test('registers the payment_amount_cents histogram', async () => {
  const metric = await register.getSingleMetric('payment_amount_cents');
  assert.ok(metric, 'payment_amount_cents should be registered');
});

const test = require('node:test');
const assert = require('node:assert/strict');
const { register } = require('./metrics');

test('registers the cart_operations_total counter', async () => {
  const metric = await register.getSingleMetric('cart_operations_total');
  assert.ok(metric, 'cart_operations_total should be registered');
});

test('registers the cart_active_carts gauge', async () => {
  const metric = await register.getSingleMetric('cart_active_carts');
  assert.ok(metric, 'cart_active_carts should be registered');
});

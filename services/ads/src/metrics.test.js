const test = require('node:test');
const assert = require('node:assert/strict');
const { register } = require('./metrics');

test('registers the ads_served_total counter', async () => {
  const metric = await register.getSingleMetric('ads_served_total');
  assert.ok(metric, 'ads_served_total should be registered');
});

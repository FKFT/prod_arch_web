const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCount = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

const paymentsTotal = new client.Counter({
  name: 'payments_total',
  help: 'Total number of payment attempts',
  labelNames: ['status'],
  registers: [register],
});

const paymentAmount = new client.Histogram({
  name: 'payment_amount_cents',
  help: 'Distribution of payment amounts in cents',
  buckets: [1000, 5000, 10000, 15000, 25000, 50000],
  registers: [register],
});

function metricsMiddleware(req, res, next) {
  const endTimer = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route ? req.baseUrl + req.route.path : req.path;
    const labels = { method: req.method, route, status_code: res.statusCode };
    httpRequestCount.inc(labels);
    endTimer(labels);
  });
  next();
}

module.exports = { register, metricsMiddleware, paymentsTotal, paymentAmount };

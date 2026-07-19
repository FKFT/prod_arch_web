const crypto = require('crypto');
const express = require('express');
const { register, metricsMiddleware, paymentsTotal, paymentAmount } = require('./metrics');

const app = express();
app.use(express.json());
app.use(metricsMiddleware);

const PORT = process.env.PORT || 3000;
const DECLINE_RATE = 0.1;

// transaction_id -> { status, amount_cents, card_last4, created_at }
const transactions = new Map();

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.post('/charge', (req, res) => {
  const { amount_cents, card_last4 } = req.body || {};
  if (!Number.isFinite(amount_cents) || amount_cents <= 0 || !/^\d{4}$/.test(card_last4 || '')) {
    return res.status(400).json({ error: 'amount_cents (positive number) and card_last4 (4 digits) are required' });
  }

  const approved = Math.random() >= DECLINE_RATE;
  const status = approved ? 'approved' : 'declined';
  const transaction_id = crypto.randomUUID();

  transactions.set(transaction_id, {
    status,
    amount_cents,
    card_last4,
    created_at: new Date().toISOString(),
  });

  paymentsTotal.inc({ status });
  paymentAmount.observe(amount_cents);

  res.status(approved ? 200 : 402).json({ status, transaction_id, amount_cents });
});

app.get('/transactions/:id', (req, res) => {
  const tx = transactions.get(req.params.id);
  if (!tx) return res.status(404).json({ error: 'transaction not found' });
  res.json({ transaction_id: req.params.id, ...tx });
});

app.listen(PORT, () => {
  console.log(`payment-service listening on port ${PORT} (demo only, no real charges)`);
});

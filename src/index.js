const express = require('express');
const { pool } = require('./db');
const { register, metricsMiddleware } = require('./metrics');
const { renderStorefront } = require('./render');
const { getOrCreateCartId, rotateCartId } = require('./cart-session');
const { getCart, addCartItem, removeCartItem, charge, getAds } = require('./services');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'",
  });
  next();
});
app.use(metricsMiddleware);

const PRODUCT_ID_RE = /^\d{1,10}$/;

app.get('/', async (req, res) => {
  try {
    await pool.query('INSERT INTO page_views DEFAULT VALUES');
    const { rows: [{ count }] } = await pool.query('SELECT count(*)::int AS count FROM page_views');
    const { rows: products } = await pool.query(
      'SELECT id, name, tagline, price_cents, accent_color FROM products ORDER BY sort_order'
    );

    res.send(renderStorefront(products, count));
  } catch (err) {
    console.error('Error handling /', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/cart', async (req, res) => {
  const cartId = getOrCreateCartId(req, res);
  const result = await getCart(cartId).catch(() => null);
  if (!result || !result.ok) {
    return res.json({ cartId, items: [], total_cents: 0, unavailable: true });
  }
  res.json(result.body);
});

app.post('/api/cart/items', async (req, res) => {
  const cartId = getOrCreateCartId(req, res);
  const { productId, qty } = req.body || {};
  if (typeof productId !== 'string' || !PRODUCT_ID_RE.test(productId)) {
    return res.status(400).json({ error: 'Invalid productId' });
  }

  // Name and price always come from the catalog, never from the client,
  // so a tampered request can't change what an item costs.
  let product;
  try {
    const { rows } = await pool.query(
      'SELECT id, name, price_cents FROM products WHERE id = $1',
      [productId]
    );
    product = rows[0];
  } catch (err) {
    console.error('Error looking up product', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  if (!product) {
    return res.status(404).json({ error: 'Unknown product' });
  }

  const item = {
    productId: String(product.id),
    name: product.name,
    price_cents: product.price_cents,
    qty: Number.isInteger(qty) && qty > 0 && qty <= 99 ? qty : 1,
  };
  const result = await addCartItem(cartId, item).catch(() => null);
  if (!result || !result.ok) {
    return res.status(503).json({ error: 'Cart service is unavailable' });
  }
  res.status(201).json(result.body);
});

app.delete('/api/cart/items/:productId', async (req, res) => {
  const cartId = getOrCreateCartId(req, res);
  if (!PRODUCT_ID_RE.test(req.params.productId)) {
    return res.status(400).json({ error: 'Invalid productId' });
  }
  const result = await removeCartItem(cartId, req.params.productId).catch(() => null);
  if (!result || !result.ok) {
    return res.status(503).json({ error: 'Cart service is unavailable' });
  }
  res.json(result.body);
});

app.post('/api/checkout', async (req, res) => {
  const cartId = getOrCreateCartId(req, res);
  const cartResult = await getCart(cartId).catch(() => null);
  if (!cartResult || !cartResult.ok) {
    return res.status(503).json({ error: 'Cart service is unavailable' });
  }
  if (cartResult.body.items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty' });
  }

  const { card_last4 } = req.body || {};
  const paymentResult = await charge(cartResult.body.total_cents, card_last4).catch(() => null);
  if (!paymentResult) {
    return res.status(503).json({ error: 'Payment service is unavailable' });
  }
  if (paymentResult.body && paymentResult.body.status === 'approved') {
    rotateCartId(res);
  }
  res.status(paymentResult.status).json(paymentResult.body);
});

app.get('/api/ads', async (req, res) => {
  const result = await getAds().catch(() => null);
  if (!result || !result.ok) {
    return res.json({ ads: [], unavailable: true });
  }
  res.json(result.body);
});

app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Health check failed', err);
    res.status(503).json({ status: 'error' });
  }
});

app.get('/metrics', async (req, res) => {
  // Prometheus scrapes the pod directly; anything arriving through the
  // ingress (which sets X-Forwarded-For) is external and gets denied.
  if (req.headers['x-forwarded-for']) {
    return res.status(403).send('Forbidden');
  }
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

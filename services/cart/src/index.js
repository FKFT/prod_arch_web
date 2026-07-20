const express = require('express');
const { register, metricsMiddleware, cartOperations, activeCarts } = require('./metrics');

const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(metricsMiddleware);

const PORT = process.env.PORT || 3000;

// Bounds that keep an in-memory store from being grown without limit by
// unauthenticated callers.
const MAX_CARTS = 10000;
const MAX_ITEMS_PER_CART = 50;
const MAX_QTY = 999;
const MAX_NAME_LENGTH = 200;
const MAX_PRICE_CENTS = 10_000_000;
const CART_ID_RE = /^[\w-]{1,64}$/;

// cartId -> Map<productId, { name, price_cents, qty }>
const carts = new Map();

function getCart(cartId) {
  if (!carts.has(cartId)) {
    // Evict the oldest cart once the cap is hit (Map preserves insertion order).
    if (carts.size >= MAX_CARTS) {
      carts.delete(carts.keys().next().value);
    }
    carts.set(cartId, new Map());
    activeCarts.set(carts.size);
  }
  return carts.get(cartId);
}

function serializeCart(cartId) {
  const items = [...getCart(cartId).entries()].map(([productId, item]) => ({
    productId,
    ...item,
  }));
  const total_cents = items.reduce((sum, item) => sum + item.price_cents * item.qty, 0);
  return { cartId, items, total_cents };
}

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

function validateCartId(req, res, next) {
  if (!CART_ID_RE.test(req.params.cartId)) {
    return res.status(400).json({ error: 'Invalid cartId' });
  }
  next();
}

app.get('/cart/:cartId', validateCartId, (req, res) => {
  cartOperations.inc({ operation: 'view' });
  res.json(serializeCart(req.params.cartId));
});

app.post('/cart/:cartId/items', validateCartId, (req, res) => {
  const { productId, name, price_cents, qty } = req.body || {};
  if (
    typeof productId !== 'string' || !CART_ID_RE.test(productId) ||
    typeof name !== 'string' || name.length === 0 || name.length > MAX_NAME_LENGTH ||
    !Number.isInteger(price_cents) || price_cents < 0 || price_cents > MAX_PRICE_CENTS
  ) {
    return res.status(400).json({ error: 'productId, name, and price_cents are required' });
  }
  const cart = getCart(req.params.cartId);
  const existing = cart.get(productId);
  if (!existing && cart.size >= MAX_ITEMS_PER_CART) {
    return res.status(400).json({ error: 'Cart is full' });
  }
  const addQty = Number.isInteger(qty) && qty > 0 ? qty : 1;
  if (existing) {
    existing.qty = Math.min(existing.qty + addQty, MAX_QTY);
  } else {
    cart.set(productId, { name, price_cents, qty: Math.min(addQty, MAX_QTY) });
  }
  cartOperations.inc({ operation: 'add' });
  res.status(201).json(serializeCart(req.params.cartId));
});

app.delete('/cart/:cartId/items/:productId', validateCartId, (req, res) => {
  const cart = getCart(req.params.cartId);
  cart.delete(req.params.productId);
  cartOperations.inc({ operation: 'remove' });
  res.json(serializeCart(req.params.cartId));
});

app.listen(PORT, () => {
  console.log(`cart-service listening on port ${PORT}`);
});

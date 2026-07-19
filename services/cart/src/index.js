const express = require('express');
const { register, metricsMiddleware, cartOperations, activeCarts } = require('./metrics');

const app = express();
app.use(express.json());
app.use(metricsMiddleware);

const PORT = process.env.PORT || 3000;

// cartId -> Map<productId, { name, price_cents, qty }>
const carts = new Map();

function getCart(cartId) {
  if (!carts.has(cartId)) {
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

app.get('/cart/:cartId', (req, res) => {
  cartOperations.inc({ operation: 'view' });
  res.json(serializeCart(req.params.cartId));
});

app.post('/cart/:cartId/items', (req, res) => {
  const { productId, name, price_cents, qty } = req.body || {};
  if (!productId || !name || !Number.isFinite(price_cents)) {
    return res.status(400).json({ error: 'productId, name, and price_cents are required' });
  }
  const cart = getCart(req.params.cartId);
  const existing = cart.get(productId);
  const addQty = Number.isFinite(qty) && qty > 0 ? qty : 1;
  if (existing) {
    existing.qty += addQty;
  } else {
    cart.set(productId, { name, price_cents, qty: addQty });
  }
  cartOperations.inc({ operation: 'add' });
  res.status(201).json(serializeCart(req.params.cartId));
});

app.delete('/cart/:cartId/items/:productId', (req, res) => {
  const cart = getCart(req.params.cartId);
  cart.delete(req.params.productId);
  cartOperations.inc({ operation: 'remove' });
  res.json(serializeCart(req.params.cartId));
});

app.listen(PORT, () => {
  console.log(`cart-service listening on port ${PORT}`);
});

const CART_URL = process.env.CART_URL || 'http://cart.cart.svc.cluster.local';
const PAYMENT_URL = process.env.PAYMENT_URL || 'http://payment.payment.svc.cluster.local';
const ADS_URL = process.env.ADS_URL || 'http://ads.ads.svc.cluster.local';

const TIMEOUT_MS = 2000;

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const body = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, body };
  } finally {
    clearTimeout(timeout);
  }
}

function getCart(cartId) {
  return fetchJson(`${CART_URL}/cart/${cartId}`);
}

function addCartItem(cartId, item) {
  return fetchJson(`${CART_URL}/cart/${cartId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

function removeCartItem(cartId, productId) {
  return fetchJson(`${CART_URL}/cart/${cartId}/items/${productId}`, { method: 'DELETE' });
}

function charge(amount_cents, card_last4) {
  return fetchJson(`${PAYMENT_URL}/charge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount_cents, card_last4 }),
  });
}

function getAds() {
  return fetchJson(`${ADS_URL}/ads`);
}

module.exports = { getCart, addCartItem, removeCartItem, charge, getAds };

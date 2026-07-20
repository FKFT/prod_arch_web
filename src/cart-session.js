const crypto = require('crypto');

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readCartId(req) {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|;\s*)cart_id=([^;]+)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1]);
  // Only accept well-formed UUIDs so a tampered cookie can't smuggle
  // path segments into upstream service URLs.
  return UUID_RE.test(value) ? value : null;
}

function setCartId(res, cartId) {
  res.setHeader('Set-Cookie', `cart_id=${cartId}; Path=/; HttpOnly; SameSite=Lax`);
}

function getOrCreateCartId(req, res) {
  const existing = readCartId(req);
  if (existing) return existing;
  const cartId = crypto.randomUUID();
  setCartId(res, cartId);
  return cartId;
}

function rotateCartId(res) {
  const cartId = crypto.randomUUID();
  setCartId(res, cartId);
  return cartId;
}

module.exports = { getOrCreateCartId, rotateCartId };

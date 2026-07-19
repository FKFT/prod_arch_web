const crypto = require('crypto');

function readCartId(req) {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(/(?:^|;\s*)cart_id=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
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

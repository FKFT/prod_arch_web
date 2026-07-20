function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// accent_color is interpolated into CSS/SVG attributes, so only a strict
// hex literal is accepted; anything else falls back to a neutral color.
function safeColor(value) {
  return /^#[0-9a-f]{3,8}$/i.test(value) ? value : '#999999';
}

function shoeSvg(id, accentColor) {
  const gradId = `grad-${id}`;
  return `<svg viewBox="0 0 300 160" class="shoe-art" role="img" aria-label="Shoe illustration">
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${accentColor}" stop-opacity="0.75" />
        <stop offset="100%" stop-color="${accentColor}" />
      </linearGradient>
    </defs>
    <path d="M20,125 Q15,95 45,80 Q35,100 30,120 Z" fill="#1d1d1f" opacity="0.9"/>
    <path d="M30,120 Q25,80 70,65 Q120,45 180,48 Q230,50 260,80 Q275,95 270,110 L45,112 Q30,115 30,120 Z" fill="url(#${gradId})" />
    <path d="M230,55 Q260,60 270,85 Q274,98 265,108 L220,108 Q210,80 230,55 Z" fill="#ffffff" fill-opacity="0.25" />
    <line x1="110" y1="60" x2="95" y2="90" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <line x1="130" y1="55" x2="115" y2="88" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <line x1="150" y1="52" x2="135" y2="87" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <line x1="170" y1="50" x2="155" y2="86" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.85"/>
    <path d="M20,140 Q20,150 35,150 L260,150 Q280,150 285,135 L290,120 Q292,110 280,108 L40,108 Q20,110 20,125 Z" fill="#1d1d1f" />
  </svg>`;
}

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function productCard(product) {
  const accent = safeColor(product.accent_color);
  return `<article class="card">
    <div class="card-art" style="background: radial-gradient(circle at 30% 20%, ${accent}22, #f5f5f7)">
      ${shoeSvg(product.id, accent)}
    </div>
    <div class="card-body">
      <h3>${esc(product.name)}</h3>
      <p class="tagline">${esc(product.tagline)}</p>
      <div class="card-footer">
        <span class="price">${formatPrice(product.price_cents)}</span>
        <button
          type="button"
          class="buy-btn"
          data-product-id="${esc(product.id)}"
        >Add to Bag</button>
      </div>
    </div>
  </article>`;
}

function renderStorefront(products, viewCount) {
  const cards = products.map(productCard).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nike. Just Dropped.</title>
  <style>
    :root {
      --ink: #1d1d1f;
      --paper: #f5f5f7;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
      color: var(--ink);
      background: #fff;
    }
    nav {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 40px;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #e5e5e5;
    }
    .brand {
      font-weight: 700;
      font-size: 20px;
      letter-spacing: -0.02em;
    }
    .nav-right {
      display: flex;
      align-items: center;
    }
    .nav-links a {
      color: var(--ink);
      text-decoration: none;
      margin-left: 28px;
      font-size: 14px;
      opacity: 0.8;
    }
    .cart-badge {
      margin-left: 28px;
      background: var(--ink);
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-variant-numeric: tabular-nums;
    }
    .ad-banner {
      display: none;
      align-items: center;
      gap: 12px;
      padding: 12px 40px;
      font-size: 14px;
      border-left: 4px solid #999;
      background: var(--paper);
    }
    .ad-banner.visible { display: flex; }
    .ad-banner .ad-eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-size: 11px;
      font-weight: 700;
      opacity: 0.6;
    }
    .ad-banner strong { font-weight: 600; }
    .hero {
      background: var(--ink);
      color: #fff;
      text-align: center;
      padding: 140px 24px 120px;
    }
    .hero h1 {
      font-size: clamp(40px, 8vw, 88px);
      font-weight: 700;
      letter-spacing: -0.03em;
      margin: 0 0 16px;
    }
    .hero p {
      font-size: clamp(16px, 2.4vw, 22px);
      opacity: 0.72;
      max-width: 520px;
      margin: 0 auto 36px;
    }
    .cta {
      display: inline-block;
      background: #fff;
      color: var(--ink);
      border: none;
      border-radius: 999px;
      padding: 14px 32px;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
    }
    .grid-section {
      background: var(--paper);
      padding: 90px 24px;
    }
    .grid-section h2 {
      text-align: center;
      font-size: clamp(28px, 4vw, 44px);
      letter-spacing: -0.02em;
      margin: 0 0 56px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 28px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .card {
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      transition: transform 0.2s ease;
    }
    .card:hover { transform: translateY(-4px); }
    .card-art {
      padding: 30px 20px;
    }
    .shoe-art { width: 100%; height: auto; display: block; }
    .card-body { padding: 20px 24px 26px; }
    .card-body h3 { margin: 0 0 6px; font-size: 20px; letter-spacing: -0.01em; }
    .tagline { margin: 0 0 18px; color: #6e6e73; font-size: 14px; }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .price { font-weight: 600; font-size: 16px; font-variant-numeric: tabular-nums; }
    .buy-btn {
      background: var(--ink);
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .buy-btn:disabled { opacity: 0.5; cursor: default; }
    footer {
      text-align: center;
      padding: 40px 24px;
      color: #86868b;
      font-size: 13px;
    }

    .drawer-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.35);
      z-index: 30;
    }
    .drawer-backdrop.open { display: block; }
    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: min(380px, 100%);
      background: #fff;
      z-index: 31;
      transform: translateX(100%);
      transition: transform 0.25s ease;
      display: flex;
      flex-direction: column;
      box-shadow: -12px 0 40px rgba(0,0,0,0.15);
    }
    .drawer.open { transform: translateX(0); }
    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #eee;
    }
    .drawer-header h2 { margin: 0; font-size: 18px; }
    .drawer-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: var(--ink);
    }
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
    }
    .drawer-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
    }
    .drawer-item .item-name { font-weight: 600; }
    .drawer-item .item-meta { color: #6e6e73; font-size: 12px; }
    .drawer-item .remove-btn {
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      font-size: 12px;
      text-decoration: underline;
    }
    .drawer-empty { color: #86868b; font-size: 14px; padding: 24px 0; text-align: center; }
    .drawer-footer {
      padding: 20px 24px;
      border-top: 1px solid #eee;
    }
    .drawer-total {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      margin-bottom: 14px;
      font-variant-numeric: tabular-nums;
    }
    .drawer-footer input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 10px;
      box-sizing: border-box;
    }
    .checkout-btn {
      width: 100%;
      background: var(--ink);
      color: #fff;
      border: none;
      border-radius: 999px;
      padding: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    .checkout-btn:disabled { opacity: 0.5; cursor: default; }
    .checkout-msg { margin-top: 10px; font-size: 13px; text-align: center; }
    .checkout-msg.success { color: #1a7f37; }
    .checkout-msg.error { color: #c0271d; }
    .unavailable-note { font-size: 12px; color: #c0271d; margin-top: 8px; }
  </style>
</head>
<body>
  <nav>
    <div class="brand">Nike.</div>
    <div class="nav-right">
      <div class="nav-links">
        <a href="#collection">Collection</a>
      </div>
      <button type="button" class="cart-badge" id="cart-toggle">Bag (<span id="cart-count">0</span>)</button>
    </div>
  </nav>

  <div class="ad-banner" id="ad-banner">
    <span class="ad-eyebrow">Ad</span>
    <span id="ad-text"></span>
  </div>

  <section class="hero">
    <h1>Just Dropped.</h1>
    <p>Five icons, zero compromises. The new lineup is here.</p>
    <a class="cta" href="#collection">Shop the Collection</a>
  </section>

  <section class="grid-section" id="collection">
    <h2>The Collection</h2>
    <div class="grid" id="product-grid">
      ${cards}
    </div>
  </section>

  <footer>
    You're visitor #${viewCount} today.
  </footer>

  <div class="drawer-backdrop" id="drawer-backdrop"></div>
  <aside class="drawer" id="drawer" aria-label="Shopping bag">
    <div class="drawer-header">
      <h2>Your Bag</h2>
      <button type="button" class="drawer-close" id="drawer-close" aria-label="Close">&times;</button>
    </div>
    <div class="drawer-body" id="drawer-body">
      <p class="drawer-empty">Your bag is empty.</p>
    </div>
    <div class="drawer-footer">
      <div class="drawer-total">
        <span>Total</span>
        <span id="drawer-total">$0.00</span>
      </div>
      <input type="text" id="card-input" placeholder="Card number, last 4 digits" maxlength="4" />
      <button type="button" class="checkout-btn" id="checkout-btn">Checkout</button>
      <div id="checkout-msg" class="checkout-msg"></div>
    </div>
  </aside>

  <script>
    (function () {
      const cartCount = document.getElementById('cart-count');
      const drawer = document.getElementById('drawer');
      const drawerBackdrop = document.getElementById('drawer-backdrop');
      const drawerBody = document.getElementById('drawer-body');
      const drawerTotal = document.getElementById('drawer-total');
      const checkoutBtn = document.getElementById('checkout-btn');
      const checkoutMsg = document.getElementById('checkout-msg');
      const cardInput = document.getElementById('card-input');

      function money(cents) {
        return '$' + (cents / 100).toFixed(2);
      }

      function esc(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function openDrawer() {
        drawer.classList.add('open');
        drawerBackdrop.classList.add('open');
      }
      function closeDrawer() {
        drawer.classList.remove('open');
        drawerBackdrop.classList.remove('open');
      }

      async function refreshCart() {
        try {
          const res = await fetch('/api/cart');
          const cart = await res.json();
          cartCount.textContent = cart.items.reduce((n, i) => n + i.qty, 0);
          drawerTotal.textContent = money(cart.total_cents || 0);

          if (cart.unavailable) {
            drawerBody.innerHTML = '<p class="drawer-empty">Cart service is unavailable right now.</p>';
            checkoutBtn.disabled = true;
            return;
          }
          checkoutBtn.disabled = cart.items.length === 0;

          if (cart.items.length === 0) {
            drawerBody.innerHTML = '<p class="drawer-empty">Your bag is empty.</p>';
            return;
          }
          drawerBody.innerHTML = cart.items.map(function (item) {
            return '<div class="drawer-item">' +
              '<div>' +
                '<div class="item-name">' + esc(item.name) + '</div>' +
                '<div class="item-meta">Qty ' + esc(item.qty) + ' &middot; ' + money(item.price_cents) + '</div>' +
              '</div>' +
              '<button type="button" class="remove-btn" data-remove="' + esc(item.productId) + '">Remove</button>' +
            '</div>';
          }).join('');
        } catch (err) {
          drawerBody.innerHTML = '<p class="drawer-empty">Cart service is unavailable right now.</p>';
          checkoutBtn.disabled = true;
        }
      }

      async function loadAds() {
        const banner = document.getElementById('ad-banner');
        const text = document.getElementById('ad-text');
        try {
          const res = await fetch('/api/ads');
          const data = await res.json();
          if (data.unavailable || !data.ads || data.ads.length === 0) {
            banner.classList.remove('visible');
            return;
          }
          const ad = data.ads[0];
          text.innerHTML = '<strong>' + esc(ad.headline) + '</strong> &mdash; ' + esc(ad.subtext);
          banner.style.borderLeftColor = /^#[0-9a-f]{3,8}$/i.test(ad.accent_color) ? ad.accent_color : '#999';
          banner.classList.add('visible');
        } catch (err) {
          banner.classList.remove('visible');
        }
      }

      document.getElementById('cart-toggle').addEventListener('click', function () {
        openDrawer();
        refreshCart();
      });
      document.getElementById('drawer-close').addEventListener('click', closeDrawer);
      drawerBackdrop.addEventListener('click', closeDrawer);

      document.getElementById('product-grid').addEventListener('click', async function (evt) {
        const btn = evt.target.closest('.buy-btn');
        if (!btn) return;
        btn.disabled = true;
        const originalText = btn.textContent;
        btn.textContent = 'Adding...';
        try {
          await fetch('/api/cart/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: btn.dataset.productId,
              qty: 1,
            }),
          });
          btn.textContent = 'Added';
          await refreshCart();
        } catch (err) {
          btn.textContent = 'Unavailable';
        } finally {
          setTimeout(function () {
            btn.textContent = originalText;
            btn.disabled = false;
          }, 1200);
        }
      });

      drawerBody.addEventListener('click', async function (evt) {
        const btn = evt.target.closest('[data-remove]');
        if (!btn) return;
        await fetch('/api/cart/items/' + encodeURIComponent(btn.dataset.remove), { method: 'DELETE' });
        refreshCart();
      });

      checkoutBtn.addEventListener('click', async function () {
        checkoutBtn.disabled = true;
        checkoutMsg.textContent = '';
        checkoutMsg.className = 'checkout-msg';
        try {
          const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ card_last4: cardInput.value || '4242' }),
          });
          const result = await res.json();
          if (res.ok && result.status === 'approved') {
            checkoutMsg.textContent = 'Payment approved. Order placed!';
            checkoutMsg.className = 'checkout-msg success';
            cardInput.value = '';
            await refreshCart();
          } else if (result.status === 'declined') {
            checkoutMsg.textContent = 'Payment declined. Try a different card.';
            checkoutMsg.className = 'checkout-msg error';
          } else {
            checkoutMsg.textContent = result.error || 'Checkout is unavailable right now.';
            checkoutMsg.className = 'checkout-msg error';
          }
        } catch (err) {
          checkoutMsg.textContent = 'Checkout is unavailable right now.';
          checkoutMsg.className = 'checkout-msg error';
        } finally {
          await refreshCart();
        }
      });

      refreshCart();
      loadAds();
    })();
  </script>
</body>
</html>`;
}

module.exports = { renderStorefront };

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
  return `<article class="card">
    <div class="card-art" style="background: radial-gradient(circle at 30% 20%, ${product.accent_color}22, #f5f5f7)">
      ${shoeSvg(product.id, product.accent_color)}
    </div>
    <div class="card-body">
      <h3>${product.name}</h3>
      <p class="tagline">${product.tagline}</p>
      <div class="card-footer">
        <span class="price">${formatPrice(product.price_cents)}</span>
        <button type="button" class="buy-btn">Add to Bag</button>
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
      z-index: 10;
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
    .nav-links a {
      color: var(--ink);
      text-decoration: none;
      margin-left: 28px;
      font-size: 14px;
      opacity: 0.8;
    }
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
    .price { font-weight: 600; font-size: 16px; }
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
    footer {
      text-align: center;
      padding: 40px 24px;
      color: #86868b;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <nav>
    <div class="brand">Nike.</div>
    <div class="nav-links">
      <a href="#collection">Collection</a>
      <a href="/healthz">Status</a>
      <a href="/metrics">Metrics</a>
    </div>
  </nav>

  <section class="hero">
    <h1>Just Dropped.</h1>
    <p>Five icons, zero compromises. The new lineup is here.</p>
    <a class="cta" href="#collection">Shop the Collection</a>
  </section>

  <section class="grid-section" id="collection">
    <h2>The Collection</h2>
    <div class="grid">
      ${cards}
    </div>
  </section>

  <footer>
    You're visitor #${viewCount} today.
  </footer>
</body>
</html>`;
}

module.exports = { renderStorefront };

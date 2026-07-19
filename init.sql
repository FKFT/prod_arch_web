CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  accent_color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO products (name, tagline, price_cents, accent_color, sort_order) VALUES
  ('Nike Air Max 90', 'Icon reborn.', 13000, '#e8491d', 1),
  ('Nike Air Force 1', 'The classic. Untouched.', 11000, '#111111', 2),
  ('Nike Pegasus 41', 'Built to fly.', 14500, '#2b6cb0', 3),
  ('Nike Dunk Low', 'Court legend.', 11500, '#1a7f37', 4),
  ('Nike Blazer Mid', 'Vintage vibes.', 10500, '#c026d3', 5);

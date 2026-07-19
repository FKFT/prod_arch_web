CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  body TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO messages (body) VALUES
  ('Hello from Postgres'),
  ('This row was seeded at container startup'),
  ('Phase 1: Express + Postgres + Docker');

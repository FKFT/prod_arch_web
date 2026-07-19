const express = require('express');
const { pool } = require('./db');
const { register, metricsMiddleware } = require('./metrics');
const { renderStorefront } = require('./render');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(metricsMiddleware);

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

app.get('/healthz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', error: err.message });
  }
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

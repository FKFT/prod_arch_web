const express = require('express');
const { pool } = require('./db');
const { register, metricsMiddleware } = require('./metrics');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(metricsMiddleware);

app.get('/', async (req, res) => {
  try {
    await pool.query('INSERT INTO page_views DEFAULT VALUES');
    const { rows: [{ count }] } = await pool.query('SELECT count(*)::int AS count FROM page_views');
    const { rows: messages } = await pool.query('SELECT id, body FROM messages ORDER BY id');

    const items = messages.map((m) => `<li>${m.body}</li>`).join('\n');
    res.send(`<!doctype html>
<html>
  <head><title>Phase 1</title></head>
  <body>
    <h1>Phase 1 App</h1>
    <p>Page views: ${count}</p>
    <ul>${items}</ul>
  </body>
</html>`);
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

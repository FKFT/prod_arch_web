const express = require('express');
const { register, metricsMiddleware, adsServed } = require('./metrics');

const app = express();
app.use(metricsMiddleware);

const PORT = process.env.PORT || 3000;

const CREATIVES = [
  {
    campaign: 'pegasus-41-launch',
    headline: 'Pegasus 41 is here.',
    subtext: 'Built to fly. Shop the new colorway.',
    accent_color: '#2b6cb0',
  },
  {
    campaign: 'member-early-access',
    headline: 'Members get early access.',
    subtext: 'Join free. Unlock drops 48 hours early.',
    accent_color: '#e8491d',
  },
  {
    campaign: 'dunk-low-restock',
    headline: 'Dunk Low just restocked.',
    subtext: 'Court legend. Back for a limited time.',
    accent_color: '#1a7f37',
  },
];

function pickRotation() {
  const shuffled = [...CREATIVES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.get('/ads', (req, res) => {
  const selected = pickRotation();
  selected.forEach((ad) => adsServed.inc({ campaign: ad.campaign }));
  res.json({ ads: selected });
});

app.listen(PORT, () => {
  console.log(`ads-service listening on port ${PORT}`);
});

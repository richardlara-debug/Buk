const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const app = express();
const PORT = process.env.PORT || 3000;

const BUK_URL = process.env.BUK_URL;
const BUK_TOKEN = process.env.BUK_TOKEN;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Proxy Buk activo' });
});

app.get('/api/buk/:endpoint', async (req, res) => {
  if (!BUK_URL || !BUK_TOKEN) {
    return res.status(500).json({ error: 'Variables BUK_URL y BUK_TOKEN no configuradas.' });
  }

  const endpoint = req.params.endpoint;
  const query = new URLSearchParams(req.query).toString();
  const url = `${BUK_URL}/api/v1/${endpoint}${query ? '?' + query : ''}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token token=${BUK_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error desde Buk', detail: data });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al conectar con Buk', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy Buk corriendo en puerto ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

let clients = [];

app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'sakthi123';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const contact = req.body?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];

  if (msg && msg.text && contact) {
    const messageData = {
      from: contact.wa_id,
      name: contact.profile.name || "Unknown",
      text: msg.text.body,
      time: new Date().toLocaleTimeString()
    };

    console.log("📩 Received:", messageData);

    // Broadcast to all connected frontend clients
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(messageData)}\n\n`));
  }

  res.sendStatus(200);
});

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  clients.push({ id: clientId, res });

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

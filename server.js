const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const VERIFY_TOKEN = 'sakthi123';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const messagesFile = path.join(__dirname, 'messages.json');

// Load messages from file if it exists
let messages = [];
if (fs.existsSync(messagesFile)) {
  messages = JSON.parse(fs.readFileSync(messagesFile));
}

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook to receive WhatsApp messages
app.post('/webhook', (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0]?.value?.messages;

    if (changes && changes.length > 0) {
      const msg = changes[0];
      const from = msg.from;
      const text = msg.text?.body || 'Media or non-text message';

      const newMsg = {
        id: Date.now(),
        from,
        text,
      };

      messages.push(newMsg);
      fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
      console.log('📥 New message received:', newMsg);
    }
  } catch (err) {
    console.error('❌ Error processing message:', err);
  }

  res.sendStatus(200);
});

// API to get all stored messages
app.get('/messages', (req, res) => {
  res.json(messages);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

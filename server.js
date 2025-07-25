const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Verification endpoint for Meta (GET)
app.get('/webhook', (req, res) => {
  const verify_token = 'sakthi123';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === verify_token) {
      console.log('Webhook verified!');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// POST endpoint to receive messages
app.post('/webhook', (req, res) => {
  console.log('📥 Incoming message:', JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});

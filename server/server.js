const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());

let vapidKeys;
if (fs.existsSync('./vapid.json')) {
  vapidKeys = require('./vapid.json');
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  fs.writeFileSync('./vapid.json', JSON.stringify(vapidKeys));
}

webpush.setVapidDetails(
  'mailto:test@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

app.get('/vapidPublicKey', (req, res) => {
  res.send(vapidKeys.publicKey);
});

let scheduledNotifs = [];

app.post('/schedule', (req, res) => {
  const { subscription, title, message, triggerTimeMs } = req.body;
  
  if (!triggerTimeMs) {
    return res.status(400).json({ error: 'triggerTimeMs is required' });
  }

  console.log(`Notification scheduled for: ${title} at ${new Date(triggerTimeMs).toLocaleString()}`);
  
  scheduledNotifs.push({
    subscription,
    title,
    message,
    triggerTimeMs,
    sent: false
  });

  res.status(201).json({});
});

// Check every minute for notifications that need to be sent
cron.schedule('* * * * *', () => {
  const now = Date.now();
  scheduledNotifs.forEach(notif => {
    // If it's time to send and hasn't been sent yet
    if (!notif.sent && notif.triggerTimeMs <= now) {
      notif.sent = true;
      const payload = JSON.stringify({ title: notif.title, body: notif.message });
      
      webpush.sendNotification(notif.subscription, payload)
        .then(() => console.log(`Push sent successfully for: ${notif.title}`))
        .catch(err => console.error('Push error:', err));
    }
  });
  
  // Clean up sent notifications to prevent memory leak
  scheduledNotifs = scheduledNotifs.filter(notif => !notif.sent);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Push Notification Server running on port ${PORT}`);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const { exchangeRate } = require('./currencies');

const app = express();

webpush.setVapidDetails(
  'http://localhost:3000',
  process.env.REACT_APP_WEB_PUSH_PUBLIC_KEY,
  process.env.PRIVATE_KEY
);

app.use(cors());
app.use(express.json());

const webPushSubscriptions = [];

app.get('/', (_, res) => res.json(exchangeRate));

app.put('/:currency', (req, res) => {
  const { currency } = req.params;
  const { value } = req.body;

  exchangeRate[currency] = value;

  webPushSubscriptions.forEach((subscription) => {
    webpush.sendNotification(subscription, `Hello!!!!. New exchange rate is ${value}`);
  });

  res.json({ value });
});

app.post('/subscription', (req, res) => {
  webPushSubscriptions.push(req.body);

  res.sendStatus(201);
});

app.listen(process.env.REACT_APP_SERVER_PORT, () => console.log('The app started'));

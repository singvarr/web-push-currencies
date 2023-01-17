require('dotenv').config();
const express = require('express');
const cors = require('cors');
const webpush = require('web-push');

const logger = require('./logger');
const exchangeRates = require('./data/exchangeRates');
let subscriptionConfigurations = require('./data/subscriptionConfigurations');

const app = express();

webpush.setVapidDetails(
  'http://localhost:8080',
  process.env.REACT_APP_WEB_PUSH_PUBLIC_KEY,
  process.env.PRIVATE_KEY
);

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => res.json(exchangeRates));

app.put('/:currency', (req, res) => {
  const { currency: updatedCurrency } = req.params;
  const { value } = req.body;

  exchangeRates[updatedCurrency] = value;

  subscriptionConfigurations.forEach(({ subscription, currencies }) => {
    const shouldNotify = currencies.some(currency => currency === updatedCurrency);

    if (shouldNotify) {
      webpush.sendNotification(subscription, `${updatedCurrency}: ${value}`);
    }
  });

  res.json({ value });

  logger.info(`New rate of ${updatedCurrency} - ${value}`);
});

app.get('/subscription', (req, res) => {
  const { subscriptionUrl } = req.query;

  const subscriptionConfiguration = subscriptionConfigurations.find((config) => (
    config.subscription.endpoint === subscriptionUrl
  ));

  const result = subscriptionConfiguration || null;

  res.json(result);
});

app.post('/subscription', (req, res) => {
  const { subscription, currencies } = req.body;
  const { endpoint } = subscription;

  const isSaved = subscriptionConfigurations.some(({ subscription }) => (
    subscription.endpoint === endpoint
  ));

  if (!isSaved) {
    logger.info(`Added endpoint ${subscription.endpoint}`);
    subscriptionConfigurations.push({ subscription, currencies });
  } else {
    subscriptionConfigurations = subscriptionConfigurations.map(config => ({
      ...config,
      currencies,
    }));
  }

  res.sendStatus(201);

  if (currencies.length) {
    logger.info(`User subscribed to these currencies ${currencies}`);
  }
});

app.listen(process.env.REACT_APP_SERVER_PORT, () => logger.info('The app started'));

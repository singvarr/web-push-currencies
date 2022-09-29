const currencies = {
  USD: "usd",
  EUR: "eur"
};

/* todo need to change to the obj type:
  Array of {
    id: string;
    currency: string;
    amount: number
   } */
const exchangeRate = {
  [currencies.EUR]: 37.09,
  [currencies.USD]: 36.9
};

module.exports = {
  currencies,
  exchangeRate
};

import axios from 'axios';

const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/RUB';

export const fetchExchangeRates = async () => {
  try {
    const response = await axios.get(EXCHANGE_API);
    const rawRates = response.data.rates;
    const rates = { RUB: 1 };
    for (const [currency, value] of Object.entries(rawRates)) {
      if (currency === 'RUB') continue;
      rates[currency] = 1 / value;
    }
    return {
      rates,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Ошибка получения курсов валют:', error);
    return null;
  }
};
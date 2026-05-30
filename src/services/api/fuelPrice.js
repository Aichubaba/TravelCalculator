import russiaFuelData from '../../data/fuelPricesRU.json';

const STATIC_FUEL_PRICES = {
  gasoline: russiaFuelData.prices.gasoline,
  diesel: russiaFuelData.prices.diesel,
};

export const fetchFuelPrices = async () => {
  console.log('⛽ Используются статические цены на топливо (Росстат):', STATIC_FUEL_PRICES);
  return STATIC_FUEL_PRICES;
};
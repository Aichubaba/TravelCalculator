import { haversineDistance } from './geo/haversine';

const SPEEDS = { car: 75, public: 60, walk: 5.5 };
const REST_INTERVAL = 2;
const REST_DURATION = { car: 0.25, walk: 0.4167, public: 0 };
const LONG_REST_AFTER = 8;
const LONG_REST_DURATION = 14;

export function calculateTravelTime(distance, transportType) {
  const speed = SPEEDS[transportType] || SPEEDS.car;
  const pureDriveHours = distance / speed;
  const restDuration = REST_DURATION[transportType] || 0;
  let restHours = 0;
  if (restDuration > 0) {
    const stops = Math.floor(pureDriveHours / REST_INTERVAL);
    restHours = stops * restDuration;
  }
  const drivingWithRests = pureDriveHours + restHours;
  let overnightStops = 0, longRestHours = 0;
  if (drivingWithRests > LONG_REST_AFTER) {
    overnightStops = Math.floor(drivingWithRests / LONG_REST_AFTER);
    if (drivingWithRests % LONG_REST_AFTER > 0) overnightStops++;
    longRestHours = overnightStops * LONG_REST_DURATION;
  }
  const totalHours = drivingWithRests + longRestHours;
  const days = Math.ceil(totalHours / 24);
  return { pureHours: pureDriveHours, restHours, longRestHours, totalHours, days, overnightStops };
}

export function getTravelWarning(transportType, pureHours, useTravelTime) {
  if (!useTravelTime || pureHours == null) return null;
  if (transportType === 'walk') {
    if (pureHours > 8) return { text: '⚠️ Очень долгая пешая прогулка!', color: 'text-red-600' };
    if (pureHours > 2) return { text: '🚶 Предстоит долгий путь!', color: 'text-yellow-600' };
  } else if (transportType === 'car') {
    if (pureHours > 8) return { text: '⚠️ Длительная поездка!', color: 'text-red-600' };
    if (pureHours > 4) return { text: '🛑 Рекомендуются остановки', color: 'text-yellow-600' };
  }
  return null;
}

export function calculateBudget(trip, expenses, rates, displayCurrency, useTravelTime, days, overnightStops) {
  const travelers = trip.travelers || 1;
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  let total = 0;
  const breakdown = safeExpenses.map(exp => {
    let amount = 0;
    if (exp.id === 'accommodation' || exp.name === 'Проживание') {
      const nights = useTravelTime ? overnightStops : Math.max(days - 1, 0);
      amount = exp.value * nights * travelers;
    } else if (exp.type === 'daily') {
      amount = exp.value * days * travelers;
    } else {
      amount = exp.value * travelers;
    }
    const converted = convertCurrency(amount, exp.currency, displayCurrency, rates);
    total += converted;
    return { ...exp, amount, converted };
  });
  return { total, breakdown, days };
}

export function convertCurrency(amount, from, to, rates) {
  const rateFrom = rates[from] || 1;
  const rateTo = rates[to] || 1;
  return (amount * rateFrom) / rateTo;
}
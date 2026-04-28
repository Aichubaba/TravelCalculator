// ГЕОГРАФИЧЕСКИЕ РАСЧЁТЫ

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // радиус Земли в км
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateStraightDistance(points) {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    total += haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
  }
  return total;
}

// РАСЧЁТ ВРЕМЕНИ В ПУТИ

// Скорости по типам транспорта (км/ч)
export const SPEEDS = {
  car: 75,
  public: 60,
  walk: 5.5,
};

// Параметры коротких остановок
const REST_INTERVAL = 2; // каждые 2 часа движения
const REST_DURATION = {
  car: 0.25,    // 15 минут
  walk: 0.4167, // 25 минут
  public: 0,
};

// Длительная стоянка (ночёвка)
const LONG_REST_AFTER = 8; // часов суммарного времени (включая короткие остановки)
const LONG_REST_DURATION = 14; // часов

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

  let longRestHours = 0;
  let overnightStops = 0;
  if (drivingWithRests > LONG_REST_AFTER) {
    overnightStops = Math.floor(drivingWithRests / LONG_REST_AFTER);
    if (drivingWithRests % LONG_REST_AFTER > 0) overnightStops++;
    longRestHours = overnightStops * LONG_REST_DURATION;
  }

  const totalHours = drivingWithRests + longRestHours;
  const days = Math.ceil(totalHours / 24);

  return {
    pureHours: pureDriveHours,
    restHours,
    longRestHours,
    totalHours,
    days,
    overnightStops,
  };
}

// БЮДЖЕТНЫЕ РАСЧЁТЫ

export function calculateTripDays(trip, useTravelTime) {
  if (useTravelTime && trip.distance > 0) {
    const calc = calculateTravelTime(trip.distance, trip.transport.type);
    return { days: calc.days, overnightStops: calc.overnightStops };
  } else {
    const start = trip.startDate ? new Date(trip.startDate) : null;
    const end = trip.endDate ? new Date(trip.endDate) : null;
    let days = 0;
    if (start && end && start <= end) {
      days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
    return { days, overnightStops: 0 };
  }
}

export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  const rateFrom = rates[fromCurrency] || 1;
  const rateTo = rates[toCurrency] || 1;
  return amount * rateFrom / rateTo;
}

export function calculateBudget(trip, expenses, rates, displayCurrency, useTravelTime) {
  const { days, overnightStops } = calculateTripDays(trip, useTravelTime);
  const travelers = trip.travelers || 1;
  const safeExpenses = Array.isArray(expenses)
    ? expenses.filter(exp => exp && typeof exp === 'object' && exp.id)
    : [];

  let total = 0;
  const breakdown = safeExpenses.map(exp => {
    let amount = 0;
    if (exp.id === 'accommodation' || exp.name === 'Проживание') {
      const nights = useTravelTime ? overnightStops : (days > 0 ? days - 1 : 0);
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

// ФОРМАТИРОВАНИЕ

export function formatDuration(hours) {
  if (hours === null || hours === undefined) return '—';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h} ч ${m} мин`;
}

export function formatTravelDuration(hours, days, useTravelTime) {
  if (useTravelTime && hours !== null && hours > 0) {
    if (hours < 24) {
      return `${Math.round(hours)} ч`;
    } else {
      const d = Math.floor(hours / 24);
      const h = Math.round(hours % 24);
      return `${d} сут ${h} ч`;
    }
  } else {
    return `${days} дн.`;
  }
}

// ПРЕДУПРЕЖДЕНИЯ

export function getTravelWarning(transportType, pureHours, useTravelTime) {
  if (!useTravelTime || pureHours === null) return null;
  if (transportType === 'walk') {
    if (pureHours > 8) {
      return {
        text: '⚠️ Очень долгая пешая прогулка! Неподготовленному человеку может быть тяжело.',
        color: 'text-red-600',
      };
    } else if (pureHours > 2) {
      return {
        text: '🚶 Предстоит долгий путь! Возьмите побольше воды.',
        color: 'text-yellow-600',
      };
    }
  } else if (transportType === 'car') {
    if (pureHours > 8) {
      return {
        text: '⚠️ Длительная поездка! Необходима длительная стоянка для отдыха.',
        color: 'text-red-600',
      };
    } else if (pureHours > 4) {
      return {
        text: '🛑 Рекомендуется делать регулярные остановки для отдыха.',
        color: 'text-yellow-600',
      };
    }
  }
  return null;
}

export const MAX_SPEEDS = {
  car: 100,
  public: 100,
  walk: 15,
};

export function getSpeedWarning(distance, days, transportType) {
    if (!distance || days <= 0) return null;
    const hours = days * 24;
    const avgSpeed = distance / hours;
    const maxSpeed = MAX_SPEEDS[transportType] || 140;
    if (distance > 800 && days === 1) {
        return { text: '⚠️ Очень длинный маршрут на один день!', color: 'text-orange-600' };
    }
  
    if (avgSpeed > maxSpeed) {
    return {
      text: `⚠️ Средняя скорость ${avgSpeed.toFixed(0)} км/ч превышает реалистичную (${maxSpeed} км/ч). Проверьте даты или расстояние.`,
      color: 'text-orange-600',
    };
    }
    return null;
}
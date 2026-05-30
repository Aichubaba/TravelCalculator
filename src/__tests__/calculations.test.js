import { calculateBudget, calculateTravelTime, convertCurrency } from '../utils/calculations';

describe('calculateTravelTime', () => {
  test('короткая дистанция (автомобиль) не должна давать ночёвок', () => {
    const result = calculateTravelTime(300, 'car'); // 300 км
    expect(result.totalHours).toBeCloseTo(4.5, 1);
    expect(result.overnightStops).toBe(0);
  });

  test('длинная дистанция должна давать ночёвки', () => {
    const result = calculateTravelTime(1500, 'car'); // ~20 часов в пути
    expect(result.overnightStops).toBeGreaterThanOrEqual(1);
    expect(result.days).toBeGreaterThanOrEqual(2);
  });

  test('пеший транспорт даёт остановки и ночёвки при длительном пути', () => {
    const result = calculateTravelTime(50, 'walk');
    expect(result.restHours).toBeGreaterThan(0);
    expect(result.overnightStops).toBe(2);      // реальное значение
});
});

describe('calculateBudget', () => {
  const baseTrip = { travelers: 2 };
  const baseRates = { RUB: 1, USD: 90 };
  const displayCurrency = 'RUB';

  test('ежедневные и фиксированные расходы суммируются правильно', () => {
    const expenses = [
      { id: 'food', name: 'Питание', type: 'daily', value: 500, currency: 'RUB' },
      { id: 'insurance', name: 'Страховка', type: 'fixed', value: 300, currency: 'RUB' }
    ];
    const result = calculateBudget(baseTrip, expenses, baseRates, displayCurrency, false, 5, 0);
    // Питание: 500 * 5 * 2 = 5000, Страховка: 300 * 2 = 600
    expect(result.total).toBe(5600);
    expect(result.breakdown.length).toBe(2);
    expect(result.days).toBe(5);
  });

  test('проживание использует количество ночей, а не дней', () => {
    const expenses = [
      { id: 'accommodation', name: 'Проживание', type: 'daily', value: 1500, currency: 'RUB' }
    ];
    // useTravelTime = true, overnightStops = 3, days = 4
    const result = calculateBudget(baseTrip, expenses, baseRates, displayCurrency, true, 4, 3);
    // 1500 * 3 * 2 = 9000
    expect(result.total).toBe(9000);
  });

  test('конвертация валюты работает корректно', () => {
    const expenses = [
      { id: 'food', name: 'Питание', type: 'daily', value: 10, currency: 'USD' }
    ];
    const result = calculateBudget({ travelers: 1 }, expenses, baseRates, 'RUB', false, 1, 0);
    // 10 USD * 90 = 900 RUB
    expect(result.total).toBe(900);
  });
});

describe('convertCurrency', () => {
  test('конвертирует RUB в USD', () => {
    expect(convertCurrency(90, 'RUB', 'USD', { RUB: 1, USD: 90 })).toBe(1);
  });
  test('конвертирует USD в RUB', () => {
    expect(convertCurrency(10, 'USD', 'RUB', { RUB: 1, USD: 90 })).toBe(900);
  });
});
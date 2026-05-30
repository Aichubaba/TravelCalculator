import { useMemo } from 'react';
import { calculateBudget, calculateTravelTime } from '../utils/calculations';

export const useBudgetCalculator = (
  trip,
  expenses,
  exchangeRates,
  displayCurrency,
  travelDurationHours,
  routeDistance = 0        // <-- новый параметр, реальное расстояние маршрута
) => {
  return useMemo(() => {
    let days = 0;
    let overnightStops = 0;
    let useTravelTime = false;

    // Используем переданное расстояние маршрута, если оно положительное,
    // иначе запасной вариант – trip.distance (который может быть 0)
    const effectiveDistance =
      routeDistance !== undefined && routeDistance > 0
        ? routeDistance
        : trip.distance;

    // Если есть и продолжительность, и расстояние – считаем по времени в пути
    if (
      travelDurationHours !== null &&
      travelDurationHours !== undefined &&
      travelDurationHours > 0 &&
      effectiveDistance > 0
    ) {
      const calc = calculateTravelTime(effectiveDistance, trip.transport.type);
      days = calc.days;
      overnightStops = calc.overnightStops;
      useTravelTime = true;
    } else {
      // Иначе пробуем вычислить дни по датам начала/конца
      const start = trip.startDate ? new Date(trip.startDate) : null;
      const end = trip.endDate ? new Date(trip.endDate) : null;
      if (start && end && start <= end) {
        days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    // Возвращаем результат через основную функцию бюджета
    return calculateBudget(
      trip,
      expenses,
      exchangeRates,
      displayCurrency,
      useTravelTime,
      days,
      overnightStops
    );
  }, [trip, expenses, exchangeRates, displayCurrency, travelDurationHours, routeDistance]);
};
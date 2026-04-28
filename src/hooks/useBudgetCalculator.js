import { useMemo } from 'react';
import { calculateBudget, calculateTravelTime } from '../utils/calculations';

export const useBudgetCalculator = (
  trip,
  expenses,
  exchangeRates,
  displayCurrency,
  travelDurationHours
) => {
  return useMemo(() => {
    let days = 0;
    let overnightStops = 0;
    let useTravelTime = false;

    if (travelDurationHours !== null && travelDurationHours !== undefined && travelDurationHours > 0 && trip.distance > 0) {
      const calc = calculateTravelTime(trip.distance, trip.transport.type);
      days = calc.days;
      overnightStops = calc.overnightStops;
      useTravelTime = true;
    } else {
      const start = trip.startDate ? new Date(trip.startDate) : null;
      const end = trip.endDate ? new Date(trip.endDate) : null;
      if (start && end && start <= end) {
        days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    return calculateBudget(trip, expenses, exchangeRates, displayCurrency, useTravelTime, days, overnightStops);
  }, [trip, expenses, exchangeRates, displayCurrency, travelDurationHours]);
};
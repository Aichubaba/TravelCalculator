import { haversineDistance } from '../utils/geo/haversine';
import { arePointsConnected } from '../utils/geo/continents';

describe('haversineDistance', () => {
  test('расстояние Москва – Санкт-Петербург ≈ 634 км', () => {
    const dist = haversineDistance(55.7558, 37.6176, 59.9343, 30.3351);
    expect(dist).toBeCloseTo(634, -1); // точность до десятков км
  });

  test('нулевое расстояние для одинаковых точек', () => {
    expect(haversineDistance(55.0, 37.0, 55.0, 37.0)).toBe(0);
  });
});

describe('arePointsConnected', () => {
  test('Европа–Азия связаны', () => {
    const points = [
      { lat: 55.75, lng: 37.62 }, // Москва
      { lat: 39.90, lng: 116.40 }  // Пекин
    ];
    expect(arePointsConnected(points)).toBe(true);
  });

  test('Европа–Австралия не связаны', () => {
    const points = [
      { lat: 55.75, lng: 37.62 }, // Москва
      { lat: -33.86, lng: 151.20 } // Сидней
    ];
    expect(arePointsConnected(points)).toBe(false);
  });
});
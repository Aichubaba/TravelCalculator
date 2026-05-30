import axios from 'axios';
import { haversineDistance } from '../../utils/geo/haversine';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/';

// Средние скорости для fallback (км/ч)
const AVG_SPEEDS = {
  driving: 60,
  walking: 5,
  cycling: 15,
};

// Генерация прямой геометрии между точками (для отрисовки линии)
function generateStraightLineGeometry(points) {
  return {
    type: 'LineString',
    coordinates: points.map(p => [p.lng, p.lat]),
  };
}

export const getRoute = async (points, profile = 'driving') => {
  if (points.length < 2) return null;

  // Пытаемся запросить OSRM, но с коротким таймаутом
  try {
    const coords = points.map(p => `${p.lng},${p.lat}`).join(';');
    const url = `${OSRM_BASE}${profile}/${coords}?overview=full&geometries=geojson`;
    const response = await axios.get(url, { timeout: 3000 }); // 3 секунды
    const route = response.data.routes[0];
    return {
      distance: route.distance / 1000,
      duration: route.duration / 3600,
      geometry: route.geometry,
      isFallback: false,
    };
  } catch (error) {
    // Fallback: расчёт по прямой через haversineDistance
    console.warn(`OSRM (${profile}) недоступен, используем прямой маршрут`);
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      totalDistance += haversineDistance(p1.lat, p1.lng, p2.lat, p2.lng);
    }

    const speed = AVG_SPEEDS[profile] || 60;
    const duration = totalDistance / speed;

    return {
      distance: totalDistance,
      duration,
      geometry: generateStraightLineGeometry(points),
      isFallback: true,
    };
  }
};
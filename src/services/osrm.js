import axios from 'axios';
import { haversineDistance, calculateStraightDistance } from '../utils/calculations';

const SERVER_LIST = [
  { name: 'OSRM Demo', proxyPath: '/osrm-router' },
  { name: 'FOSSGIS', proxyPath: '/osrm-fossgis' },
];

const AVG_SPEEDS = {
  driving: 60,
  walking: 5,
  cycling: 15,
};

function generateStraightLineGeometry(points) {
  return {
    type: 'LineString',
    coordinates: points.map(p => [p.lng, p.lat]),
  };
}

export const getRoute = async (points, profile = 'driving') => {
  if (points.length < 2) return null;

  // Пробуем каждый сервер по очереди
  for (const server of SERVER_LIST) {
    try {
      const coords = points.map(p => `${p.lng},${p.lat}`).join(';');
      const url = `${server.proxyPath}/route/v1/${profile}/${coords}?overview=full&geometries=geojson`;
      const response = await axios.get(url, { timeout: 5000 });
      const route = response.data.routes[0];
      return {
        distance: route.distance / 1000,
        duration: route.duration / 3600,
        geometry: route.geometry,
        isFallback: false,
      };
    } catch (error) {
      console.warn(`Сервер ${server.name} недоступен: ${error.message}`);
    }
  }

  // Fallback
  const totalDistance = calculateStraightDistance(points);
  const speed = AVG_SPEEDS[profile] || 60;
  const duration = totalDistance / speed;

  return {
    distance: totalDistance,
    duration,
    geometry: generateStraightLineGeometry(points),
    isFallback: true,
  };
};
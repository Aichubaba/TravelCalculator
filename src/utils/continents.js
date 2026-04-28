// Грубое определение континента по координатам.
// Для точных границ можно заменить на полигоны, но для предупреждений этого достаточно.

export function getContinent(lat, lng) {
  // Австралия и Океания
  if (lng > 110 && lng < 180 && lat > -45 && lat < -5) return 'Australia';
  // Антарктида (южнее 65°)
  if (lat < -65) return 'Antarctica';
  // Африка (грубо)
  if (lat > -35 && lat < 37 && lng > -17 && lng < 51) return 'Africa';
  // Южная Америка
  if (lat > -55 && lat < 12 && lng > -80 && lng < -35) return 'South America';
  // Северная Америка
  if (lat > 15 && lat < 70 && lng > -170 && lng < -50) return 'North America';
  // Европа
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) return 'Europe';
  // Азия (всё остальное, что восточнее Урала и до Берингова пролива)
  if (lng > 40 && lng < 180 && lat > 10 && lat < 80) return 'Asia';
  // Если не попало никуда, вернём null
  return null;
}

// Зоны сухопутной связности
const LAND_ZONES = {
  'Europe': 'AfroEurasia',
  'Asia': 'AfroEurasia',
  'Africa': 'AfroEurasia',
  'North America': 'Americas',
  'South America': 'Americas',
  'Australia': 'Oceania',
  'Antarctica': 'Antarctica',
};

/**
 * Проверяет, принадлежат ли все точки одной сухопутной зоне.
 * @param {Array} points - массив точек { lat, lng }
 * @returns {boolean} true если все точки в одной зоне, иначе false
 */
export function arePointsConnected(points) {
  const zones = new Set();
  for (const point of points) {
    const continent = getContinent(point.lat, point.lng);
    if (!continent) continue; // неизвестный континент – считаем, что может быть соединено
    const zone = LAND_ZONES[continent];
    if (zone) zones.add(zone);
  }
  return zones.size <= 1;
}
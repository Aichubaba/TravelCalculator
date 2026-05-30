export function getContinent(lat, lng) {
  if (lng > 110 && lng < 180 && lat > -45 && lat < -5) return 'Australia';
  if (lat < -65) return 'Antarctica';
  if (lat > -35 && lat < 37 && lng > -17 && lng < 51) return 'Africa';
  if (lat > -55 && lat < 12 && lng > -80 && lng < -35) return 'South America';
  if (lat > 15 && lat < 70 && lng > -170 && lng < -50) return 'North America';
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) return 'Europe';
  if (lng > 40 && lng < 180 && lat > 10 && lat < 80) return 'Asia';
  return null;
}

const LAND_ZONES = {
  Europe: 'AfroEurasia', Asia: 'AfroEurasia', Africa: 'AfroEurasia',
  'North America': 'Americas', 'South America': 'Americas',
  Australia: 'Oceania', Antarctica: 'Antarctica',
};

export function arePointsConnected(points) {
  const zones = new Set();
  for (const point of points) {
    const continent = getContinent(point.lat, point.lng);
    if (!continent) continue;
    const zone = LAND_ZONES[continent];
    if (zone) zones.add(zone);
  }
  return zones.size <= 1;
}
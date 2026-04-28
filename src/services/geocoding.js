const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const DEFAULT_HEADERS = {
  Accept: 'application/json',
};

export const searchAddresses = async (query, limit = 5) => {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
    format: 'jsonv2',
    addressdetails: '1',
    limit: String(limit),
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: DEFAULT_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`Geocoding request failed with status ${response.status}`);
  }

  const data = await response.json();

  return data.map(item => ({
    id: item.place_id?.toString() || `${item.lat}-${item.lon}`,
    lat: Number(item.lat),
    lng: Number(item.lon),
    name: item.display_name,
  }));
};
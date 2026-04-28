import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getRoute } from '../../services/osrm';
import { arePointsConnected } from '../../utils/continents';
import { haversineDistance } from '../../utils/calculations';
import { FaTrash, FaTimes, FaLink, FaExclamationTriangle } from 'react-icons/fa';

// Исправление иконок Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Компонент для обработки кликов по карте
const MapClickHandler = ({ onAddPoint }) => {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng);
    },
  });
  return null;
};

const MapComponent = ({ points = [], onPointsChange, onRouteInfo, showRoute, transportType }) => {
  const safePoints = Array.isArray(points) ? points : [];
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [selectedConnect, setSelectedConnect] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const dragTimerRef = useRef(null);
  const retryTimerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const lastRequestRef = useRef(null);
  const [routeWarning, setRouteWarning] = useState('');

  const profileMap = { car: 'driving', public: 'driving', walk: 'walking' };
  const activePoints = safePoints.filter(p => !p.excluded);

  const fetchRoute = async () => {
    if (isDragging) return;
    if (activePoints.length < 2) {
      setRouteGeometry([]);
      onRouteInfo({ distance: 0, duration: null, geometry: null });
      lastRequestRef.current = null;
      setRouteWarning('');
      return;
    }

    const profile = profileMap[transportType] || 'driving';
    const coords = activePoints.map(p => `${p.lng},${p.lat}`);
    console.log('OSRM request coordinates:', coords.join(';'), 'profile:', profile);

    const requestKey = JSON.stringify({ coords, profile });
    if (lastRequestRef.current === requestKey) return;
    lastRequestRef.current = requestKey;

    // Проверка на межконтинентальный маршрут
    if (!arePointsConnected(activePoints)) {
      setRouteWarning('Маршрут пересекает несвязанные континенты. Автомобильное сообщение невозможно.');
    } else {
      setRouteWarning('');
    }

    try {
      const data = await getRoute(activePoints, profile);
      if (data) {
        // Проверка: достигнут ли конечный пункт?
        if (data.geometry && data.geometry.coordinates.length > 0) {
          const lastRouteCoord = data.geometry.coordinates[data.geometry.coordinates.length - 1];
          const lastRoutePoint = { lat: lastRouteCoord[1], lng: lastRouteCoord[0] };
          const destinationPoint = activePoints[activePoints.length - 1];
          const distToDestination = haversineDistance(
            lastRoutePoint.lat, lastRoutePoint.lng,
            destinationPoint.lat, destinationPoint.lng
          );
          // Если расстояние до цели больше 50 км, маршрут, вероятно, обрывается водой
          if (distToDestination > 50) {
            setRouteWarning('Маршрут не может быть завершён – путь прерывается водной преградой.');
          }
        }

        let geom = [];
        if (data.geometry && showRoute) {
          geom = data.geometry.coordinates.map(c => [c[1], c[0]]);
        } else if (showRoute) {
          geom = activePoints.map(p => [p.lat, p.lng]);
        }
        setRouteGeometry(geom);
        onRouteInfo({
          distance: data.distance,
          duration: data.duration,
          geometry: data.geometry,
        });

        // Если маршрут fallback – планируем повторную попытку через 5 секунд
        if (data.isFallback && !retryTimerRef.current) {
          retryTimerRef.current = setTimeout(() => {
            retryTimerRef.current = null;
            fetchRoute();
          }, 5000);
        }
      }
    } catch (error) {
      console.warn('OSRM request failed', error);
    }
  };

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (retryTimerRef.current) return;

    debounceTimerRef.current = setTimeout(fetchRoute, 500);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [activePoints, showRoute, transportType]);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const handleMarkerDrag = (id, e) => {
    setIsDragging(true);
    const newPos = e.target.getLatLng();
    onPointsChange(
      safePoints.map(p => (p.id === id ? { ...p, lat: newPos.lat, lng: newPos.lng } : p))
    );
  };

  const handleMarkerDragEnd = () => {
    if (dragTimerRef.current) clearTimeout(dragTimerRef.current);
    dragTimerRef.current = setTimeout(() => setIsDragging(false), 100);
  };

  const handleAddPoint = latlng => {
    if (isDragging) return;
    const newPoint = {
      id: Date.now().toString(),
      lat: latlng.lat,
      lng: latlng.lng,
      name: `Точка ${safePoints.length + 1}`,
      comment: '',
      excluded: false,
    };
    onPointsChange([...safePoints, newPoint]);
  };

  const handleDeletePoint = id => {
    onPointsChange(safePoints.filter(p => p.id !== id));
  };

  const handleClearAll = () => {
    onPointsChange([]);
  };

  const handleCommentChange = (id, comment) => {
    onPointsChange(safePoints.map(p => (p.id === id ? { ...p, comment } : p)));
  };

  const handleToggleExcluded = id => {
    onPointsChange(safePoints.map(p => (p.id === id ? { ...p, excluded: !p.excluded } : p)));
  };

  const handleConnect = (fromId, toId) => {
    if (fromId === toId) return;
    const fromIndex = safePoints.findIndex(p => p.id === fromId);
    const toIndex = safePoints.findIndex(p => p.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;
    const newPoints = [...safePoints];
    const [fromPoint] = newPoints.splice(fromIndex, 1);
    const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    newPoints.splice(insertIndex, 0, fromPoint);
    onPointsChange(newPoints);
  };

  const center = safePoints.length > 0
    ? [safePoints[0].lat, safePoints[0].lng]
    : [55.76, 37.64]; // Москва по умолчанию

  return (
    <>
      <MapContainer center={center} zoom={5} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onAddPoint={handleAddPoint} />
        {safePoints.map(point => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            draggable
            eventHandlers={{
              drag: e => handleMarkerDrag(point.id, e),
              dragend: handleMarkerDragEnd,
            }}
            title={point.comment || point.name}
            opacity={point.excluded ? 0.5 : 1}
          >
            <Popup minWidth={220}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{point.name}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDeletePoint(point.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Удалить точку"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Комментарий"
                  value={point.comment || ''}
                  onChange={e => handleCommentChange(point.id, e.target.value)}
                  className="w-full border rounded p-1 text-sm"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={point.excluded || false}
                    onChange={() => handleToggleExcluded(point.id)}
                  />
                  Исключить из маршрута
                </label>
                {safePoints.length > 1 && (
                  <div className="flex items-center gap-1">
                    <select
                      className="flex-1 border rounded p-1 text-sm"
                      onChange={e =>
                        setSelectedConnect({
                          ...selectedConnect,
                          [point.id]: e.target.value,
                        })
                      }
                      value={selectedConnect[point.id] || ''}
                    >
                      <option value="">Соединить с...</option>
                      {safePoints
                        .filter(p => p.id !== point.id)
                        .map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => {
                        const toId = selectedConnect[point.id];
                        if (toId) handleConnect(point.id, toId);
                      }}
                      className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                      title="Соединить"
                    >
                      <FaLink size={14} />
                    </button>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        {routeGeometry.length > 0 && <Polyline positions={routeGeometry} color="blue" weight={4} />}
      </MapContainer>

      {routeWarning && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1001] transition-all duration-500 ease-in-out">
          <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg shadow-md">
            <FaExclamationTriangle className="text-yellow-600" />
            <span className="text-sm">{routeWarning}</span>
            <button onClick={() => setRouteWarning('')} className="ml-2 text-yellow-600 hover:text-yellow-800">
              <FaTimes size={14} />
            </button>
          </div>
        </div>
      )}

      {safePoints.length > 0 && (
        <button
          onClick={handleClearAll}
          className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
          title="Очистить все точки"
        >
          <FaTimes className="text-red-500" size={20} />
        </button>
      )}
    </>
  );
};

export default MapComponent;
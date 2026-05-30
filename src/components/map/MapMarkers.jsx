import React, { useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FaTrash, FaLink } from 'react-icons/fa';

// Убеждаемся, что иконки Leaflet загружены корректно (делаем один раз при импорте)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapMarkers = ({
  points,
  onMarkerDrag,
  onMarkerDragEnd,
  onDeletePoint,
  onCommentChange,
  onToggleExcluded,
  onConnect,
}) => {
  const [selectedConnect, setSelectedConnect] = useState({});

  if (!points || points.length === 0) return null;

  return points.map((point) => (
    <Marker
      key={point.id}
      position={[point.lat, point.lng]}
      draggable
      eventHandlers={{
        drag: (e) => {
          onMarkerDrag(point.id, e.target.getLatLng());
        },
        dragend: () => {
          if (onMarkerDragEnd) onMarkerDragEnd();
        },
      }}
      title={point.comment || point.name}
      opacity={point.excluded ? 0.5 : 1}
    >
      <Popup minWidth={220}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">{point.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeletePoint(point.id);
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
            onChange={(e) => onCommentChange(point.id, e.target.value)}
            className="w-full border rounded p-1 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={point.excluded || false}
              onChange={() => onToggleExcluded(point.id)}
            />
            Исключить из маршрута
          </label>
          {points.length > 1 && (
            <div className="flex items-center gap-1">
              <select
                className="flex-1 border rounded p-1 text-sm"
                onChange={(e) =>
                  setSelectedConnect({
                    ...selectedConnect,
                    [point.id]: e.target.value,
                  })
                }
                value={selectedConnect[point.id] || ''}
              >
                <option value="">Соединить с...</option>
                {points
                  .filter((p) => p.id !== point.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              <button
                onClick={() => {
                  const toId = selectedConnect[point.id];
                  if (toId) onConnect(point.id, toId);
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
  ));
};

export default MapMarkers;
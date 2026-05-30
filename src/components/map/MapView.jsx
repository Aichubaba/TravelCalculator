import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import MapClickHandler from './MapClickHandler';
import MapMarkers from './MapMarkers';
import RoutePolyline from './RoutePolyline';
import MapWarning from './MapWarning';

const MapView = ({
  center,
  points,
  onAddPoint,
  onMarkerDrag,
  onMarkerDragEnd,
  onDeletePoint,
  onCommentChange,
  onToggleExcluded,
  onConnect,
  routeGeometry,
  showRoute,
  routeWarning,
  onCloseWarning,
}) => {
  // Обработка клика карты – делегируется MapClickHandler
  return (
    <>
      <MapContainer center={center} zoom={5} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapClickHandler onAddPoint={onAddPoint} />
        <MapMarkers
          points={points}
          onMarkerDrag={onMarkerDrag}
          onMarkerDragEnd={onMarkerDragEnd}
          onDeletePoint={onDeletePoint}
          onCommentChange={onCommentChange}
          onToggleExcluded={onToggleExcluded}
          onConnect={onConnect}
        />
        {showRoute && <RoutePolyline geometry={routeGeometry} />}
      </MapContainer>

      {/* Предупреждение поверх карты */}
      <MapWarning message={routeWarning} onClose={onCloseWarning} />
    </>
  );
};

export default MapView;
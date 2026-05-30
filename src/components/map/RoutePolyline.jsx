import React from 'react';
import { Polyline } from 'react-leaflet';

const RoutePolyline = ({ geometry }) => {
  if (!geometry || geometry.length === 0) return null;
  return <Polyline positions={geometry} color="blue" weight={4} />;
};

export default RoutePolyline;
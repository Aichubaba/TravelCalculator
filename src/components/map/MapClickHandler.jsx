import { useMapEvents } from 'react-leaflet';

const MapClickHandler = ({ onAddPoint }) => {
  useMapEvents({
    click(e) {
      onAddPoint(e.latlng);
    },
  });
  return null;
};

export default MapClickHandler;
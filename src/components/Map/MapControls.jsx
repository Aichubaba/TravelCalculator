import React, { useState } from 'react';
import { FaRoute, FaClock, FaToggleOn, FaToggleOff, FaListUl, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import RouteList from './RouteList';
import { calculateTravelTime, formatDuration } from '../../utils/calculations';

const MapControls = ({
  points,
  distance,
  transportType,
  showRoute,
  useTravelTime,
  autoConnect,
  onToggleRoute,
  onToggleUseTravelTime,
  onToggleAutoConnect,
  onReorderPoints,
  onRenamePoint,
  onDeletePoint,
  onToggleExcluded,
}) => {
  const [showRouteList, setShowRouteList] = useState(false);
  const travelCalc = distance > 0 ? calculateTravelTime(distance, transportType) : null;
  const displayDuration = travelCalc ? travelCalc.totalHours : null;

  return (
    <div className="w-full max-w-[20rem] rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm space-y-3 sm:w-64">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Маршрут</span>
        <button
          onClick={onToggleRoute}
          className="text-blue-600 hover:text-blue-800"
          title={showRoute ? 'Скрыть маршрут' : 'Показать маршрут'}
        >
          {showRoute ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
        </button>
      </div>
      <div className="text-sm space-y-1">
        <div className="flex items-center gap-2">
          <FaRoute className="text-gray-500" />
          <span>Расстояние: {distance.toFixed(1)} км</span>
        </div>
        <div className="flex items-center gap-2">
          <FaClock className="text-gray-500" />
          <span>Время в пути: {formatDuration(displayDuration)}</span>
        </div>
        {travelCalc && <div className="text-xs text-gray-500">(с учётом остановок и ночёвок)</div>}
      </div>
      <div className="flex items-center justify-between border-t pt-2">
        <span className="text-sm font-medium">Исп. время в пути</span>
        <button
          onClick={onToggleUseTravelTime}
          className="text-blue-600 hover:text-blue-800"
          title={useTravelTime ? 'Отключить' : 'Включить'}
        >
          {useTravelTime ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Автосоединение</span>
        <button
          onClick={onToggleAutoConnect}
          className="text-blue-600 hover:text-blue-800"
          title={autoConnect ? 'Отключить' : 'Включить'}
        >
          {autoConnect ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
        </button>
      </div>

      <div className="border-t pt-2">
        <button
          onClick={() => setShowRouteList(!showRouteList)}
          className="flex items-center justify-between w-full text-sm font-medium hover:bg-gray-100 p-1 rounded"
        >
          <span className="flex items-center gap-1">
            <FaListUl size={14} />
            Порядок маршрута ({points.length})
          </span>
          {showRouteList ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
        </button>
        {showRouteList && (
          <div className="mt-2">
            <RouteList
              points={points}
              onReorder={onReorderPoints}
              onRename={onRenamePoint}
              onDelete={onDeletePoint}
              onToggleExcluded={onToggleExcluded}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapControls;

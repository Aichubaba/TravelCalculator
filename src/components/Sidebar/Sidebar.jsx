import React, { useState } from 'react';
import { FaRoute, FaClock, FaBed, FaToggleOn, FaToggleOff, FaChevronDown, FaChevronUp, FaTrash, FaPen } from 'react-icons/fa';
import { calculateTravelTime, getTravelWarning } from '../../utils/calculations';
import { useTranslation } from '../../hooks/useTranslation';
import PointsOrderList from './PointsOrderList'; // новый компонент с drag-and-drop

const Sidebar = ({
  darkMode, language, routeInfo, transportType, useTravelTime, setUseTravelTime,
  showRoute, setShowRoute, points, onDeletePoint, onRenamePoint, onReorderPoints,
  onOpenSection, selectedSection,
}) => {
  const { t } = useTranslation(language);
  const [showRouteOrder, setShowRouteOrder] = useState(false);

  const travelCalc = routeInfo.distance > 0 ? calculateTravelTime(routeInfo.distance, transportType) : null;
  const warning = getTravelWarning(transportType, travelCalc?.pureHours, useTravelTime);

  const formatDuration = (hours) => {
    if (!hours) return '—';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h} ч ${m} мин`;
  };

  const bgClass = darkMode ? 'bg-gray-900 text-white' : 'bg-purple-100 text-purple-900';
  const borderClass = darkMode ? 'border-gray-700' : 'border-purple-300';

  return (
    <div className={`w-80 h-full flex flex-col p-6 ${bgClass} transition-colors duration-300 border-r ${borderClass} z-10`}>
      {/* Кнопки секций (вверху) */}
      <div className="space-y-3 mb-6">
        {['parameters', 'expenses', 'budget'].map((section) => (
          <button
            key={section}
            onClick={() => onOpenSection(selectedSection === section ? null : section)}
            className={`w-full text-left px-4 py-2 rounded-lg border border-purple-500 transition-all ${
              selectedSection === section
                ? 'bg-purple-500 text-white'
                : 'hover:bg-purple-200 dark:hover:bg-gray-700 text-purple-800 dark:text-purple-300'
            }`}
          >
            {t(section)}
          </button>
        ))}
      </div>

      {/* Переключатель отображения маршрута */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium">{t('routeVisibility')}</span>
        <button onClick={() => setShowRoute(!showRoute)} className="text-purple-600 dark:text-purple-400 hover:text-purple-800">
          {showRoute ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
        </button>
      </div>

      {/* Информация о маршруте */}
      {routeInfo.distance > 0 && (
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2">
            <FaRoute className="text-purple-500" />
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {routeInfo.distance.toFixed(1)} км
            </span>
          </div>
          {routeInfo.duration && (
            <div className="flex items-center gap-2">
              <FaClock className="text-purple-500" />
              <span className="text-sm">{t('time')}: {formatDuration(routeInfo.duration)}</span>
            </div>
          )}
          {travelCalc && (
            <>
              <div className="flex items-center gap-2">
                <FaBed className="text-purple-500" />
                <span className="text-sm">{t('withStops')}: {formatDuration(travelCalc.totalHours)}</span>
              </div>
              {travelCalc.overnightStops > 0 && (
                <p className="text-sm">{t('nights')}: {travelCalc.overnightStops}</p>
              )}
            </>
          )}
          {routeInfo.isFallback && (
            <p className="text-sm text-red-500">{t('approx')}</p>
          )}
          {warning && typeof warning === 'string' ? (
            <p className="text-sm text-red-600 dark:text-red-400">{warning}</p>
          ) : warning && typeof warning === 'object' ? (
            <p className={`text-sm ${warning.color || 'text-red-600'}`}>{warning.text || ''}</p>
          ) : null}
        </div>
      )}

      {/* Переключатель использования времени в пути */}
      <div className={`flex items-center justify-between border-t ${borderClass} pt-3 mt-3`}>
        <span className="text-sm font-medium">{t('useTravelTime')}</span>
        <button onClick={() => setUseTravelTime(!useTravelTime)} className="text-purple-600 dark:text-purple-400 hover:text-purple-800">
          {useTravelTime ? <FaToggleOn size={24} /> : <FaToggleOff size={24} />}
        </button>
      </div>

      {/* Порядок маршрута с drag-and-drop */}
      <div className={`mt-4 border-t ${borderClass} pt-3`}>
        <button
          onClick={() => setShowRouteOrder(!showRouteOrder)}
          className="flex items-center justify-between w-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-gray-500 p-1 rounded"
        >
          <span>{t('routeOrder')} ({points.length})</span>
          {showRouteOrder ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
        </button>
        {showRouteOrder && (
          <div className="mt-2 max-h-60 overflow-y-auto">
            <PointsOrderList
              points={points}
              onDelete={onDeletePoint}
              onRename={onRenamePoint}
              onReorder={onReorderPoints}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
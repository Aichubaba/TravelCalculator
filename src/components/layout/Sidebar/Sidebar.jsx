import React from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import RouteInfoPanel from './RouteInfoPanel';

const Sidebar = ({
  darkMode,
  language,
  routeInfo,
  transportType,
  useTravelTime,
  setUseTravelTime,
  showRoute,
  setShowRoute,
  points,
  onDeletePoint,
  onRenamePoint,
  onReorderPoints,
  onOpenSection,
  selectedSection,
}) => {
  const { t } = useTranslation(language);

  const bgClass = darkMode
    ? 'bg-gray-900 text-white'
    : 'bg-purple-100 text-purple-900';
  const borderClass = darkMode ? 'border-gray-700' : 'border-purple-300';

  return (
    <div className={`w-80 h-full flex flex-col p-6 ${bgClass} transition-colors duration-300 border-r ${borderClass} z-10`}>
      {/* Кнопки секций */}
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

      {/* Панель информации о маршруте и порядке точек */}
      <RouteInfoPanel
        darkMode={darkMode}
        language={language}
        routeInfo={routeInfo}
        transportType={transportType}
        showRoute={showRoute}
        setShowRoute={setShowRoute}
        useTravelTime={useTravelTime}
        setUseTravelTime={setUseTravelTime}
        points={points}
        onDeletePoint={onDeletePoint}
        onRenamePoint={onRenamePoint}
        onReorderPoints={onReorderPoints}
      />
    </div>
  );
};

export default Sidebar;
import React from 'react';
import TopBar from './TopBar/TopBar';
import Sidebar from './Sidebar/Sidebar';

/**
 * Общий скелет приложения: верхняя панель, боковая панель и контент (карта).
 * Свойства, необходимые для TopBar и Sidebar, передаются прозрачно.
 */
const AppShell = ({ children, darkMode, ...layoutProps }) => {
  return (
    <div className={`h-screen w-screen flex flex-col ${darkMode ? 'dark' : ''} relative overflow-hidden`}>
      {/* Верхняя панель */}
      <div className="z-20">
        <TopBar darkMode={darkMode} {...layoutProps} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Боковая панель */}
        <Sidebar darkMode={darkMode} {...layoutProps} />
        {/* Контент (карта) */}
        {children}
      </div>
    </div>
  );
};

export default AppShell;
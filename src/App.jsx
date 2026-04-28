import React, { useEffect, lazy, Suspense, useState } from 'react';
import TopBar from './components/TopBar/TopBar';
import Sidebar from './components/Sidebar/Sidebar';
import RightPanel from './components/RightPanel/RightPanel';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useBudgetCalculator } from './hooks/useBudgetCalculator';
import { fetchExchangeRates } from './services/exchange';

const MapComponent = lazy(() => import('./components/Map/MapComponent'));

const initialTrip = {
  points: [],
  startDate: '',
  endDate: '',
  travelers: 1,
  transport: {
    type: 'car',
    fuelConsumption: 8,
    fuelType: 'gasoline',
    fuelCost: 63.2858,
  },
  distance: 0,
};

const initialExpenses = [
  { id: 'accommodation', name: 'Проживание', type: 'daily', value: 2000, currency: 'RUB' },
  { id: 'food', name: 'Питание', type: 'daily', value: 1500, currency: 'RUB' },
];

const initialSettings = {
  displayCurrency: 'RUB',
  exchangeRates: { RUB: 1 },
  lastRatesUpdate: null,
};

function App() {
  const [tripData, setTripData] = useLocalStorage('trip', initialTrip);
  const [expenses, setExpenses] = useLocalStorage('expenses', initialExpenses);
  const [settings, setSettings] = useLocalStorage('settings', initialSettings);

  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('ru');
  const [selectedSection, setSelectedSection] = useState(null);

  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: null, geometry: null });
  const [showRoute, setShowRoute] = useState(true);
  const [useTravelTime, setUseTravelTime] = useState(false);

  const { total, breakdown, days } = useBudgetCalculator(
    tripData,
    expenses,
    settings.exchangeRates,
    settings.displayCurrency,
    useTravelTime ? routeInfo.duration : null
  );

  // Загрузка курсов валют
  useEffect(() => {
    const loadRates = async () => {
      const data = await fetchExchangeRates();
      if (data) {
        setSettings(prev => ({
          ...prev,
          exchangeRates: data.rates,
          lastRatesUpdate: data.timestamp,
        }));
      }
    };
    loadRates();
    const interval = setInterval(loadRates, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [setSettings]);

  // Топливо для авто
  useEffect(() => {
    const { type, fuelConsumption, fuelCost } = tripData.transport;
    if (type === 'car' && routeInfo.distance > 0 && fuelConsumption > 0 && fuelCost > 0) {
      const fuelExpenseValue = (routeInfo.distance / 100) * fuelConsumption * fuelCost;
      setExpenses(prev => {
        const fuelIndex = prev.findIndex(e => e.id === 'fuel');
        if (fuelIndex !== -1) {
          const updated = [...prev];
          updated[fuelIndex] = { ...updated[fuelIndex], value: fuelExpenseValue };
          return updated;
        }
        return [...prev, { id: 'fuel', name: 'Топливо', type: 'fixed', value: fuelExpenseValue, currency: 'RUB' }];
      });
    } else {
      setExpenses(prev => prev.filter(e => e.id !== 'fuel'));
    }
  }, [routeInfo.distance, tripData.transport, setExpenses]);

  // Категория для общественного транспорта
  useEffect(() => {
    const { type } = tripData.transport;
    if (type === 'public') {
      setExpenses(prev => {
        const publicIndex = prev.findIndex(e => e.id === 'public_transport');
        if (publicIndex === -1) {
          return [...prev, { id: 'public_transport', name: 'Стоимость проезда', type: 'fixed', value: 0, currency: 'RUB' }];
        }
        return prev;
      });
    } else {
      setExpenses(prev => prev.filter(e => e.id !== 'public_transport'));
    }
  }, [tripData.transport.type, setExpenses]);

  // Обработчик выбора адреса из поиска
  const handleAddressSelect = (address) => {
    setTripData(prev => ({
      ...prev,
      points: [
        ...prev.points,
        {
          id: Date.now().toString(),
          lat: address.lat,
          lng: address.lng,
          name: address.name.split(',')[0] || `Точка ${prev.points.length + 1}`,
          comment: '',
          excluded: false,
        },
      ],
    }));
  };

  const handleDeletePoint = (id) => {
    setTripData(prev => ({
      ...prev,
      points: prev.points.filter(p => p.id !== id),
    }));
  };

  const handleRenamePoint = (id, newName) => {
    setTripData(prev => ({
      ...prev,
      points: prev.points.map(p => (p.id === id ? { ...p, name: newName } : p)),
    }));
  };

  const handleReorderPoints = (newPoints) => {
    setTripData(prev => ({ ...prev, points: newPoints }));
  };

  return (
    <div className={`h-screen w-screen flex flex-col ${darkMode ? 'dark' : ''} relative overflow-hidden`}>
      {/* Верхняя панель – z-20, чтобы выпадающий список был поверх карты */}
      <div className="z-20">
        <TopBar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          language={language}
          setLanguage={setLanguage}
          displayCurrency={settings.displayCurrency}
          setDisplayCurrency={(curr) => setSettings(prev => ({ ...prev, displayCurrency: curr }))}
          onSelectAddress={handleAddressSelect}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Левая боковая панель – z-10 */}
        <Sidebar
          darkMode={darkMode}
          language={language}
          routeInfo={routeInfo}
          transportType={tripData.transport.type}
          useTravelTime={useTravelTime}
          setUseTravelTime={setUseTravelTime}
          showRoute={showRoute}
          setShowRoute={setShowRoute}
          points={tripData.points}
          onDeletePoint={handleDeletePoint}
          onRenamePoint={handleRenamePoint}
          onReorderPoints={handleReorderPoints}
          onOpenSection={setSelectedSection}
          selectedSection={selectedSection}
        />

        {/* Карта – z-0 */}
        <div className="relative flex-1 border-l-2 border-t-2 border-dashed border-purple-500 rounded-2xl m-1 z-0">
          <Suspense fallback={
            <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
              Загрузка карты...
            </div>
          }>
            <MapComponent
              points={tripData.points}
              onPointsChange={(newPoints) => setTripData(prev => ({ ...prev, points: newPoints }))}
              onRouteInfo={setRouteInfo}
              showRoute={showRoute}
              transportType={tripData.transport.type}
            />
          </Suspense>
        </div>
      </div>

      {/* Правая нижняя панель – z-50, поверх всего */}
      {selectedSection && (
        <RightPanel
          selectedSection={selectedSection}
          trip={tripData}
          onTripChange={setTripData}
          useTravelTime={useTravelTime}
          expenses={expenses}
          setExpenses={setExpenses}
          displayCurrency={settings.displayCurrency}
          budget={{ total, breakdown }}
          onChangeCurrency={(curr) => setSettings(prev => ({ ...prev, displayCurrency: curr }))}
          days={days}
          transportType={tripData.transport.type}
          distance={routeInfo.distance}
          onClose={() => setSelectedSection(null)}
          language={language}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default App;
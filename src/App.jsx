// src/App.jsx
import React, { useEffect, useState } from 'react';
import AppShell from './components/layout/AppShell';
import RightPanel from './components/layout/RightPanel/RightPanel';
import MapView from './components/map/MapView';
import MapWarning from './components/map/MapWarning';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useBudgetCalculator } from './hooks/useBudgetCalculator';
import { useRoute } from './hooks/useRoute';
import { fetchExchangeRates } from './services/api/exchange';
import { fetchFuelPrices } from './services/api/fuelPrice';

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
  const [showRoute, setShowRoute] = useState(true);
  const [useTravelTime, setUseTravelTime] = useState(false);

  // Точки, участвующие в маршруте (не исключены)
  const activePoints = tripData.points.filter((p) => !p.excluded);

  // Хук маршрута
  const { routeGeometry, routeInfo, routeWarning, setRouteWarning, setDragging } = useRoute(
    activePoints,
    showRoute,
    tripData.transport.type
  );

  // Хук бюджета (добавлен routeInfo.distance)
  const { total, breakdown, days } = useBudgetCalculator(
    tripData,
    expenses,
    settings.exchangeRates,
    settings.displayCurrency,
    useTravelTime ? routeInfo.duration : null,
    routeInfo.distance
  );

  // Загрузка курсов валют
  useEffect(() => {
    const loadRates = async () => {
      const data = await fetchExchangeRates();
      if (data) {
        setSettings((prev) => ({
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

  // Автоматический расчёт топлива для авто
  useEffect(() => {
    const { type, fuelConsumption, fuelCost } = tripData.transport;
    if (type === 'car' && routeInfo.distance > 0 && fuelConsumption > 0 && fuelCost > 0) {
      const fuelExpenseValue = (routeInfo.distance / 100) * fuelConsumption * fuelCost;
      setExpenses((prev) => {
        const fuelIndex = prev.findIndex((e) => e.id === 'fuel');
        if (fuelIndex !== -1) {
          const updated = [...prev];
          updated[fuelIndex] = { ...updated[fuelIndex], value: fuelExpenseValue };
          return updated;
        }
        return [...prev, { id: 'fuel', name: 'Топливо', type: 'fixed', value: fuelExpenseValue, currency: 'RUB' }];
      });
    } else {
      setExpenses((prev) => prev.filter((e) => e.id !== 'fuel'));
    }
  }, [routeInfo.distance, tripData.transport, setExpenses]);

  // Категория «Стоимость проезда» для общественного транспорта
  useEffect(() => {
    if (tripData.transport.type === 'public') {
      setExpenses((prev) => {
        if (!prev.find((e) => e.id === 'public_transport')) {
          return [...prev, { id: 'public_transport', name: 'Стоимость проезда', type: 'fixed', value: 0, currency: 'RUB' }];
        }
        return prev;
      });
    } else {
      setExpenses((prev) => prev.filter((e) => e.id !== 'public_transport'));
    }
  }, [tripData.transport.type, setExpenses]);

  // Обработчик выбора адреса из поиска TopBar
  const handleAddressSelect = (address) => {
    setTripData((prev) => ({
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

  // Работа с точками
  const handleDeletePoint = (id) => {
    setTripData((prev) => ({ ...prev, points: prev.points.filter((p) => p.id !== id) }));
  };
  const handleRenamePoint = (id, newName) => {
    setTripData((prev) => ({ ...prev, points: prev.points.map((p) => (p.id === id ? { ...p, name: newName } : p)) }));
  };
  const handleReorderPoints = (newPoints) => {
    setTripData((prev) => ({ ...prev, points: newPoints }));
  };
  const handleAddPoint = (latlng) => {
    setTripData((prev) => ({
      ...prev,
      points: [
        ...prev.points,
        {
          id: Date.now().toString(),
          lat: latlng.lat,
          lng: latlng.lng,
          name: `Точка ${prev.points.length + 1}`,
          comment: '',
          excluded: false,
        },
      ],
    }));
  };
  const handleMarkerDrag = (id, latlng) => {
    setDragging(true);
    setTripData((prev) => ({
      ...prev,
      points: prev.points.map((p) => (p.id === id ? { ...p, lat: latlng.lat, lng: latlng.lng } : p)),
    }));
  };
  const handleMarkerDragEnd = () => setDragging(false);
  const handleToggleExcluded = (id) => {
    setTripData((prev) => ({
      ...prev,
      points: prev.points.map((p) => (p.id === id ? { ...p, excluded: !p.excluded } : p)),
    }));
  };
  const handleConnect = (fromId, toId) => {
    const newPoints = [...tripData.points];
    const fromIdx = newPoints.findIndex((p) => p.id === fromId);
    const toIdx = newPoints.findIndex((p) => p.id === toId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [from] = newPoints.splice(fromIdx, 1);
    newPoints.splice(fromIdx < toIdx ? toIdx - 1 : toIdx, 0, from);
    setTripData((prev) => ({ ...prev, points: newPoints }));
  };

  const handleCommentChange = (id, comment) => {
    setTripData((prev) => ({
      ...prev,
      points: prev.points.map((p) => (p.id === id ? { ...p, comment } : p)),
    }));
  };

  // Центр карты – первая точка или Москва
  const center = tripData.points.length > 0
    ? [tripData.points[0].lat, tripData.points[0].lng]
    : [55.76, 37.64];

  return (
    <AppShell
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      language={language}
      setLanguage={setLanguage}
      displayCurrency={settings.displayCurrency}
      setDisplayCurrency={(curr) => setSettings((prev) => ({ ...prev, displayCurrency: curr }))}
      onSelectAddress={handleAddressSelect}
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
    >
      {/* Граница карты: фиолетовый пунктир сверху и слева, жирнее, без отступа */}
      <div className="relative flex-1 border-l-4 border-t-4 border-dashed border-purple-500 rounded-2xl m-0 z-0">
        <MapView
          center={center}
          points={tripData.points}
          onAddPoint={handleAddPoint}
          onMarkerDrag={handleMarkerDrag}
          onMarkerDragEnd={handleMarkerDragEnd}
          onDeletePoint={handleDeletePoint}
          onCommentChange={handleCommentChange}
          onToggleExcluded={handleToggleExcluded}
          onConnect={handleConnect}
          routeGeometry={routeGeometry}
          showRoute={showRoute}
          routeWarning={routeWarning}
          onCloseWarning={() => setRouteWarning('')}
        />
      </div>

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
          days={days}
          transportType={tripData.transport.type}
          distance={routeInfo.distance}
          onClose={() => setSelectedSection(null)}
          language={language}
          darkMode={darkMode}
          exchangeRates={settings.exchangeRates}
        />
      )}
    </AppShell>
  );
}

export default App;
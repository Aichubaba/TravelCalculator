# TravelCalculator 🚗

**Приложение для расчёта бюджета путешествий, маршрутов и расходов на топливо**

> Курсовая работа 2025/26 SUSU

## 📋 Содержание
- [Обзор](#обзор)
- [Возможности](#возможности)
- [Технологический стек](#технологический-стек)
- [Архитектура](#архитектура)
- [Установка и запуск](#установка-и-запуск)
- [Структура проекта](#структура-проекта)
- [API и сервисы](#api-и-сервисы)
- [План оптимизации](#план-оптимизации)

---

## 🎯 Обзор

**TravelCalculator** — это web-приложение для планирования автомобильных путешествий. Позволяет:
- Рассчитать маршрут между несколькими точками на интерактивной карте
- Вычислить бюджет поездки с учётом жилья, питания и расхода топлива
- Конвертировать валюты с актуальными курсами
- Рассчитать время в пути с учётом отдыха и ночёвок
- Сохранять данные в локальном хранилище браузера

---

## ✨ Возможности

### Основные функции
- ✅ **Интерактивная карта** (Leaflet) для построения маршрутов
- ✅ **Расчёт маршрутов** через OSRM (Open Source Routing Machine)
- ✅ **Калькулятор бюджета** с несколькими категориями расходов
- ✅ **Конвертер валют** (курсы обновляются автоматически)
- ✅ **Расчёт расходов на топливо** с учётом типа транспорта
- ✅ **Расчёт времени в пути** с остановками и ночёвками
- ✅ **Перетаскивание точек** маршрута (Drag & Drop)
- ✅ **Поиск адресов** через геокодирование
- ✅ **Тёмная тема** (Dark Mode)
- ✅ **Локализация** (русский язык)
- ✅ **Сохранение данных** (localStorage)

---

## 🛠️ Технологический стек

### Frontend
- **React 19.2** — UI библиотека
- **Vite 8** — быстрый сборщик
- **Tailwind CSS 3.4** — утилиты для стилизации
- **TypeScript (рекомендуется)** — для типобезопасности

### Карты и маршруты
- **Leaflet 1.9** — интерактивная карта
- **React-Leaflet 5** — React обёртка для Leaflet
- **OSRM** — маршрутизация

### Данные и API
- **Axios 1.15** — HTTP клиент
- **Exchange Rate API** — курсы валют
- **Nominatim (OpenStreetMap)** — геокодирование

### UI и анимации
- **Recharts 3.8** — графики и диаграммы
- **React-Icons 5.6** — иконки
- **@headlessui/react 2.2** — компоненты
- **@dnd-kit** — Drag & Drop функциональность

### Разработка
- **ESLint** — linting
- **PostCSS** — обработка CSS
- **Tailwind CSS** — утилиты для стилизации

---

## 🏗️ Архитектура

### Диаграмма структуры

```
┌─────────────────────────────────────────────────┐
│              React App (App.jsx)                │
│  ┌────────────────────────────────────────────┐ │
│  │ State Management (hooks + localStorage)    │ │
│  │ - tripData (маршрут, даты, транспорт)     │ │
│  │ - expenses (расходы)                       │ │
│  │ - settings (валюта, курсы)                │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
        │        │        │        │
        ▼        ▼        ▼        ▼
    ┌────┬─────────┬──────────┬───────────┐
    │    │         │          │           │
    ▼    ▼         ▼          ▼           ▼
  TopBar Sidebar MapComponent RightPanel BudgetSummary
```

### Слои архитектуры

#### 1. **Components Layer** (`/src/components`)
Логически разделены по доменам:

| Компонент | Отвественность |
|-----------|----------------|
| **TopBar** | Заголовок, переключение темы и языка |
| **Sidebar** | Список точек маршрута, сортировка (DnD) |
| **MapComponent** | Интерактивная карта, добавление точек |
| **TripForm** | Форма ввода дат, типа транспорта |
| **ExpenseManager** | Управление расходами |
| **BudgetSummary** | Отображение диаграмм расходов |
| **RightPanel** | Контейнер для боковой панели |

#### 2. **Hooks Layer** (`/src/hooks`)
Custom React hooks для логики:

| Hook | Функция |
|------|---------|
| `useBudgetCalculator` | Расчёт бюджета, дней, ночёвок |
| `useLocalStorage` | Синхронизация состояния с localStorage |
| `useTranslation` | Интернационализация (i18n) |

#### 3. **Services Layer** (`/src/services`)
API интеграции и внешние сервисы:

| Сервис | API | Функция |
|--------|-----|---------|
| `exchange.js` | exchangerate-api.com | Курсы валют |
| `osrm.js` | OSRM (routing) | Построение маршрутов |
| `geocoding.js` | Nominatim | Поиск адресов, обратное геокодирование |
| `fuelPrice.js` | Локальный JSON | Цены на топливо по регионам РФ |

#### 4. **Utils Layer** (`/src/utils`)
Чистые функции для вычислений:

| Утилита | Функция |
|---------|---------|
| `calculations.js` | Haversine расстояния, время в пути, расчёт бюджета |

#### 5. **Data Layer** (`/src/data`)
Статические данные:

| Файл | Содержимое |
|------|-----------|
| `fuelPricesRU.json` | Цены на топливо по типам |

### Поток данных

```
┌──────────────────────────────────────┐
│ Пользователь вводит данные           │
│ (маршрут, даты, расходы)            │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│ Components обновляют состояние       │
│ через onChange callbacks             │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│ App.jsx синхронизирует с             │
│ localStorage                         │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│ Hooks (useBudgetCalculator)          │
│ выполняют расчёты                   │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│ Services вызывают внешние API        │
│ (OSRM, Exchange, Geocoding)          │
└─────────────┬────────────────────────┘
              │
              ▼
┌──────────────────────────────────────┐
│ UI обновляется с новыми данными      │
└──────────────────────────────────────┘
```

### Состояние приложения

```javascript
// tripData
{
  points: [{ lat, lng, address, excluded }],
  startDate: "2025-04-27",
  endDate: "2025-05-10",
  travelers: 2,
  transport: {
    type: 'car' | 'public' | 'walk',
    fuelConsumption: 8,
    fuelType: 'gasoline' | 'diesel',
    fuelCost: 63.29
  },
  distance: 1250
}

// expenses
[
  { id, name, type: 'daily' | 'total', value, currency: 'RUB' | ... }
]

// settings
{
  displayCurrency: 'RUB',
  exchangeRates: { RUB: 1, USD: 0.012, ... },
  lastRatesUpdate: timestamp
}
```

---

## 📦 Установка и запуск

### Требования
- Node.js 16+ или выше
- npm или yarn

### Шаги

1. **Клонирование репозитория**
```bash
git clone <repository-url>
cd TravelCalculator
```

2. **Установка зависимостей**
```bash
npm install
```

3. **Запуск в режиме разработки**
```bash
npm run dev
```
Приложение откроется на `http://localhost:5173`

4. **Сборка для production**
```bash
npm run build
```

5. **Проверка кода (ESLint)**
```bash
npm run lint
```

6. **Preview production build**
```bash
npm run preview
```

---

## 📂 Структура проекта

```
TravelCalculator/
├── src/
│   ├── components/
│   │   ├── Budget/
│   │   │   └── BudgetSummary.jsx       # Графики расходов
│   │   ├── Expenses/
│   │   │   └── ExpenseManager.jsx      # Управление расходами
│   │   ├── Map/
│   │   │   ├── MapComponent.jsx        # Основная карта
│   │   │   ├── AddressSearch.jsx       # Поиск адресов
│   │   │   ├── MapControls.jsx         # Контролы карты
│   │   │   └── RouteList.jsx           # Список маршрута
│   │   ├── RightPanel/
│   │   │   └── RightPanel.jsx          # Боковая панель
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.jsx             # Основная боковая панель
│   │   │   └── PointsOrderList.jsx     # Список с DnD
│   │   ├── TopBar/
│   │   │   └── TopBar.jsx              # Верхняя панель
│   │   └── TripForm/
│   │       └── TripForm.jsx            # Форма параметров поездки
│   ├── hooks/
│   │   ├── useBudgetCalculator.js      # Расчёты бюджета
│   │   ├── useLocalStorage.js          # Синхронизация хранилища
│   │   └── useTranslation.js           # i18n функции
│   ├── services/
│   │   ├── exchange.js                 # API курсов валют
│   │   ├── osrm.js                     # API маршрутизации
│   │   ├── geocoding.js                # API геокодирования
│   │   └── fuelPrice.js                # Данные о ценах топлива
│   ├── utils/
│   │   └── calculations.js             # Чистые функции расчётов
│   ├── data/
│   │   └── fuelPricesRU.json           # JSON с ценами
│   ├── App.jsx                         # Корневой компонент
│   ├── main.jsx                        # Точка входа
│   ├── App.css                         # Стили App
│   └── index.css                       # Глобальные стили
├── public/                             # Статические файлы
├── eslint.config.js                    # ESLint конфиг
├── tailwind.config.js                  # Tailwind конфиг
├── postcss.config.js                   # PostCSS конфиг
├── vite.config.js                      # Vite конфиг
├── package.json                        # Зависимости
└── README.md                           # Этот файл
```

---

## 🔌 API и сервисы

### 1. OSRM (Open Source Routing Machine)
**Сервис:** Построение маршрутов
**Файл:** `src/services/osrm.js`
```javascript
getRoute(points, profile) // profile: 'driving', 'walking'
// Возвращает: distance, duration, geometry
```

### 2. Nominatim (OpenStreetMap)
**Сервис:** Геокодирование и поиск адресов
**Файл:** `src/services/geocoding.js`
```javascript
geocodeAddress(query)           // Поиск адреса → координаты
reverseGeocode(lat, lng)        // Координаты → адрес
```

### 3. Exchange Rate API
**Сервис:** Курсы валют
**Файл:** `src/services/exchange.js`
**Endpoint:** `https://api.exchangerate-api.com/v4/latest/RUB`
```javascript
fetchExchangeRates() // Получить актуальные курсы всех валют
```

### 4. Fuel Prices
**Источник:** Локальный JSON
**Файл:** `src/data/fuelPricesRU.json`
```javascript
fetchFuelPrices() // Цены на топливо в РФ
```

---

## 🚀 План оптимизации

### Уровень приоритета: ВЫСОКИЙ ⭐⭐⭐

#### 1. **Типизация (TypeScript)**
**Проблема:** Отсутствие типов приводит к багам при рефакторинге
**Решение:**
- Миграция на TypeScript с `tsconfig.json`
- Типизация всех props компонентов
- Типизация return значений функций

**Файлы для изменения:** Все `.jsx` → `.tsx`, все `.js` → `.ts`

```typescript
// Пример
interface TripData {
  points: Point[];
  startDate: string;
  endDate: string;
  travelers: number;
  transport: Transport;
  distance: number;
}

interface Point {
  lat: number;
  lng: number;
  address: string;
  excluded?: boolean;
}
```

---

#### 2. **Управление состоянием (State Management)**
**Проблема:** localStorage для глобального состояния хрупкий и сложный в масштабировании
**Решение:** React Context API + Custom Hook

**Создать `/src/context/TravelContext.tsx`:**
```typescript
interface TravelContextType {
  tripData: TripData;
  expenses: Expense[];
  settings: Settings;
  updateTripData: (data: Partial<TripData>) => void;
  updateExpenses: (expenses: Expense[]) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const TravelProvider = ({ children }) => {
  const [tripData, setTripData] = useLocalStorage('trip', initialTrip);
  // ... более чистое управление состоянием
}
```

**Преимущества:**
- Избегаем prop drilling
- Проще добавлять новые поля
- Все изменения в одном месте

---

#### 3. **Обработка ошибок (Error Handling)**
**Проблема:** Нет try-catch, fail-safe логики в сервисах
**Решение:** Создать ErrorBoundary и улучшить сервисы

**Создать `/src/components/ErrorBoundary.jsx`:**
```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div>Ошибка загрузки. Попробуйте позже.</div>;
    }
    return this.props.children;
  }
}
```

**Улучшить сервисы:**
```javascript
// services/osrm.js - добавить timeout и retry logic
export const getRoute = async (points, profile, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // exponential backoff
    }
  }
};
```

---

#### 4. **Разделение компонентов (Component Decomposition)**
**Проблема:** Некоторые компоненты слишком большие и смешивают логику и UI

**Примеры рефакторинга:**

**MapComponent.jsx** (слишком большой):
```
MapComponent/
├── MapComponent.jsx          (контейнер)
├── MapContainer.jsx          (карта + маркеры)
├── RoutePolyline.jsx         (маршрут)
└── MapClickHandler.jsx       (обработчик кликов)
```

**BudgetSummary.jsx** (слишком много логики):
```
BudgetSummary/
├── BudgetSummary.jsx         (контейнер)
├── BudgetChart.jsx           (диаграмма)
├── BudgetBreakdown.jsx       (таблица)
└── useBudgetChartData.js     (логика для диаграммы)
```

---

#### 5. **Валидация данных (Data Validation)**
**Проблема:** Нет валидации входных данных
**Решение:** Создать схему валидации

**Создать `/src/utils/validation.js`:**
```javascript
import * as yup from 'yup';

export const tripSchema = yup.object().shape({
  points: yup.array().of(
    yup.object().shape({
      lat: yup.number().min(-90).max(90).required(),
      lng: yup.number().min(-180).max(180).required(),
      address: yup.string().required(),
    })
  ).min(2),
  startDate: yup.date().required(),
  endDate: yup.date().min(yup.ref('startDate')).required(),
  travelers: yup.number().positive().integer().required(),
  transport: yup.object().required(),
  distance: yup.number().positive().required(),
});

export const validateTrip = (data) => {
  try {
    tripSchema.validateSync(data);
    return { valid: true };
  } catch (error) {
    return { valid: false, errors: error.errors };
  }
};
```

---

#### 6. **Кеширование API (API Caching)**
**Проблема:** Одинаковые запросы выполняются много раз
**Решение:** Кеш с TTL (time-to-live)

**Создать `/src/utils/cache.js`:**
```javascript
class CacheService {
  constructor(ttl = 3600000) { // 1 час
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      expires: Date.now() + this.ttl,
    });
  }
}

export const exchangeRateCache = new CacheService(3600000); // 1 час

// В exchange.js
export const fetchExchangeRates = async () => {
  const cached = exchangeRateCache.get('rates');
  if (cached) return cached;

  const data = await axios.get(EXCHANGE_API);
  exchangeRateCache.set('rates', data);
  return data;
};
```

---

#### 7. **Константы (Centralize Constants)**
**Проблема:** Magic numbers разбросаны по коду
**Решение:** Создать файл констант

**Создать `/src/constants/index.js`:**
```javascript
// Транспортные скорости (км/ч)
export const TRANSPORT_SPEEDS = {
  car: 75,
  public: 60,
  walk: 5.5,
};

// Параметры отдыха
export const REST_INTERVALS = {
  shortRest: 2, // каждые 2 часа
  longRestAfter: 8, // часов суммарного времени
};

export const REST_DURATIONS = {
  short: {
    car: 0.25,
    walk: 0.4167,
    public: 0,
  },
  long: 14, // ночёвка
};

// Параметры API
export const API_TIMEOUTS = {
  osrm: 10000,
  geocoding: 5000,
  exchange: 5000,
};

export const API_RETRIES = {
  maxAttempts: 3,
  backoffMultiplier: 2,
};

// Валюты
export const SUPPORTED_CURRENCIES = ['RUB', 'USD', 'EUR', 'GBP'];
export const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/RUB';
export const EXCHANGE_RATE_TTL = 3600000; // 1 час

// Локализация
export const SUPPORTED_LANGUAGES = {
  ru: 'Русский',
  en: 'English',
};
```

---

#### 8. **Тестирование (Testing)**
**Проблема:** Нет тестов
**Решение:** Добавить Vitest + React Testing Library

**Установить:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

**Пример теста `/src/utils/calculations.test.js`:**
```javascript
import { describe, it, expect } from 'vitest';
import { haversineDistance, calculateTravelTime } from './calculations';

describe('haversineDistance', () => {
  it('calculates distance between two points', () => {
    const dist = haversineDistance(55.7558, 37.6173, 59.9311, 30.3609);
    expect(dist).toBeCloseTo(633, -1); // Moscow to SPb
  });
});

describe('calculateTravelTime', () => {
  it('calculates travel time for car', () => {
    const result = calculateTravelTime(600, 'car');
    expect(result.days).toBe(1);
    expect(result.totalHours).toBeGreaterThan(8);
  });
});
```

---

#### 9. **Performance Optimization**
**Проблема:** Нет оптимизаций производительности
**Решение:**

```javascript
// 1. Memoize компоненты
const MapComponent = React.memo(({ points, onPointsChange }) => {
  // ...
});

// 2. Memoize вычисления в hooks
export const useBudgetCalculator = (trip, expenses, rates, currency) => {
  return useMemo(() => {
    return calculateBudget(trip, expenses, rates, currency);
  }, [trip, expenses, rates, currency]);
};

// 3. Lazy load компоненты (уже сделано для MapComponent)
const MapComponent = lazy(() => import('./components/Map/MapComponent'));

// 4. Debounce expensive operations
const debouncedSearch = useCallback(
  debounce((query) => geocodeAddress(query), 500),
  []
);
```

---

#### 10. **Logging и Monitoring**
**Проблема:** Сложно отследить ошибки в production
**Решение:** Добавить логирование

**Создать `/src/utils/logger.js`:**
```javascript
const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (message, data) => {
    if (isDevelopment) console.log(message, data);
  },
  error: (message, error) => {
    console.error(message, error);
    // Отправить на сервер в production
    if (!isDevelopment) {
      // sendToMonitoring(message, error);
    }
  },
  warn: (message, data) => {
    if (isDevelopment) console.warn(message, data);
  },
};
```

---

### Уровень приоритета: СРЕДНИЙ ⭐⭐

#### 11. **Документирование компонентов (JSDoc)**
```javascript
/**
 * Расчитывает бюджет поездки с учётом всех расходов
 * @param {TripData} trip - Данные о поездке
 * @param {Expense[]} expenses - Массив расходов
 * @param {Record<string, number>} exchangeRates - Курсы валют
 * @param {string} displayCurrency - Валюта отображения
 * @returns {BudgetResult} Объект с расчётами
 */
export function calculateBudget(trip, expenses, exchangeRates, displayCurrency) {
  // ...
}
```

#### 12. **Интеграционные тесты**
Тестировать полные user flows (поиск адреса → построение маршрута → расчёт бюджета)

#### 13. **Accessibility (a11y)**
- Добавить `aria-labels` к интерактивным элементам
- Обеспечить навигацию через клавиатуру
- Контрастность цветов в темной теме

---

### Уровень приоритета: НИЗКИЙ ⭐

#### 14. **PWA (Progressive Web App)**
- Добавить Service Worker для offline режима
- Web App Manifest

#### 15. **Интернационализация (i18n)**
- Полная поддержка нескольких языков
- Переводы для всех строк

#### 16. **Analytics**
- Отслеживание действий пользователя (какие маршруты популярны, etc.)

---

## 📋 План реализации оптимизаций

### Фаза 1 (Критичные, 1-2 недели)
1. ✅ Миграция на TypeScript
2. ✅ Добавить ErrorBoundary и обработку ошибок в сервисы
3. ✅ Создать Context API для управления состоянием
4. ✅ Централизовать константы

### Фаза 2 (Важные, 2-3 недели)
5. ✅ Добавить валидацию (yup/zod)
6. ✅ Реализовать кеш для API
7. ✅ Разделить большие компоненты
8. ✅ Добавить основные unit тесты

### Фаза 3 (Улучшения, 1-2 недели)
9. ✅ Добавить JSDoc документацию
10. ✅ Оптимизировать производительность (React.memo, useMemo)
11. ✅ Добавить логирование
12. ✅ A11y улучшения

### Фаза 4 (Nice to have, по времени)
13. ✅ PWA функциональность
14. ✅ Расширенная i18n
15. ✅ Analytics

---

## 🤝 Вклад

Для добавления новых функций:
1. Создать ветку: `git checkout -b feature/название`
2. Следовать архитектуре (компоненты → hooks → services)
3. Добавить типы (при использовании TS)
4. Добавить тесты
5. Запустить ESLint: `npm run lint`

---

## 📄 Лицензия

Курсовая работа 2025/26 SUSU

---

## 📞 Поддержка

Для вопросов и предложений открывайте Issues на GitHub.

// src/hooks/useRoute.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { getRoute } from '../services/api/osrm';
import { arePointsConnected } from '../utils/geo/continents';
import { haversineDistance } from '../utils/geo/haversine';

/**
 * Хук для получения и обновления автомобильного (или пешего) маршрута.
 * @param {Array} activePoints – видимые точки (excluded = false)
 * @param {boolean} showRoute – нужно ли отображать линию маршрута
 * @param {string} transportType – 'car', 'public', 'walk'
 * @returns {{ routeGeometry, routeInfo, routeWarning, setRouteWarning, setDragging, clearRoute, refetch }}
 */
export const useRoute = (activePoints, showRoute, transportType) => {
  const [routeGeometry, setRouteGeometry] = useState([]);
  const [routeInfo, setRouteInfo] = useState({
    distance: 0,
    duration: null,
    geometry: null,
    isFallback: false,
  });
  const [routeWarning, setRouteWarning] = useState('');

  // Флаг, показывающий, что прямо сейчас происходит перетаскивание маркера.
  // Пока он true, запросы не отправляются.
  const isDragging = useRef(false);

  // Таймер для дебаунса (задержка 500 мс после последнего изменения)
  const debounceTimer = useRef(null);
  // Таймер для повторной попытки, если был получен fallback‑маршрут
  const retryTimer = useRef(null);
  // Счётчик, чтобы игнорировать устаревшие ответы от API
  const lastRequestId = useRef(0);

  // Сопоставление типа транспорта с профилем OSRM
  const profileMap = {
    car: 'driving',
    public: 'driving',
    walk: 'walking',
  };

  /**
   * Основная функция, которая делает запрос к OSRM и обновляет состояния.
   */
  const fetchRoute = useCallback(async (points, show, transport) => {
    if (isDragging.current) return;

    if (!points || points.length < 2) {
      setRouteGeometry([]);
      setRouteInfo({
        distance: 0,
        duration: null,
        geometry: null,
        isFallback: false,
      });
      setRouteWarning('');
      return;
    }

    const profile = profileMap[transport] || 'driving';
    const requestId = ++lastRequestId.current;

    // Проверка континентальной связности
    if (!arePointsConnected(points)) {
      setRouteWarning(
        'Маршрут пересекает несвязанные континенты. Автомобильное сообщение невозможно.'
      );
    } else {
      setRouteWarning('');
    }

    try {
      const data = await getRoute(points, profile);
      if (requestId !== lastRequestId.current) return; // ответ устарел

      if (data) {
        // Если в ответе есть геометрия, проверяем, достигнут ли конечный пункт
        if (data.geometry?.coordinates?.length > 0) {
          const lastCoord =
            data.geometry.coordinates[data.geometry.coordinates.length - 1];
          const lastPoint = { lat: lastCoord[1], lng: lastCoord[0] };
          const dest = points[points.length - 1];
          const distToDest = haversineDistance(
            lastPoint.lat,
            lastPoint.lng,
            dest.lat,
            dest.lng
          );

          // Если расстояние больше 50 км, маршрут, вероятно, обрывается водой
          if (distToDest > 50) {
            setRouteWarning(
              'Маршрут не может быть завершён – путь прерывается водной преградой.'
            );
          }
        }

        // Подготавливаем геометрию для отображения на карте
        let geom = [];
        if (data.geometry && show) {
          geom = data.geometry.coordinates.map((c) => [c[1], c[0]]);
        } else if (show) {
          geom = points.map((p) => [p.lat, p.lng]);
        }

        setRouteGeometry(geom);
        setRouteInfo({
          distance: data.distance,
          duration: data.duration,
          geometry: data.geometry,
          isFallback: data.isFallback,
        });

        // Если маршрут был запасным (fallback), планируем повторную попытку
        if (data.isFallback && !retryTimer.current) {
          retryTimer.current = setTimeout(() => {
            retryTimer.current = null;
            fetchRoute(points, show, transport);
          }, 5000);
        }
      }
    } catch (error) {
      console.warn('OSRM request failed', error);
    }
  }, []);

  // Эффект, срабатывающий при изменении зависимостей
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    if (retryTimer.current) return; // если уже ждём повтор, не запускаем новый таймер

    debounceTimer.current = setTimeout(() => {
      fetchRoute(activePoints, showRoute, transportType);
    }, 500);

    return () => {
      clearTimeout(debounceTimer.current);
    };
  }, [activePoints, showRoute, transportType, fetchRoute]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      clearTimeout(retryTimer.current);
      clearTimeout(debounceTimer.current);
    };
  }, []);

  // Функции, которые могут вызываться извне (например, при перетаскивании маркера)
  const setDragging = useCallback((val) => {
    isDragging.current = val;
  }, []);

  const clearRoute = useCallback(() => {
    setRouteGeometry([]);
    setRouteInfo({
      distance: 0,
      duration: null,
      geometry: null,
      isFallback: false,
    });
    setRouteWarning('');
  }, []);

  const refetch = useCallback(() => {
    fetchRoute(activePoints, showRoute, transportType);
  }, [activePoints, showRoute, transportType, fetchRoute]);

  return {
    routeGeometry,
    routeInfo,
    routeWarning,
    setRouteWarning,
    setDragging,
    clearRoute,
    refetch,
  };
};
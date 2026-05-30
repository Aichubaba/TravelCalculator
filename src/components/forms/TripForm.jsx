import React, { useEffect, useState } from 'react';
import { fetchFuelPrices } from '../../services/api/fuelPrice';
import { useTranslation } from '../../hooks/useTranslation';

const TripForm = ({ trip = {}, onChange, useTravelTime, language }) => {
  const { t } = useTranslation(language);
  const {
    startDate = '',
    endDate = '',
    travelers = 1,
    transport = { type: 'car', fuelConsumption: 8, fuelType: 'gasoline', fuelCost: 63.2858 }
  } = trip;

  const [fuelPrices, setFuelPrices] = useState({});

  useEffect(() => {
    fetchFuelPrices().then(prices => {
      setFuelPrices(prices);
      if (!transport.fuelCost && prices[transport.fuelType]) {
        onChange({
          ...trip,
          transport: { ...transport, fuelCost: prices[transport.fuelType] }
        });
      }
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...trip, [name]: value });
  };

  const handleTransportChange = (e) => {
    const { name, value } = e.target;
    const updatedTransport = { ...transport, [name]: value };
    if (name === 'fuelType' && fuelPrices[value]) {
      updatedTransport.fuelCost = fuelPrices[value];
    }
    onChange({ ...trip, transport: updatedTransport });
  };

  const currentFuelPrice = fuelPrices[transport.fuelType] || transport.fuelCost;

  return (
    <div className="space-y-3 dark:bg-gray-800 dark:text-white">
      <div>
        <label className="block text-sm font-medium">{t('dateStart')}</label>
        <input
          type="date"
          name="startDate"
          value={startDate}
          onChange={handleChange}
          disabled={useTravelTime}
          className={`mt-1 block w-full rounded border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-500 ${useTravelTime ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">{t('dateEnd')}</label>
        <input
          type="date"
          name="endDate"
          value={endDate}
          onChange={handleChange}
          disabled={useTravelTime}
          className={`mt-1 block w-full rounded border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-500 ${useTravelTime ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
        />
        {useTravelTime && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('durationByTravelTime')}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium">{t('travelers')}</label>
        <input
          type="number"
          name="travelers"
          min="1"
          value={travelers}
          onChange={handleChange}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">{t('transportType')}</label>
        <select
          name="type"
          value={transport.type}
          onChange={handleTransportChange}
          className="mt-1 block w-full rounded border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-500"
        >
          <option value="car">{t('car')}</option>
          <option value="public">{t('public')}</option>
          <option value="walk">{t('walk')}</option>
        </select>
      </div>
      {transport.type === 'car' && (
        <>
          <div>
            <label className="block text-sm font-medium">{t('fuelConsumption')}</label>
            <input
              type="number"
              name="fuelConsumption"
              min="0"
              step="0.1"
              value={transport.fuelConsumption || ''}
              onChange={handleTransportChange}
              className="mt-1 block w-full rounded border-gray-300 shadow-sm dark:bg-gray-700 dark:text-white dark:border-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t('fuelType')}</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.keys(fuelPrices).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTransportChange({ target: { name: 'fuelType', value: type } })}
                  className={`px-3 py-1 rounded border ${
                    transport.fuelType === type
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {type === 'gasoline' ? t('gasoline') : type === 'diesel' ? t('diesel') : type}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t('currentPrice')}: {currentFuelPrice} ₽/л
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default TripForm;
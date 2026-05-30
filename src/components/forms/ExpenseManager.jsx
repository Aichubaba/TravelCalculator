import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';
import { convertCurrency } from '../../utils/calculations'; // ← импорт конвертера

const CURRENCIES = ['RUB', 'USD', 'EUR'];

const ExpenseManager = ({
  expenses = [],
  onChange,
  displayCurrency,
  exchangeRates,
  language,
}) => {
  const { t } = useTranslation(language);
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  // Локальная валюта конвертера (инициализируется displayCurrency)
  const [localCurrency, setLocalCurrency] = useState(displayCurrency || 'RUB');
  const [newExpense, setNewExpense] = useState({ name: '', type: 'daily', value: 0 });

  // Массовый пересчёт всех расходов в новую валюту
  const handleCurrencySwitch = (newCurr) => {
    if (newCurr === localCurrency) return;
    const updated = safeExpenses.map((exp) => {
      const convertedValue = convertCurrency(exp.value, exp.currency, newCurr, exchangeRates);
      return {
        ...exp,
        value: convertedValue,
        currency: newCurr,
      };
    });
    onChange(updated);
    setLocalCurrency(newCurr);
  };

  // Добавление нового расхода — в текущей локальной валюте
  const handleAdd = () => {
    if (!newExpense.name.trim()) return;
    const expense = {
      ...newExpense,
      id: Date.now().toString(),
      currency: localCurrency,
    };
    onChange([...safeExpenses, expense]);
    setNewExpense({ name: '', type: 'daily', value: 0 });
  };

  const handleDelete = (id) => {
    onChange(safeExpenses.filter((e) => e.id !== id));
  };

  const handleEdit = (id, field, value) => {
    onChange(
      safeExpenses.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  return (
    <div className="space-y-3 dark:bg-gray-800 dark:text-white">
      {/* Конвертер валют — длинный узкий овал */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-full border border-purple-300 dark:border-purple-600 overflow-hidden">
          {CURRENCIES.map((cur) => (
            <button
              key={cur}
              onClick={() => handleCurrencySwitch(cur)}
              className={`px-4 py-1 text-sm font-medium transition-colors focus:outline-none ${
                localCurrency === cur
                  ? 'bg-purple-500 text-white'
                  : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-800'
              }`}
            >
              {cur}
            </button>
          ))}
        </div>
      </div>

      {/* Список категорий */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {safeExpenses.map((exp) => (
          <div
            key={exp.id}
            className="flex flex-wrap items-center gap-1 p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
          >
            <span className="flex-1 min-w-[80px] truncate font-medium">
              {exp.name}
            </span>
            <select
              value={exp.type}
              onChange={(e) => handleEdit(exp.id, 'type', e.target.value)}
              className="border rounded p-1 text-sm bg-white dark:bg-gray-600 dark:text-white dark:border-gray-500"
            >
              <option value="daily">{t('daily')}</option>
              <option value="fixed">{t('fixed')}</option>
            </select>
            <input
              type="number"
              min="0"
              step="0.01"
              value={exp.value}
              onChange={(e) =>
                handleEdit(exp.id, 'value', parseFloat(e.target.value) || 0)
              }
              className="w-20 border rounded p-1 text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500"
            />
            <span className="text-xs font-mono w-8 text-center text-gray-500 dark:text-gray-400">
              {exp.currency}
            </span>
            <button
              onClick={() => handleDelete(exp.id)}
              className="text-red-500 hover:text-red-700 p-1"
              title={t('deleteCategory')}
            >
              <FaTrash size={14} />
            </button>
          </div>
        ))}
        {safeExpenses.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-2">
            {t('noCategories')}
          </p>
        )}
      </div>

      {/* Форма добавления нового расхода */}
      <div className="flex flex-wrap gap-1">
        <input
          type="text"
          placeholder={t('name')}
          value={newExpense.name}
          onChange={(e) =>
            setNewExpense({ ...newExpense, name: e.target.value })
          }
          className="flex-1 min-w-[100px] border rounded p-1 text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500"
        />
        <select
          value={newExpense.type}
          onChange={(e) =>
            setNewExpense({ ...newExpense, type: e.target.value })
          }
          className="border rounded p-1 text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500"
        >
          <option value="daily">{t('daily')}</option>
          <option value="fixed">{t('fixed')}</option>
        </select>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder={t('amount')}
          value={newExpense.value || ''}
          onChange={(e) =>
            setNewExpense({
              ...newExpense,
              value: parseFloat(e.target.value) || 0,
            })
          }
          className="w-20 border rounded p-1 text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500"
        />
        <button
          onClick={handleAdd}
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm"
        >
          {t('add')}
        </button>
      </div>
    </div>
  );
};

export default ExpenseManager;
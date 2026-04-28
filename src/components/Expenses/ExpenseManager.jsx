import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { useTranslation } from '../../hooks/useTranslation';

const ExpenseManager = ({ expenses = [], onChange, displayCurrency, language }) => {
  const { t } = useTranslation(language);
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const [newExpense, setNewExpense] = useState({ name: '', type: 'daily', value: 0 });

  const handleAdd = () => {
    if (!newExpense.name.trim()) return;
    const expense = {
      ...newExpense,
      id: Date.now().toString(),
      currency: displayCurrency,
    };
    onChange([...safeExpenses, expense]);
    setNewExpense({ name: '', type: 'daily', value: 0 });
  };

  const handleDelete = (id) => {
    onChange(safeExpenses.filter(e => e.id !== id));
  };

  const handleEdit = (id, field, value) => {
    onChange(safeExpenses.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  return (
    <div className="space-y-3 dark:bg-gray-800 dark:text-white">
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {safeExpenses.map(exp => (
          <div key={exp.id} className="flex flex-wrap items-center gap-1 p-2 border rounded text-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
            <span className="flex-1 min-w-[80px] truncate font-medium">{exp.name}</span>
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
              onChange={(e) => handleEdit(exp.id, 'value', parseFloat(e.target.value) || 0)}
              className="w-20 border rounded p-1 text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500"
            />
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
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-2">{t('noCategories')}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        <input
          type="text"
          placeholder={t('name')}
          value={newExpense.name}
          onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
          className="flex-1 min-w-[100px] border rounded p-1 text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500"
        />
        <select
          value={newExpense.type}
          onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
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
          onChange={(e) => setNewExpense({ ...newExpense, value: parseFloat(e.target.value) || 0 })}
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
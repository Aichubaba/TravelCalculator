import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { FaChartPie, FaTimes, FaUserFriends } from 'react-icons/fa';
import { calculateTravelTime } from '../../utils/calculations';
import { useTranslation } from '../../hooks/useTranslation';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const BudgetSummary = ({
  total,
  breakdown,
  displayCurrency,
  days,
  useTravelTime,
  transportType,
  distance,
  language,
  travelers = 1,
}) => {
  const { t } = useTranslation(language);
  const [chartVisible, setChartVisible] = useState(false);
  const [showPerPerson, setShowPerPerson] = useState(false);

  const safeBreakdown = Array.isArray(breakdown) ? breakdown : [];
  const data = safeBreakdown.map(exp => ({ name: exp.name, value: exp.converted }));

  // Расходы на одного человека
  const { perPersonBreakdown, totalPerPerson } = useMemo(() => {
    const perPersonBreakdown = safeBreakdown.map(exp => ({
      ...exp,
      perPerson: exp.converted / travelers,
    }));
    const totalPerPerson = total / travelers;
    return { perPersonBreakdown, totalPerPerson };
  }, [safeBreakdown, travelers, total]);

  const formatDuration = () => {
    if (!useTravelTime || distance <= 0) return `${days} дн.`;
    try {
      const calc = calculateTravelTime(distance, transportType);
      const totalHours = calc.totalHours;
      if (totalHours < 24) return `${Math.round(totalHours)} ч`;
      const d = Math.floor(totalHours / 24);
      const h = Math.round(totalHours % 24);
      return `${d} сут ${h} ч`;
    } catch (e) {
      return `${days} дн.`;
    }
  };

  return (
    <div className="space-y-4 dark:bg-gray-800 dark:text-white">
      <h2 className="text-lg font-semibold">{t('budgetTitle')}</h2>

      <div className="rounded-lg bg-purple-50 dark:bg-purple-900/30 p-3">
        <p className="text-3xl font-bold text-purple-800 dark:text-purple-300">
          {total.toFixed(2)} {displayCurrency}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('duration')}: {formatDuration()}{useTravelTime && distance > 0 ? ` (${t('withStops')})` : ''}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border p-2 text-left dark:border-gray-600">{t('category')}</th>
              <th className="border p-2 text-right dark:border-gray-600">{t('sum')} ({displayCurrency})</th>
            </tr>
          </thead>
          <tbody>
            {safeBreakdown.map(exp => (
              <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="border p-2 dark:border-gray-600">{exp.name}</td>
                <td className="border p-2 text-right font-mono dark:border-gray-600">
                  {exp.converted.toFixed(2)}
                </td>
              </tr>
            ))}
            {safeBreakdown.length === 0 && (
              <tr>
                <td colSpan="2" className="border p-4 text-center text-gray-500 dark:text-gray-400">
                  {t('noData')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowPerPerson(!showPerPerson)}
          className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
        >
          <FaUserFriends size={16} />
          {showPerPerson ? t('hidePerPersonTable') : t('perPerson')}
        </button>
        <button
          onClick={() => setChartVisible(!chartVisible)}
          className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
        >
          {chartVisible ? <FaTimes size={16} /> : <FaChartPie size={16} />}
          {chartVisible ? t('hideChart') : t('chart')}
        </button>
      </div>

      {showPerPerson && (
        <div className="overflow-x-auto rounded-lg border dark:border-gray-700">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border p-2 text-left dark:border-gray-600">{t('category')}</th>
                <th className="border p-2 text-right dark:border-gray-600">{t('perPerson')} ({displayCurrency})</th>
              </tr>
            </thead>
            <tbody>
              {perPersonBreakdown.map(exp => (
                <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="border p-2 dark:border-gray-600">{exp.name}</td>
                  <td className="border p-2 text-right font-mono dark:border-gray-600">
                    {exp.perPerson.toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr className="font-bold bg-purple-50 dark:bg-purple-900/20">
                <td className="border p-2 dark:border-gray-600">{t('totalPerPerson')}</td>
                <td className="border p-2 text-right font-mono dark:border-gray-600">
                  {totalPerPerson.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {chartVisible && data.length > 0 && (
        <div className="flex justify-center rounded-lg border bg-white/70 dark:bg-gray-800/50 p-3">
          <PieChart width={250} height={250}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      )}
    </div>
  );
};

export default BudgetSummary;
import React from 'react';
import TripForm from '../TripForm/TripForm';
import ExpenseManager from '../Expenses/ExpenseManager';
import BudgetSummary from '../Budget/BudgetSummary';

const RightPanel = ({
  selectedSection,
  trip,
  onTripChange,
  useTravelTime,
  expenses,
  setExpenses,
  displayCurrency,
  budget,
  days,
  transportType,
  distance,
  onClose,
  language,
  darkMode,
}) => {
  const bgClass = darkMode
    ? 'bg-gray-900/95 text-white'
    : 'bg-purple-100/95 text-purple-900';

  const renderSection = () => {
    switch (selectedSection) {
      case 'parameters':
        return <TripForm trip={trip} onChange={onTripChange} useTravelTime={useTravelTime} language={language} />;
      case 'expenses':
        return <ExpenseManager expenses={expenses} onChange={setExpenses} displayCurrency={displayCurrency} language={language} />;
      case 'budget':
        return (
          <BudgetSummary
            total={budget.total}
            breakdown={budget.breakdown}
            displayCurrency={displayCurrency}
            days={days}
            useTravelTime={useTravelTime}
            transportType={transportType}
            distance={distance}
            language={language}
            travelers={trip.travelers || 1}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`absolute bottom-4 right-4 z-50 ${bgClass} backdrop-blur-md p-6 rounded-xl shadow-xl transition-all duration-300 max-w-md`}>
      <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        ✕
      </button>
      {renderSection()}
    </div>
  );
};

export default RightPanel;
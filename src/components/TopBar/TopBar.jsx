import React, { useState, useRef, useEffect } from 'react';
import { FaSun, FaMoon, FaGlobe, FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import { searchAddresses } from '../../services/geocoding';

const TopBar = ({ darkMode, setDarkMode, language, setLanguage, displayCurrency, setDisplayCurrency, onSelectAddress }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchContainerRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearch(false);
        setQuery('');
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showSearch || query.trim().length < 3) {
      setSuggestions([]);
      setError('');
      setIsLoading(false);
      return;
    }
    const currentId = ++requestIdRef.current;
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError('');
        const results = await searchAddresses(query.trim());
        if (requestIdRef.current === currentId) {
          setSuggestions(results);
        }
      } catch {
        if (requestIdRef.current === currentId) {
          setSuggestions([]);
          setError('Ошибка загрузки');
        }
      } finally {
        if (requestIdRef.current === currentId) {
          setIsLoading(false);
        }
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, showSearch]);

  const handleSelect = (suggestion) => {
    onSelectAddress(suggestion);
    setShowSearch(false);
    setQuery('');
    setSuggestions([]);
    setError('');
  };

  const bgClass = darkMode ? 'bg-gray-900 text-white' : 'bg-purple-100 text-purple-900';

  return (
    <div className={`flex items-center justify-between px-6 py-4 ${bgClass} transition-colors duration-300 z-10`}>
      {/* Левая колонка: название, фиксированная ширина 320px */}
      <div className="w-80 flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">TravelGo ✈️</h1>
      </div>

      {/* Центральная колонка: поиск */}
      <div className="flex-1 flex justify-start items-center pl-4" ref={searchContainerRef}>
        {!showSearch ? (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2 border border-purple-500 rounded-full px-4 py-2 transition hover:bg-white/10"
          >
            <FaSearch size={18} />
            <span className="text-sm opacity-70">Поиск адреса...</span>
          </button>
        ) : (
          <div className="relative w-full max-w-2xl z-20">
            <div className="flex items-center gap-2 border border-purple-500 rounded-full px-4 py-2 bg-transparent">
              <FaSearch className="text-purple-500" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Введите адрес"
                autoFocus
                className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
              />
              {isLoading ? (
                <FaSpinner className="animate-spin text-purple-500" size={18} />
              ) : (
                <button onClick={() => { setShowSearch(false); setQuery(''); setSuggestions([]); }} className="text-gray-500 hover:text-gray-700">
                  <FaTimes size={18} />
                </button>
              )}
            </div>
            {suggestions.length > 0 && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-purple-200 dark:border-gray-600 z-50 max-h-72 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className="block w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-gray-700 text-sm"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
        )}
      </div>

      {/* Правая колонка: переключатели */}
      <div className="flex items-center space-x-4 ml-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-purple-200 dark:hover:bg-gray-700 transition-colors"
          title={darkMode ? 'Светлая тема' : 'Тёмная тема'}
        >
          {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
        </button>

        <button
          onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
          className="flex items-center space-x-1 px-3 py-1 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors"
        >
          <FaGlobe size={14} />
          <span className="text-sm">{language.toUpperCase()}</span>
        </button>

        <select
          value={displayCurrency}
          onChange={(e) => setDisplayCurrency(e.target.value)}
          className={`px-3 py-1 rounded-full text-sm font-medium ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-purple-300 text-purple-900'} border focus:outline-none focus:ring-2 focus:ring-purple-500`}
        >
          <option value="RUB">₽ RUB</option>
          <option value="USD">$ USD</option>
          <option value="EUR">€ EUR</option>
        </select>
      </div>
    </div>
  );
};

export default TopBar;
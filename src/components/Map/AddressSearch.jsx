import { useEffect, useRef, useState } from 'react';
import { FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';
import { searchAddresses } from '../../services/geocoding';

const AddressSearch = ({ onSelectAddress }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!isExpanded) {
      setSuggestions([]);
      setQuery('');
      setError('');
      setIsLoading(false);
      return;
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      setSuggestions([]);
      setError('');
      setIsLoading(false);
      return;
    }

    const currentRequestId = requestIdRef.current + 1;
    requestIdRef.current = currentRequestId;

    const timerId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError('');
        const results = await searchAddresses(trimmedQuery);
        if (requestIdRef.current === currentRequestId) {
          setSuggestions(results);
        }
      } catch (searchError) {
        if (requestIdRef.current === currentRequestId) {
          setSuggestions([]);
          setError('Не удалось загрузить адреса');
        }
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => clearTimeout(timerId);
  }, [query, isExpanded]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = suggestion => {
    onSelectAddress(suggestion);
    setIsExpanded(false);
    setQuery('');
    setSuggestions([]);
    setError('');
  };

  return (
    <div
      ref={containerRef}
      className="absolute left-1/2 top-4 z-[1000] flex -translate-x-1/2 flex-col items-center gap-2"
    >
      {!isExpanded ? (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg transition-all duration-300 hover:bg-gray-50"
          title="Поиск адреса"
        >
          <FaSearch size={18} className="text-gray-700" />
        </button>
      ) : (
        <div className="w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 border-b px-3 py-3">
            <FaSearch className="text-gray-500" size={14} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Введите адрес"
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              title="Закрыть поиск"
            >
              <FaTimes size={14} />
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-gray-600">
                <FaSpinner className="animate-spin" size={12} />
                Поиск адресов...
              </div>
            )}

            {!isLoading && error && (
              <div className="px-3 py-3 text-sm text-red-500">{error}</div>
            )}

            {!isLoading && !error && query.trim().length > 0 && query.trim().length < 3 && (
              <div className="px-3 py-3 text-sm text-gray-500">
                Введите минимум 3 символа
              </div>
            )}

            {!isLoading && !error && query.trim().length >= 3 && suggestions.length === 0 && (
              <div className="px-3 py-3 text-sm text-gray-500">
                Ничего не найдено
              </div>
            )}

            {!isLoading &&
              suggestions.map(suggestion => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => handleSelect(suggestion)}
                  className="block w-full border-b px-3 py-3 text-left text-sm transition last:border-b-0 hover:bg-gray-50"
                >
                  {suggestion.name}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSearch;

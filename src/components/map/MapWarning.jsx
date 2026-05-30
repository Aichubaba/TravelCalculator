import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const MapWarning = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1001] transition-all duration-500 ease-in-out">
      <div className="flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg shadow-md">
        <FaExclamationTriangle className="text-yellow-600" />
        <span className="text-sm">{message}</span>
        <button onClick={onClose} className="ml-2 text-yellow-600 hover:text-yellow-800">
          <FaTimes size={14} />
        </button>
      </div>
    </div>
  );
};

export default MapWarning;
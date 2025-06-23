import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

const LocationSelect = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "Select location",
  locations = [],
  error,
  className = '',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter locations based on search term
  const filteredLocations = locations.filter(location =>
    location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (location) => {
    onChange(location);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const displayValue = value || searchTerm;

  return (
    <div className={`space-y-1 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm 
            placeholder-gray-400 text-gray-900 bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
            ${error ? 'border-red-300 focus:ring-red-500' : ''}
          `}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(location)}
                  className="w-full px-4 py-2 text-left text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{location}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm">
                {searchTerm ? 'No locations found' : 'Start typing to search...'}
              </div>
            )}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default LocationSelect;

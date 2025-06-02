"use client";

import React from 'react';
import { FiX } from 'react-icons/fi';

interface ActiveFiltersProps {
  searchTerm: string;
  selectedState: string;
  selectedExperience: string;
  selectedContractType: string;
  selectedSector: string;
  onClearSearch: () => void;
  onClearState: () => void;
  onClearExperience: () => void;
  onClearContractType: () => void;
  onClearSector: () => void;
  onClearAll: () => void;
  formatExperience: (exp: string) => string;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  searchTerm,
  selectedState,
  selectedExperience,
  selectedContractType,
  selectedSector,
  onClearSearch,
  onClearState,
  onClearExperience,
  onClearContractType,
  onClearSector,
  onClearAll,
  formatExperience
}) => {
  const hasActiveFilters = searchTerm || selectedState || selectedExperience || selectedContractType || selectedSector;

  if (!hasActiveFilters) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-600 font-medium">Filtres actifs:</span>
        
        {searchTerm && (
          <FilterTag
            label={`Recherche: "${searchTerm}"`}
            onClear={onClearSearch}
            color="blue"
          />
        )}
        
        {selectedState && (
          <FilterTag
            label={selectedState}
            onClear={onClearState}
            color="green"
          />
        )}
        
        {selectedExperience && (
          <FilterTag
            label={formatExperience(selectedExperience)}
            onClear={onClearExperience}
            color="purple"
          />
        )}
        
        {selectedContractType && (
          <FilterTag
            label={selectedContractType}
            onClear={onClearContractType}
            color="orange"
          />
        )}
        
        {selectedSector && (
          <FilterTag
            label={selectedSector}
            onClear={onClearSector}
            color="indigo"
          />
        )}
        
        <button 
          onClick={onClearAll}
          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors flex items-center gap-1"
        >
          <FiX className="w-3 h-3" />
          Effacer tout
        </button>
      </div>
    </div>
  );
};

interface FilterTagProps {
  label: string;
  onClear: () => void;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
}

const FilterTag: React.FC<FilterTagProps> = ({ label, onClear, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    green: 'bg-green-100 text-green-700 hover:bg-green-200',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors ${colorClasses[color]}`}>
      {label}
      <button 
        onClick={onClear} 
        className="ml-1 hover:scale-110 transition-transform"
        aria-label={`Remove ${label} filter`}
      >
        <FiX className="w-3 h-3" />
      </button>
    </span>
  );
};

export default ActiveFilters;

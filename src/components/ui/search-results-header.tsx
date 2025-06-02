"use client";

import React from 'react';
import { FiGrid, FiList, FiFilter } from 'react-icons/fi';

interface SearchResultsHeaderProps {
  totalResults: number;
  currentPage: number;
  totalPages: number;
  viewMode: 'grid' | 'list';
  showFilters: boolean;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onToggleFilters: () => void;
  searchTerm?: string;
  hasActiveFilters: boolean;
}

const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
  totalResults,
  currentPage,
  totalPages,
  viewMode,
  showFilters,
  onViewModeChange,
  onToggleFilters,
  searchTerm,
  hasActiveFilters
}) => {
  const startResult = ((currentPage - 1) * 12) + 1;
  const endResult = Math.min(currentPage * 12, totalResults);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-gray-900">
          {totalResults > 0 ? (
            <>
              {totalResults.toLocaleString()} offre{totalResults > 1 ? 's' : ''} trouvée{totalResults > 1 ? 's' : ''}
              {searchTerm && (
                <span className="text-blue-600"> pour "{searchTerm}"</span>
              )}
            </>
          ) : (
            'Aucune offre trouvée'
          )}
        </h2>
        
        {totalResults > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            Affichage de {startResult} à {endResult} sur {totalResults.toLocaleString()} résultats
            {totalPages > 1 && (
              <span> • Page {currentPage} sur {totalPages}</span>
            )}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Filter Toggle Button */}
        <button
          onClick={onToggleFilters}
          className={`btn-secondary flex items-center gap-2 relative ${
            hasActiveFilters ? 'ring-2 ring-blue-200 bg-blue-50' : ''
          }`}
        >
          <FiFilter className="w-4 h-4" />
          Filtres
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
          )}
        </button>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'grid' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Vue en grille"
          >
            <FiGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'hover:bg-gray-200 text-gray-600'
            }`}
            title="Vue en liste"
          >
            <FiList className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsHeader;

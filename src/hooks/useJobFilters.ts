import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterState {
  searchTerm: string;
  selectedState: string;
  selectedExperience: string;
  selectedContractType: string;
  selectedSector: string;
  currentPage: number;
  viewMode: 'grid' | 'list';
  showFilters: boolean;
}

interface FilterData {
  states: string[];
  experienceLevels: string[];
  contractTypes: string[];
  sectors: string[];
}

export const useJobFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL parameters
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: searchParams.get('search') || '',
    selectedState: searchParams.get('state') || '',
    selectedExperience: searchParams.get('experience') || '',
    selectedContractType: searchParams.get('contractType') || '',
    selectedSector: searchParams.get('sector') || '',
    currentPage: parseInt(searchParams.get('page') || '1'),
    viewMode: (searchParams.get('view') as 'grid' | 'list') || 'grid',
    showFilters: searchParams.get('showFilters') === 'true'
  });

  // Update URL when filters change
  const updateURL = useCallback((newFilters: Partial<FilterState>) => {
    const params = new URLSearchParams();
    
    const updatedFilters = { ...filters, ...newFilters };
    
    if (updatedFilters.searchTerm) params.set('search', updatedFilters.searchTerm);
    if (updatedFilters.selectedState) params.set('state', updatedFilters.selectedState);
    if (updatedFilters.selectedExperience) params.set('experience', updatedFilters.selectedExperience);
    if (updatedFilters.selectedContractType) params.set('contractType', updatedFilters.selectedContractType);
    if (updatedFilters.selectedSector) params.set('sector', updatedFilters.selectedSector);
    if (updatedFilters.currentPage > 1) params.set('page', updatedFilters.currentPage.toString());
    if (updatedFilters.viewMode !== 'grid') params.set('view', updatedFilters.viewMode);
    if (updatedFilters.showFilters) params.set('showFilters', 'true');

    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.push(`/users/offers${newURL}`, { scroll: false });
  }, [filters, router]);

  // Filter update functions
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset page when changing filters (except for page itself)
    if (key !== 'currentPage' && key !== 'viewMode' && key !== 'showFilters') {
      newFilters.currentPage = 1;
    }
    
    setFilters(newFilters);
    updateURL(newFilters);
  }, [filters, updateURL]);

  const setSearchTerm = useCallback((value: string) => {
    updateFilter('searchTerm', value);
  }, [updateFilter]);

  const setSelectedState = useCallback((value: string) => {
    updateFilter('selectedState', value);
  }, [updateFilter]);

  const setSelectedExperience = useCallback((value: string) => {
    updateFilter('selectedExperience', value);
  }, [updateFilter]);

  const setSelectedContractType = useCallback((value: string) => {
    updateFilter('selectedContractType', value);
  }, [updateFilter]);

  const setSelectedSector = useCallback((value: string) => {
    updateFilter('selectedSector', value);
  }, [updateFilter]);

  const setCurrentPage = useCallback((value: number) => {
    updateFilter('currentPage', value);
  }, [updateFilter]);

  const setViewMode = useCallback((value: 'grid' | 'list') => {
    updateFilter('viewMode', value);
  }, [updateFilter]);

  const setShowFilters = useCallback((value: boolean) => {
    updateFilter('showFilters', value);
  }, [updateFilter]);

  const clearAllFilters = useCallback(() => {
    const clearedFilters = {
      searchTerm: '',
      selectedState: '',
      selectedExperience: '',
      selectedContractType: '',
      selectedSector: '',
      currentPage: 1,
      viewMode: filters.viewMode,
      showFilters: filters.showFilters
    };
    
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  }, [filters.viewMode, filters.showFilters, updateURL]);

  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.searchTerm ||
      filters.selectedState ||
      filters.selectedExperience ||
      filters.selectedContractType ||
      filters.selectedSector
    );
  }, [filters]);

  // Build query parameters for API calls
  const getQueryParams = useCallback(() => {
    const params = new URLSearchParams({
      page: filters.currentPage.toString(),
      limit: '12'
    });

    if (filters.searchTerm) params.set('search', filters.searchTerm);
    if (filters.selectedState) params.set('state', filters.selectedState);
    if (filters.selectedExperience) params.set('experience', filters.selectedExperience);
    if (filters.selectedContractType) params.set('contractType', filters.selectedContractType);
    if (filters.selectedSector) params.set('sector', filters.selectedSector);

    return params;
  }, [filters]);

  return {
    // State
    ...filters,
    
    // Actions
    setSearchTerm,
    setSelectedState,
    setSelectedExperience,
    setSelectedContractType,
    setSelectedSector,
    setCurrentPage,
    setViewMode,
    setShowFilters,
    clearAllFilters,
    
    // Computed
    hasActiveFilters: hasActiveFilters(),
    getQueryParams
  };
};

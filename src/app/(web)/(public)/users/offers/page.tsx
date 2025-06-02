"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FiSearch, FiMapPin, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { BsCircleFill } from 'react-icons/bs';
import Loading from '@/components/ui/loading';
import ActiveFilters from '@/components/ui/active-filters';
import SearchResultsHeader from '@/components/ui/search-results-header';

interface Company {
  _id: string;
  companyName: string;
  avatar: string;
  industry: string;
}

interface JobOffer {
  _id: string;
  positions: {
    title: string;
    requiredExperience: string;
    availablePositions: number;
  }[];
  companyLocation: {
    state: string;
    municipality: string;
  };
  createdAt: string;
  companyName: string;
  userId: string;
  userDetails: {
    avatar: string;
    coverImage: string;
  }
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface FilterData {
  states: string[];
  experienceLevels: string[];
  contractTypes: string[];
  sectors: string[];
}

// دالة مساعدة لتنسيق الخبرة بالفرنسية
function formatExperience(experience: string): string {
  if (!experience) return '';
  
  const years = parseInt(experience);
  if (isNaN(years)) return experience;

  if (years === 0) return 'Débutant accepté';
  if (years === 1) return '1 an d\'expérience';
  return `${years} ans d'expérience`;
}

export default function JobOffersPage() {
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [filters, setFilters] = useState<FilterData>({
    states: [],
    experienceLevels: [],
    contractTypes: [],
    sectors: []
  });
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedContractType, setSelectedContractType] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchOffers(1);
  }, [debouncedSearchTerm, selectedState, selectedExperience, selectedContractType, selectedSector]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchOffers(currentPage);
    }
  }, [currentPage]);

  const fetchOffers = async (page: number) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedState && { state: selectedState }),
        ...(selectedExperience && { experience: selectedExperience }),
        ...(selectedContractType && { contractType: selectedContractType }),
        ...(selectedSector && { sector: selectedSector })
      });

      const res = await fetch(`/api/users/offers?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch offers");

      const data = await res.json();
      setOffers(data.offers);
      setPagination(data.pagination);
      if (data.filters) setFilters(data.filters);
    } catch (error) {
      console.error("Error:", error);
      toast.error("خطأ في تحميل العروض");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
    setCurrentPage(1);
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedExperience(e.target.value);
    setCurrentPage(1);
  };

  const handleContractTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContractType(e.target.value);
    setCurrentPage(1);
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSector(e.target.value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedState('');
    setSelectedExperience('');
    setSelectedContractType('');
    setSelectedSector('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loading variant="wave" text="جاري تحميل العروض..." size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Découvrez les offres d'emploi
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trouvez votre emploi idéal parmi des centaines d'opportunités dans toute l'Algérie
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="card-enhanced p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Rechercher un emploi ou une entreprise..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="input-enhanced pl-12"
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <select
                value={selectedState}
                onChange={handleStateChange}
                className="input-enhanced min-w-[200px]"
              >
                <option value="">Toutes les wilayas</option>
                {filters.states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>


          </div>

          {showFilters && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select
                  value={selectedExperience}
                  onChange={handleExperienceChange}
                  className="input-enhanced"
                >
                  <option value="">Niveau d'expérience</option>
                  {filters.experienceLevels.map((level) => (
                    <option key={level} value={level}>
                      {formatExperience(level)}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedContractType}
                  onChange={handleContractTypeChange}
                  className="input-enhanced"
                >
                  <option value="">Type de contrat</option>
                  {filters.contractTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <select
                  value={selectedSector}
                  onChange={handleSectorChange}
                  className="input-enhanced"
                >
                  <option value="">Secteur d'activité</option>
                  {filters.sectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>


            </div>
          )}
        </div>

        {/* Active Filters */}
        <ActiveFilters
          searchTerm={searchTerm}
          selectedState={selectedState}
          selectedExperience={selectedExperience}
          selectedContractType={selectedContractType}
          selectedSector={selectedSector}
          onClearSearch={() => setSearchTerm('')}
          onClearState={() => setSelectedState('')}
          onClearExperience={() => setSelectedExperience('')}
          onClearContractType={() => setSelectedContractType('')}
          onClearSector={() => setSelectedSector('')}
          onClearAll={clearAllFilters}
          formatExperience={formatExperience}
        />

        {/* Search Results Header */}
        {pagination && (
          <SearchResultsHeader
            totalResults={pagination.total}
            currentPage={currentPage}
            totalPages={pagination.pages}
            viewMode={viewMode}
            showFilters={showFilters}
            onViewModeChange={setViewMode}
            onToggleFilters={() => setShowFilters(!showFilters)}
            searchTerm={searchTerm}
            hasActiveFilters={!!(searchTerm || selectedState || selectedExperience || selectedContractType || selectedSector)}
          />
        )}

        {/* Job Offers Grid */}
        <div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
        >
          {offers.map((offer, index) => (
            <div
              key={offer._id}
              className="card-enhanced overflow-hidden group hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Company Header */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={offer.userDetails?.coverImage || "/default-cover.png"}
                  alt={offer.companyName}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  priority={index < 8}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <div className="absolute bottom-4 left-4 right-4">
                    <Link
                      href={`/users/${offer.userId}/company`}
                      className="flex items-center group/link hover:opacity-90 transition-opacity"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-3 border-white shadow-lg mr-3 flex-shrink-0 hover:scale-110 transition-transform">
                        <Image
                          src={offer.userDetails?.avatar || "/default-avatar.png"}
                          alt={offer.companyName}
                          fill
                          className="object-cover"
                          priority={index < 8}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate group-hover/link:underline">
                          {offer.companyName}
                        </h3>
                        <div className="flex items-center text-white/80 text-sm">
                          <FiMapPin className="w-4 h-4 mr-1" />
                          <span className="truncate">{offer.companyLocation.state}</span>
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Job count badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                      {offer.positions.length} {offer.positions.length > 1 ? 'postes' : 'poste'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Offer Details */}
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {offer.positions.slice(0, viewMode === 'list' ? 5 : 3).map((position, posIndex) => (
                    <div
                      key={posIndex}
                      className="group/position p-3 rounded-xl bg-gray-50/50 hover:bg-blue-50/50 transition-all duration-200 border border-transparent hover:border-blue-200 hover:scale-105"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 group-hover/position:text-blue-700 transition-colors line-clamp-1">
                          {position.title}
                        </h4>
                        <span className="px-2 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-medium rounded-full whitespace-nowrap ml-2">
                          {position.availablePositions} {position.availablePositions > 1 ? 'postes' : 'poste'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <BsCircleFill className="h-1.5 w-1.5 mr-2 text-blue-400" />
                        <span>{formatExperience(position.requiredExperience)}</span>
                      </div>
                    </div>
                  ))}

                  {offer.positions.length > (viewMode === 'list' ? 5 : 3) && (
                    <div className="text-center py-2">
                      <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full hover:scale-105 transition-transform cursor-pointer">
                        +{offer.positions.length - (viewMode === 'list' ? 5 : 3)} autres postes
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <time className="text-sm text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                  </time>

                  <div className="hover:scale-105 transition-transform">
                    <Link
                      href={`/users/${offer.userId}/company/offers/${offer._id}`}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Voir détails
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg p-2">
              {/* Previous button */}
              <button
                onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-all hover:scale-105 ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page numbers */}
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next button */}
              <button
                onClick={() => currentPage < pagination.pages && setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.pages}
                className={`p-2 rounded-lg transition-all hover:scale-105 ${
                  currentPage === pagination.pages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && offers.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <FiSearch className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos critères de recherche ou explorez d'autres opportunités.
              </p>
              <button
                onClick={clearAllFilters}
                className="btn-primary hover:scale-105 transition-transform"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom hook for debouncing search
function useDebounce<T>(value: T, delay: number): [T] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [debouncedValue];
} 
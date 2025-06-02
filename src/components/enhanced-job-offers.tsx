"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiSearch, FiMapPin, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { BsCircleFill } from 'react-icons/bs';

// Import our enhanced UI components
import {
  StaggerContainer,
  StaggerItem,
  ScrollReveal,
  AnimatedButton,
  LazyImage,
  useNotifications,
  NotificationContainer,
  AnimatedCounter,
  EnhancedFormField,
  validationRules
} from '@/components/ui';

interface JobOffer {
  _id: string;
  userId: string;
  companyName: string;
  companyLocation: {
    state: string;
    municipality: string;
    address: string;
  };
  positions: Array<{
    title: string;
    requiredExperience: string;
    availablePositions: number;
    education: {
      level: string;
      years: string;
      details: string;
    };
  }>;
  createdAt: string;
  userDetails?: {
    avatar: string;
    coverImage: string;
  };
}

interface EnhancedJobOffersProps {
  initialOffers?: JobOffer[];
  filters?: {
    states: string[];
    experienceLevels: string[];
    contractTypes: string[];
    sectors: string[];
  };
}

const EnhancedJobOffers: React.FC<EnhancedJobOffersProps> = ({
  initialOffers = [],
  filters = { states: [], experienceLevels: [], contractTypes: [], sectors: [] }
}) => {
  const [offers, setOffers] = useState<JobOffer[]>(initialOffers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOffers, setTotalOffers] = useState(0);

  const { success, error, notifications } = useNotifications();

  // Fetch offers with enhanced error handling
  const fetchOffers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedState && { state: selectedState })
      });

      const response = await fetch(`/api/users/offers?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }

      const data = await response.json();
      setOffers(data.offers || []);
      setTotalOffers(data.pagination?.total || 0);
      
      // Show success notification for search results
      if (searchTerm || selectedState) {
        success(
          `تم العثور على ${data.offers?.length || 0} عرض عمل`,
          searchTerm ? `نتائج البحث عن: ${searchTerm}` : undefined
        );
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
      error(
        'فشل في تحميل عروض العمل',
        'يرجى المحاولة مرة أخرى',
        {
          action: {
            label: 'إعادة المحاولة',
            onClick: fetchOffers
          }
        }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [currentPage, searchTerm, selectedState]);

  const formatExperience = (experience: string) => {
    const exp = parseInt(experience);
    if (exp === 0) return 'بدون خبرة';
    if (exp === 1) return 'سنة واحدة';
    if (exp === 2) return 'سنتان';
    if (exp <= 10) return `${exp} سنوات`;
    return `${exp}+ سنة`;
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Enhanced Header with Animation */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
              اكتشف فرص العمل المميزة
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              ابحث عن وظيفتك المثالية من بين مئات الفرص في جميع أنحاء الجزائر
            </p>
            
            {/* Statistics with Animated Counters */}
            <div className="flex justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <AnimatedCounter from={0} to={totalOffers} duration={2} />
                <span>عرض عمل</span>
              </div>
              <div className="flex items-center gap-2">
                <AnimatedCounter from={0} to={filters.states.length} duration={1.5} />
                <span>ولاية</span>
              </div>
              <div className="flex items-center gap-2">
                <AnimatedCounter from={0} to={50} duration={2.5} suffix="+" />
                <span>شركة</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Enhanced Search and Filter Section */}
        <ScrollReveal direction="up" delay={0.2}>
          <div className="card-enhanced p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                <div className="relative flex-1">
                  <EnhancedFormField
                    label=""
                    name="search"
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="ابحث عن وظيفة أو شركة..."
                    icon={<FiSearch className="w-5 h-5" />}
                    className="pl-12"
                  />
                </div>

                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="input-enhanced min-w-[200px]"
                >
                  <option value="">جميع الولايات</option>
                  {filters.states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <AnimatedButton
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="p-2"
                >
                  <FiGrid className="w-4 h-4" />
                </AnimatedButton>
                <AnimatedButton
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="p-2"
                >
                  <FiList className="w-4 h-4" />
                </AnimatedButton>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center">
              <AnimatedButton
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <FiFilter className="w-4 h-4" />
                {showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
              </AnimatedButton>

              <div className="text-sm text-gray-500">
                {loading ? 'جاري التحميل...' : `${offers.length} من ${totalOffers} عرض`}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Enhanced Job Offers Grid with Stagger Animation */}
        <StaggerContainer
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}
          staggerDelay={0.1}
        >
          {offers.map((offer, index) => (
            <StaggerItem key={offer._id} index={index}>
              <div className="card-enhanced overflow-hidden group hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                {/* Company Header with LazyImage */}
                <div className="relative h-48 overflow-hidden">
                  <LazyImage
                    src={offer.userDetails?.coverImage || "/default-cover.png"}
                    alt={offer.companyName}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    priority={index < 8}
                    quality={80}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Link
                        href={`/users/${offer.userId}/company`}
                        className="flex items-center group/link hover:opacity-90 transition-opacity"
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-3 border-white shadow-lg mr-3 flex-shrink-0 hover:scale-110 transition-transform">
                          <LazyImage
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
                        {offer.positions.length} {offer.positions.length > 1 ? 'مناصب' : 'منصب'}
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
                            {position.availablePositions} {position.availablePositions > 1 ? 'مناصب' : 'منصب'}
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
                          +{offer.positions.length - (viewMode === 'list' ? 5 : 3)} مناصب أخرى
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
                      {new Date(offer.createdAt).toLocaleDateString('ar-DZ')}
                    </time>

                    <AnimatedButton
                      variant="primary"
                      size="sm"
                      onClick={() => window.open(`/users/${offer.userId}/company/offers/${offer._id}`, '_blank')}
                    >
                      عرض التفاصيل
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Empty State */}
        {!loading && offers.length === 0 && (
          <ScrollReveal direction="up" delay={0.3}>
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <FiSearch className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">لم يتم العثور على عروض</h3>
                <p className="text-gray-600 mb-6">
                  جرب تعديل معايير البحث أو استكشف فرص أخرى.
                </p>
                <AnimatedButton
                  variant="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedState('');
                    setCurrentPage(1);
                  }}
                >
                  إعادة تعيين الفلاتر
                </AnimatedButton>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Notification Container */}
        <NotificationContainer
          notifications={notifications}
          position="top-right"
        />
      </div>
    </div>
  );
};

export default EnhancedJobOffers;

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FiSearch, FiMapPin, FiCalendar, FiBriefcase, FiMail, FiPhone } from 'react-icons/fi';
import Loading from '@/components/ui/loading';

interface Candidate {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  phone: string;
  birthDate: string;
  skills: string[];
  experience: any[];
  education: any[];
  location: {
    state: string;
    municipality: string;
  };
  bio: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    jobRequestsCount: number;
    applicationsCount: number;
    experienceYears: number;
    age: number;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCandidates(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchCandidates(currentPage);
    }
  }, [currentPage]);

  const fetchCandidates = async (page: number) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm })
      });

      const res = await fetch(`/api/candidates?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch candidates");
      
      const data = await res.json();
      setCandidates(data.candidates);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error:", error);
      toast.error("خطأ في تحميل المرشحين");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loading variant="wave" text="جاري تحميل المرشحين..." size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Découvrez les candidats
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trouvez les meilleurs talents pour votre entreprise parmi des centaines de candidats qualifiés
          </p>
        </div>

        {/* Search Section */}
        <div className="card-enhanced p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher un candidat..."
                value={searchTerm}
                onChange={handleSearch}
                className="input-enhanced pl-12 w-full"
              />
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Results Header */}
        {pagination && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {pagination.total > 0 ? (
                <>
                  {pagination.total.toLocaleString()} candidat{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
                  {searchTerm && (
                    <span className="text-blue-600"> pour "{searchTerm}"</span>
                  )}
                </>
              ) : (
                'Aucun candidat trouvé'
              )}
            </h2>
            
            {pagination.total > 0 && (
              <p className="text-sm text-gray-600">
                Page {currentPage} sur {pagination.pages}
              </p>
            )}
          </div>
        )}

        {/* Candidates Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {candidates.map((candidate, index) => (
            <div
              key={candidate._id}
              className="card-enhanced overflow-hidden group hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Profile Header */}
              <div className="relative h-32 bg-gradient-to-br from-blue-500 to-indigo-600">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-3 border-white shadow-lg mr-3 flex-shrink-0">
                    <Image
                      src={candidate.avatar || "/default-avatar.png"}
                      alt={`${candidate.firstName} ${candidate.lastName}`}
                      fill
                      className="object-cover"
                      priority={index < 8}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    {candidate.location && (
                      <div className="flex items-center text-white/80 text-sm">
                        <FiMapPin className="w-4 h-4 mr-1" />
                        <span className="truncate">{candidate.location.state}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{candidate.stats.experienceYears}</div>
                    <div className="text-xs text-gray-600">Ans d'expérience</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{candidate.stats.age}</div>
                    <div className="text-xs text-gray-600">Ans</div>
                  </div>
                </div>

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Compétences</h4>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {candidate.bio && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {candidate.bio}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <FiCalendar className="w-3 h-3 mr-1" />
                    <span>Inscrit {new Date(candidate.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>

                  <div className="hover:scale-105 transition-transform">
                    <Link
                      href={`/users/${candidate._id}/individual`}
                      className="btn-primary text-sm px-4 py-2"
                    >
                      Voir profil
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
        {!loading && candidates.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <FiSearch className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun candidat trouvé</h3>
              <p className="text-gray-600 mb-6">
                Essayez de modifier vos critères de recherche ou explorez d'autres profils.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="btn-primary hover:scale-105 transition-transform"
              >
                Réinitialiser la recherche
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

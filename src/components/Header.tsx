"use client";
import { signIn, useSession } from "next-auth/react";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FiSearch, FiBriefcase, FiUsers, FiMenu, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

import NotificationsDropdown from './NotificationsDropdown';

interface CompanyDetails {
  companyName: string;
  registrationNumber: string;
  companySize: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  avatar: string;
  userType: 'individual' | 'company';
  companyDetails?: CompanyDetails;
}

const Header = () => {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/profile");
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [status]);

  const getDisplayName = () => {
    if (!userData) return '';
    return userData.userType === 'company' && userData.companyDetails
      ? userData.companyDetails.companyName
      : `${userData.firstName} ${userData.lastName}`;
  };

  const renderDashboardLink = () => {
    if (!userData) return null;

    if (userData.userType === 'company') {
      return (
        <Link 
          href="/dashboard/applications" 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiBriefcase className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-sm sm:text-base">طلبات التوظيف</span>
        </Link>
      );
    } else {
      return (
        <Link 
          href="/dashboard/my-applications" 
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiBriefcase className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-medium text-sm sm:text-base">طلباتي</span>
        </Link>
      );
    }
  };

  return (
    <header className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <div>
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={120}
                  height={120}
                  className="rounded-lg w-auto h-12 drop-shadow-md"
                />
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {session && (
                <div>
                  {renderDashboardLink()}
                </div>
              )}
              <div>
                <Link href="/users/offers" className="group flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-200 relative">
                  <FiBriefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">عروض العمل</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></div>
                </Link>
              </div>
              <div>
                <Link href="/candidates" className="group flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-200 relative">
                  <FiUsers className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Candidates</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></div>
                </Link>
              </div>
            </nav>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-6">
            <div className="hidden md:flex items-center">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search jobs, companies..."
                  className="bg-gray-50/80 backdrop-blur-sm rounded-full px-4 py-2.5 w-52 lg:w-64 text-sm outline-none border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 group-hover:bg-white"
                />
                <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <FiX className="w-5 h-5" />
              ) : (
                <FiMenu className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center">
              {status === "loading" ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
              ) : status === "authenticated" ? (
                <div>
                  <Link href="/profile" className="flex items-center space-x-3 group">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all duration-200 shadow-md">
                      <Image
                        src={userData?.avatar || "/default-avatar.png"}
                        alt="Profile"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-200"
                        sizes="40px"
                      />
                    </div>
                    <span className="hidden lg:block font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                      {getDisplayName()}
                    </span>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="btn-primary"
                >
                  Sign In
                </button>
              )}
            </div>

            {session && (
              <div>
                <NotificationsDropdown />
              </div>
            )}
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 py-4 space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50">
              {session && (
                <div>
                  <Link
                    href={userData?.userType === 'company' ? "/dashboard/applications" : "/dashboard/my-applications"}
                    className="flex items-center space-x-3 p-3 rounded-xl bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiBriefcase className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">
                      {userData?.userType === 'company' ? 'طلبات التوظيف' : 'طلباتي'}
                    </span>
                  </Link>
                </div>
              )}

              <div>
                <Link
                  href="/users/offers"
                  className="flex items-center space-x-3 p-3 rounded-xl bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiBriefcase className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">عروض العمل</span>
                </Link>
              </div>

              <div>
                <Link
                  href="/candidates"
                  className="flex items-center space-x-3 p-3 rounded-xl bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUsers className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Candidates</span>
                </Link>
              </div>

              <div className="pt-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search jobs, companies..."
                    className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 w-full text-sm outline-none border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                  <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

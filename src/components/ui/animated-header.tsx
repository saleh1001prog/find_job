"use client";

import { signIn, useSession } from "next-auth/react";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FiSearch, FiBriefcase, FiUsers, FiMenu, FiX } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsDropdown from '../NotificationsDropdown';

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

const AnimatedHeader = () => {
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
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-200 relative group"
        >
          <FiBriefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">طلبات التوظيف</span>
          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></div>
        </Link>
      );
    } else {
      return (
        <Link 
          href="/dashboard/my-applications" 
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-200 relative group"
        >
          <FiBriefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">طلباتي</span>
          <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></div>
        </Link>
      );
    }
  };

  return (
    <motion.header
      className="fixed w-full z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo.png"
                  alt="Logo"
                  width={120}
                  height={120}
                  className="rounded-lg w-auto h-12 drop-shadow-md"
                />
              </Link>
            </motion.div>

            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              {session && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {renderDashboardLink()}
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link href="/users/offers" className="group flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-200 relative">
                  <FiBriefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">عروض العمل</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></div>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link href="/candidates" className="group flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-all duration-200 relative">
                  <FiUsers className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Candidates</span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-200"></div>
                </Link>
              </motion.div>
            </nav>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-6">
            <motion.div
              className="hidden md:flex items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search jobs, companies..."
                  className="bg-gray-50/80 backdrop-blur-sm rounded-full px-4 py-2.5 w-52 lg:w-64 text-sm outline-none border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 group-hover:bg-white"
                />
                <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-hover:text-blue-500 transition-colors" />
              </div>
            </motion.div>

            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiX className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FiMenu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.div
              className="flex items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              {status === "loading" ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
              ) : status === "authenticated" ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
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
                </motion.div>
              ) : (
                <motion.button
                  onClick={() => signIn()}
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              )}
            </motion.div>

            {session && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                <NotificationsDropdown />
              </motion.div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden border-t border-gray-200"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <motion.div
                className="px-4 py-4 space-y-3 bg-gradient-to-br from-blue-50 to-indigo-50"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {session && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
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
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    href="/users/offers"
                    className="flex items-center space-x-3 p-3 rounded-xl bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiBriefcase className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">عروض العمل</span>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href="/candidates"
                    className="flex items-center space-x-3 p-3 rounded-xl bg-white/70 backdrop-blur-sm text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiUsers className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Candidates</span>
                  </Link>
                </motion.div>

                <motion.div
                  className="pt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search jobs, companies..."
                      className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 w-full text-sm outline-none border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                    <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default AnimatedHeader;

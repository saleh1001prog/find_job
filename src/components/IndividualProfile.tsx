"use client"
import { FiEye, FiPhone, FiMail, FiCamera, FiImage, FiLogOut } from "react-icons/fi";
import { HiOutlineDocumentAdd } from "react-icons/hi";
import Image from "next/image";
import Link from "next/link";
import GetMyRequestJob from './GetMyRequestJob';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface IndividualProfileProps {
  userData: {
    firstName: string;
    lastName: string;
    phone: string;
    birthDate: string;
    avatar: string;
    coverImage?: string;
    userId: string;
  };
  onEditProfile: () => void;
  onSignOut: () => void;
  onUpdateAvatar: (file: File) => Promise<void>;
  onUpdateCover: (file: File) => Promise<void>;
}

export default function IndividualProfile({
  userData,
  onEditProfile,
  onSignOut,
  onUpdateAvatar,
  onUpdateCover
}: IndividualProfileProps) {
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن لا يتجاوز 5 ميجابايت");
      return;
    }

    try {
      if (type === 'avatar') {
        setIsUpdatingAvatar(true);
        await onUpdateAvatar(file);
      } else {
        setIsUpdatingCover(true);
        await onUpdateCover(file);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الصورة');
    } finally {
      setIsUpdatingAvatar(false);
      setIsUpdatingCover(false);
    }
  };

  const defaultAvatar = "/default-avatar.png";
  const defaultCover = "/default-cover.jpg";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Cover Image Section */}
          <div className="relative h-48">
            <div className="absolute inset-0">
              <Image
                src={userData.coverImage || defaultCover}
                alt="صورة الغلاف"
                fill
                className="object-cover"
                priority
              />
              <label className={`absolute top-4 right-4 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 transition ${isUpdatingCover ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  onChange={(e) => handleFileSelect(e, 'cover')}
                  accept="image/*"
                  className="hidden"
                  disabled={isUpdatingCover}
                />
                {isUpdatingCover ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                ) : (
                  <FiImage className="w-5 h-5 text-gray-600" />
                )}
              </label>
            </div>

            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-8">
              <div className="relative group">
                <div className="relative w-32 h-32">
                  <Image
                    src={userData.avatar || defaultAvatar}
                    alt="الصورة الشخصية"
                    fill
                    className="rounded-full border-4 border-white shadow-lg object-cover"
                    priority
                  />
                  {isUpdatingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <label className={`absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-50 transition opacity-0 group-hover:opacity-100 ${isUpdatingAvatar ? 'cursor-not-allowed' : ''}`}>
                  <input
                    type="file"
                    onChange={(e) => handleFileSelect(e, 'avatar')}
                    accept="image/*"
                    className="hidden"
                    disabled={isUpdatingAvatar}
                  />
                  <FiCamera className="w-5 h-5 text-gray-600" />
                </label>
              </div>
            </div>
          </div>

          {/* معلومات المستخدم */}
          <div className="pt-20 pb-6 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {`${userData.firstName} ${userData.lastName}`}
                </h1>
              </div>

              <button
                onClick={onEditProfile}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
              >
                تعديل الملف الشخصي
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    <FiPhone className="inline-block ml-2" />
                    Phone Number
                  </label>
                  <a href={`tel:${userData.phone}`} className="mt-1 text-gray-900 hover:text-blue-600">
                    {userData.phone}
                  </a>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(userData.birthDate).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* الإجراءات السريعة */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h2>
            <div className="space-y-3">
              {userData.userId && (
                <Link 
                  href={`/users/${userData.userId}/individual`} 
                  className="block"
                  prefetch={true}
                >
                  <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center">
                    <FiEye className="w-5 h-5 ml-2" />
                    عرض الملف العام
                  </button>
                </Link>
              )}
              <button
                onClick={onSignOut}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition flex items-center justify-center"
              >
                <FiLogOut className="w-5 h-5 ml-2" />
                تسجيل الخروج
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Requests Management</h2>
            <div className="space-y-3">
              <Link href="/profile/request-job" className="block">
                <button className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition flex items-center justify-center">
                  <HiOutlineDocumentAdd className="w-5 h-5 mr-2" />
                  Request Job
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Job Requests */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Requests</h2>
          <GetMyRequestJob />
        </div>
      </div>
    </div>
  );
}

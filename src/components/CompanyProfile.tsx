"use client";
import { FiEye, FiPhone, FiMail, FiCamera, FiImage, FiLogOut } from "react-icons/fi";
import { MdOutlinePostAdd } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import GetMyJobOffers from "./GetMyJobOffers";
import DOMPurify from "isomorphic-dompurify";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CompanyProfileProps {
  userData: {
    companyDetails?: {
      companyName: string;
      about: string;
      headquarters: string;
      branches: string[];
      contacts: { phone: string; email: string }[];
    };
    avatar: string;
    coverImage?: string;
    userId: string;
  };
  onEditProfile: () => void;
  onSignOut: () => void;
  onUpdateAvatar: (file: File) => Promise<void>;
  onUpdateCover: (file: File) => Promise<void>;
}

export default function CompanyProfile({
  userData,
  onEditProfile,
  onSignOut,
  onUpdateAvatar,
  onUpdateCover,
}: CompanyProfileProps) {
  const router = useRouter();

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must not exceed 5 MB");
        return;
      }

      try {
        if (type === "avatar") {
          await onUpdateAvatar(file);
        } else {
          await onUpdateCover(file);
        }
      } catch (error) {
        toast.error("An error occurred while updating the image");
      }
    }
  };

  const defaultAvatar = "/default-avatar.png";
  const defaultCover = "/default-cover.jpg";

  const avatarSrc = userData.avatar || defaultAvatar;
  const coverSrc = userData.coverImage || defaultCover;

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Cover Image Section */}
          <div className="relative h-56 md:h-64 bg-gray-200">
            <Image
              src={coverSrc}
              alt="Cover"
              fill
              className="object-cover"
              priority
            />
            <label className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-md cursor-pointer hover:bg-gray-100 transition">
              <input
                type="file"
                onChange={(e) => handleFileSelect(e, "cover")}
                accept="image/*"
                className="hidden"
              />
              <FiImage className="w-6 h-6 text-gray-600" />
            </label>

            {/* Profile Picture */}
            <div className="absolute -bottom-16 left-8">
              <div className="relative group">
                <Image
                  src={avatarSrc}
                  alt="Profile Picture"
                  width={128}
                  height={128}
                  className="rounded-full border-4 border-white shadow-lg object-cover"
                  priority
                />
                <label className="absolute bottom-2 right-2 bg-white rounded-full p-3 shadow-md cursor-pointer hover:bg-gray-100 transition opacity-0 group-hover:opacity-100">
                  <input
                    type="file"
                    onChange={(e) => handleFileSelect(e, "avatar")}
                    accept="image/*"
                    className="hidden"
                  />
                  <FiCamera className="w-5 h-5 text-gray-600" />
                </label>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="pt-24 pb-8 px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                {userData.companyDetails?.companyName}
              </h1>
              <button
                onClick={onEditProfile}
                className="px-5 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition"
              >
                Edit Profile
              </button>
            </div>

            {/* About & Details */}
            {userData.companyDetails && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    About the Company
                  </label>
                  <div
                    className="mt-1 prose prose-sm max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        userData.companyDetails.about || ""
                      ),
                    }}
                  />
                </div>
                {userData.companyDetails.headquarters && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Headquarters
                    </label>
                    <p className="mt-1 text-gray-800">
                      {userData.companyDetails.headquarters}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link href={`/users/${userData.userId}/company`}>
                <button className="w-full flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition">
                  <FiEye className="w-5 h-5 mr-2" />
                  View Public Profile
                </button>
              </Link>
              <button
                onClick={onSignOut}
                className="w-full flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
              >
                <FiLogOut className="w-5 h-5 mr-2" />
                Sign Out
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Job Management
            </h2>
            <div className="space-y-3">
              <Link href="/profile/job-offers">
                <button className="w-full flex items-center justify-center px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition">
                  <MdOutlinePostAdd className="w-5 h-5 mr-2" />
                  Post a Job
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Job Offers */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Published Job Offers
          </h2>
          <GetMyJobOffers />
        </div>
      </div>
    </div>
  );
}

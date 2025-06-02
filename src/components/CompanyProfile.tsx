"use client";
import { FiEye, FiPhone, FiMail, FiCamera, FiImage, FiLogOut, FiSettings, FiUsers, FiBriefcase, FiCalendar, FiMapPin } from "react-icons/fi";
import { MdOutlinePostAdd } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi";
import Image from "next/image";
import Link from "next/link";
import GetMyJobOffers from "./GetMyJobOffers";
import DOMPurify from "isomorphic-dompurify";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  AnimatedButton,
  LazyImage,
  useNotifications,
  NotificationContainer
} from "@/components/ui";

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
  const { success, error, notifications } = useNotifications();

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
          success("تم تحديث الصورة الشخصية بنجاح", "تم رفع الصورة وحفظها");
        } else {
          await onUpdateCover(file);
          success("تم تحديث صورة الغلاف بنجاح", "تم رفع الصورة وحفظها");
        }
      } catch (err) {
        error("فشل في تحديث الصورة", "يرجى المحاولة مرة أخرى");
      }
    }
  };

  const defaultAvatar = "/default-avatar.png";
  const defaultCover = "/default-cover.jpg";

  const avatarSrc = userData.avatar || defaultAvatar;
  const coverSrc = userData.coverImage || defaultCover;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Header */}
        <ScrollReveal direction="up" delay={0.1}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              مرحباً بك في لوحة تحكم الشركة
            </h1>
            <p className="text-gray-600 text-lg">إدارة شاملة لملف شركتك وعروض العمل</p>
          </div>
        </ScrollReveal>



        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Company Profile */}
          <div className="lg:col-span-1">
            <ScrollReveal direction="left" delay={0.3}>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Cover Image Section */}
                <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600">
                  <LazyImage
                    src={coverSrc}
                    alt="Cover"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <label className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg cursor-pointer hover:bg-white transition group">
                    <input
                      type="file"
                      onChange={(e) => handleFileSelect(e, "cover")}
                      accept="image/*"
                      className="hidden"
                    />
                    <FiImage className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition" />
                  </label>

                  {/* Profile Picture */}
                  <div className="absolute -bottom-16 left-6">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                        <LazyImage
                          src={avatarSrc}
                          alt="Profile Picture"
                          width={128}
                          height={128}
                          className="object-cover w-full h-full"
                          priority
                        />
                      </div>
                      <label className="absolute bottom-2 right-2 bg-blue-600 rounded-full p-2 shadow-lg cursor-pointer hover:bg-blue-700 transition opacity-0 group-hover:opacity-100">
                        <input
                          type="file"
                          onChange={(e) => handleFileSelect(e, "avatar")}
                          accept="image/*"
                          className="hidden"
                        />
                        <FiCamera className="w-4 h-4 text-white" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="pt-20 pb-6 px-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {userData.companyDetails?.companyName || "اسم الشركة"}
                    </h2>
                    <div className="flex items-center justify-center text-gray-600 mb-4">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      <span>{userData.companyDetails?.headquarters || "الموقع غير محدد"}</span>
                    </div>
                    <AnimatedButton
                      variant="primary"
                      size="sm"
                      onClick={onEditProfile}
                      className="mb-4"
                    >
                      <FiSettings className="w-4 h-4 mr-2" />
                      تعديل الملف الشخصي
                    </AnimatedButton>
                  </div>

                  {/* About & Details */}
                  {userData.companyDetails && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">نبذة عن الشركة</h3>
                        <div
                          className="text-sm text-gray-600 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                              userData.companyDetails.about || "لم يتم إضافة وصف للشركة بعد."
                            ),
                          }}
                        />
                      </div>

                      {/* Contact Info */}
                      {userData.companyDetails.contacts && userData.companyDetails.contacts.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">معلومات الاتصال</h3>
                          <div className="space-y-2">
                            {userData.companyDetails.contacts.map((contact, index) => (
                              <div key={index} className="flex items-center text-sm text-gray-600">
                                <FiPhone className="w-4 h-4 mr-2 text-blue-500" />
                                <span>{contact.phone}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="space-y-3">
                      <Link href={`/users/${userData.userId}/company`}>
                        <AnimatedButton
                          variant="ghost"
                          size="sm"
                          className="w-full justify-center"
                        >
                          <FiEye className="w-4 h-4 mr-2" />
                          عرض الملف العام
                        </AnimatedButton>
                      </Link>

                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        onClick={onSignOut}
                        className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <FiLogOut className="w-4 h-4 mr-2" />
                        تسجيل الخروج
                      </AnimatedButton>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column - Management Dashboard */}
          <div className="lg:col-span-2">
            <ScrollReveal direction="right" delay={0.4}>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                {/* Job Management Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <FiBriefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">إدارة الوظائف</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">إنشاء وإدارة عروض العمل الخاصة بك</p>
                  <div className="space-y-3">
                    <Link href="/profile/job-offers">
                      <AnimatedButton
                        variant="primary"
                        className="w-full justify-center"
                      >
                        <MdOutlinePostAdd className="w-5 h-5 mr-2" />
                        نشر وظيفة جديدة
                      </AnimatedButton>
                    </Link>
                    <Link href="/dashboard/applications">
                      <AnimatedButton
                        variant="secondary"
                        className="w-full justify-center"
                      >
                        <HiOutlineUserGroup className="w-5 h-5 mr-2" />
                        إدارة المتقدمين
                      </AnimatedButton>
                    </Link>
                  </div>
                </div>



                {/* Settings Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                      <FiSettings className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">الإعدادات</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">إدارة إعدادات الحساب والإشعارات</p>
                  <div className="space-y-3">
                    <AnimatedButton
                      variant="ghost"
                      onClick={onEditProfile}
                      className="w-full justify-center"
                    >
                      <FiSettings className="w-5 h-5 mr-2" />
                      إعدادات الملف الشخصي
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      className="w-full justify-center"
                    >
                      <FiMail className="w-5 h-5 mr-2" />
                      إعدادات الإشعارات
                    </AnimatedButton>
                  </div>
                </div>

                {/* Calendar Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <FiCalendar className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">المواعيد</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">جدولة المقابلات وإدارة المواعيد</p>
                  <div className="space-y-3">
                    <AnimatedButton
                      variant="secondary"
                      className="w-full justify-center"
                    >
                      <FiCalendar className="w-5 h-5 mr-2" />
                      عرض التقويم
                    </AnimatedButton>
                    <AnimatedButton
                      variant="ghost"
                      className="w-full justify-center"
                    >
                      <FiUsers className="w-5 h-5 mr-2" />
                      جدولة مقابلة
                    </AnimatedButton>
                  </div>
                </div>
              </div>

            </ScrollReveal>
          </div>
        </div>

        {/* Job Offers Section */}
        <ScrollReveal direction="up" delay={0.5}>
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <FiBriefcase className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">عروض العمل المنشورة</h2>
              </div>
              <Link href="/profile/job-offers">
                <AnimatedButton variant="primary">
                  <MdOutlinePostAdd className="w-5 h-5 mr-2" />
                  إضافة عرض جديد
                </AnimatedButton>
              </Link>
            </div>
            <GetMyJobOffers />
          </div>
        </ScrollReveal>

        {/* Notification Container */}
        <NotificationContainer notifications={notifications} />
      </div>
    </div>
  );
}

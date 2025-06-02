"use client";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import CompanyProfile from './CompanyProfile';
import IndividualProfile from './IndividualProfile';

interface UserData {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  avatar: string;
  userId: string;
  userType: 'individual' | 'company' | '';
  isProfileComplete: boolean;
  companyDetails?: {
    companyName: string;
    about: string;
    headquarters: string;
    branches: string[];
    contacts: { phone: string; email: string }[];
  };
  coverImage?: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData>({
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    avatar: session?.user?.image || "",
    userId: "",
    userType: "",
    isProfileComplete: false
  });
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch("/api/profile");

          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Failed to load profile");
          }

          const data = await res.json();

          if (!data.isProfileComplete) {
            router.push('/profile/setup');
            return;
          }

          setUserData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
            birthDate: data.birthDate || "",
            avatar: data.avatar || session?.user?.image || "",
            userId: data._id,
            userType: data.userType || "",
            isProfileComplete: data.isProfileComplete || false,
            companyDetails: data.companyDetails || null,
            coverImage: data.coverImage || ""
          });
        } catch (error) {
          console.error('Profile fetch error:', error);
          toast.error("Error loading profile");
        }
      }
    };

    checkProfile();
  }, [session?.user?.email, router]);

  const handleEditProfile = () => {
    if (userData.userType === 'company') {
      router.push('/profile/setup/company-setup');
    } else {
      router.push('/profile/setup/individual-setup');
    }
  };

  const handleUpdateAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch('/api/profile/update-avatar', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update avatar');
    }

    const data = await response.json();
    setUserData(prev => ({
      ...prev,
      avatar: data.avatar
    }));

    toast.success('Avatar updated successfully');
  };

  const handleUpdateCover = async (file: File) => {
    const formData = new FormData();
    formData.append('coverImage', file);

    const response = await fetch('/api/profile/update-cover', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update cover image');
    }

    const data = await response.json();
    setUserData(prev => ({
      ...prev,
      coverImage: data.coverImage
    }));

    toast.success('Cover image updated successfully');
  };

  if (!session) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
      <p className="text-sm text-gray-500 mt-4">Loading...</p>
    </div>
  );

  return userData.userType === 'company' ? (
    <CompanyProfile
      userData={userData}
      onEditProfile={handleEditProfile}
      onSignOut={() => signOut()}
      onUpdateAvatar={handleUpdateAvatar}
      onUpdateCover={handleUpdateCover}
    />
  ) : (
    <IndividualProfile
      userData={userData}
      onEditProfile={handleEditProfile}
      onSignOut={() => signOut()}
      onUpdateAvatar={handleUpdateAvatar}
      onUpdateCover={handleUpdateCover}
    />
  );
}

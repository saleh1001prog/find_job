"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function SetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUserTypeSelection = async (userType: 'individual' | 'company') => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType }),
      });

      if (!res.ok) throw new Error('Failed to set user type');

      router.push(`/profile/setup/${userType}-setup`);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديد نوع الحساب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-center">اختر نوع الحساب</h2>
        <div className="space-y-4">
          <button
            onClick={() => handleUserTypeSelection('individual')}
            disabled={isSubmitting}
            className="w-full p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            حساب شخصي
          </button>
          <button
            onClick={() => handleUserTypeSelection('company')}
            disabled={isSubmitting}
            className="w-full p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            حساب شركة
          </button>
        </div>
      </div>
    </div>
  );
} 
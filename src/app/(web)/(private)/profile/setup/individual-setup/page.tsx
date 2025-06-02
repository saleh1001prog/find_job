"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fr } from "date-fns/locale";
import { Loader2 } from 'lucide-react';

interface UserData {
  avatar?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  userType?: 'individual';
}

export default function IndividualSetup() {
  const { data: session } = useSession();
  const router = useRouter();

  const [individualDetails, setIndividualDetails] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: null as Date | null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    const loadExistingProfile = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/profile');
        if (!res.ok) {
          throw new Error('Failed to load profile');
        }
        const data = await res.json();
        setIndividualDetails({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('خطأ في تحميل الملف الشخصي');
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingProfile();
  }, [session, router]);

  const handleIndividualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setIndividualDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // التحقق من صحة البيانات
    if (!individualDetails.firstName.trim() || !individualDetails.lastName.trim()) {
      toast.error('الرجاء إدخال الاسم الأول واللقب');
      setIsSubmitting(false);
      return;
    }

    if (!individualDetails.phone.match(/^(0)(5|6|7)[0-9]{8}$/)) {
      toast.error('رقم الهاتف غير صحيح');
      setIsSubmitting(false);
      return;
    }

    if (!individualDetails.birthDate) {
      toast.error('الرجاء إدخال تاريخ الميلاد');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('userType', 'individual');
      
      Object.entries(individualDetails).forEach(([key, value]) => {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (value) {
          formData.append(key, value);
        }
      });

      const res = await fetch('/api/profile', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'فشل في تحديث الملف الشخصي');
      }

      toast.success('تم تحديث الملف الشخصي بنجاح');
      router.push('/profile');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء التحديث');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-6 text-right">إعداد الملف الشخصي</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-right mb-1">الاسم الأول</label>
            <input
              type="text"
              name="firstName"
              value={individualDetails.firstName}
              onChange={handleIndividualChange}
              className="w-full p-2 border border-gray-300 rounded-md text-right"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-right mb-1">اللقب</label>
            <input
              type="text"
              name="lastName"
              value={individualDetails.lastName}
              onChange={handleIndividualChange}
              className="w-full p-2 border border-gray-300 rounded-md text-right"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-right mb-1">رقم الهاتف</label>
            <input
              type="tel"
              name="phone"
              value={individualDetails.phone}
              onChange={handleIndividualChange}
              className="w-full p-2 border border-gray-300 rounded-md text-right"
              pattern="^(0)(5|6|7)[0-9]{8}$"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-right mb-1">تاريخ الميلاد</label>
            <DatePicker
              selected={individualDetails.birthDate}
              onChange={(date) => setIndividualDetails(prev => ({ ...prev, birthDate: date }))}
              dateFormat="dd/MM/yyyy"
              locale={fr}
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              maxDate={new Date()}
              minDate={new Date(1954, 0, 1)}
              placeholderText="اختر تاريخ الميلاد"
              className="w-full p-2 border border-gray-300 rounded-md text-right"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ المعلومات'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 
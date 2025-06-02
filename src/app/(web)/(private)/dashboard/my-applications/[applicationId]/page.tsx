"use client"
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { use } from 'react';
import { useRouter } from "next/navigation";

interface Application {
  _id: string;
  positions: Array<{
    title: string;
    status: string;
  }>;
  status: 'pending' | 'interview_scheduled' | 'rejected';
  appliedAt: string;
  offerDetails?: {
    companyName: string;
    location: {
      state: string;
      municipality: string;
    };
  };
  interview?: {
    date: string;
    time: string;
    location: string;
    notes: string;
  };
}

export default function ApplicationDetailsPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const resolvedParams = use(params);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/jobs/my-applications/${resolvedParams.applicationId}`);
        if (response.status === 404) {
          setError("This application has been deleted by the company");
          toast.error("This application has been deleted by the company");
          // بعد 3 ثواني، نقوم بتوجيه المستخدم إلى صفحة الطلبات
          setTimeout(() => {
            router.push('/dashboard/my-applications');
          }, 3000);
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setApplication(data);
      } catch (error) {
        console.error('Error:', error);
        setError("Error loading application details");
        toast.error("Error loading application details");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchApplication();
    }
  }, [session, resolvedParams.applicationId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <div className="mb-4 text-red-500">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Application Not Available</h3>
            <p className="text-gray-500">{error}</p>
            <div className="mt-6">
              <Link 
                href="/dashboard/my-applications"
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Applications
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">Application not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <Link 
          href="/dashboard/my-applications"
          className="text-blue-600 hover:text-blue-800"
        >
          ← رجوع إلى الطلبات
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">تفاصيل الطلب</h1>
            <span className={`px-3 py-1 rounded-full text-sm ${
              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              application.status === 'interview_scheduled' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {application.status === 'pending' ? 'قيد المراجعة' :
               application.status === 'interview_scheduled' ? 'تم جدولة مقابلة' :
               'تم الرفض'}
            </span>
          </div>
          
          <div className="space-y-6">
            {/* معلومات الشركة */}
            <div>
              <h2 className="text-lg font-semibold mb-2">الشركة</h2>
              <p className="text-gray-800">{application.offerDetails?.companyName}</p>
              {application.offerDetails?.location && (
                <p className="text-gray-600 mt-1">
                  {application.offerDetails.location.state}, {application.offerDetails.location.municipality}
                </p>
              )}
            </div>

            {/* المناصب المتقدم لها */}
            <div>
              <h2 className="text-lg font-semibold mb-2">المناصب المتقدم لها</h2>
              <div className="space-y-2">
                {application.positions.map((position, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <span className="font-medium">{position.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* تفاصيل المقابلة إذا تمت جدولتها */}
            {application.status === 'interview_scheduled' && application.interview && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-green-800 mb-3">تفاصيل المقابلة</h2>
                <div className="grid gap-4">
                  <div>
                    <span className="font-medium">التاريخ: </span>
                    {new Date(application.interview.date).toLocaleDateString('ar-SA')}
                  </div>
                  <div>
                    <span className="font-medium">الوقت: </span>
                    {application.interview.time}
                  </div>
                  <div>
                    <span className="font-medium">المكان: </span>
                    {application.interview.location}
                  </div>
                  {application.interview.notes && (
                    <div>
                      <span className="font-medium">ملاحظات إضافية: </span>
                      {application.interview.notes}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* تاريخ التقديم */}
            <div>
              <h2 className="text-lg font-semibold mb-2">تاريخ التقديم</h2>
              <p className="text-gray-600">
                {new Date(application.appliedAt).toLocaleDateString('ar-SA')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
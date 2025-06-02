"use client";
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { use } from 'react';

interface Position {
  title: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface Application {
  _id: string;
  applicantName: string;
  positions: Position[];
  appliedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
  offerDetails?: {
    companyName: string;
    location: {
      state: string;
      municipality: string;
    };
  };
}

export default function ApplicationDetails({ params }: { params: Promise<{ applicationId: string }> }) {
  const resolvedParams = use(params);
  const [application, setApplication] = useState<Application | null>(null);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/jobs/applications/${resolvedParams.applicationId}`);
        if (response.ok) {
          const data = await response.json();
          setApplication(data);
        }
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchApplication();
    }
  }, [resolvedParams.applicationId, session]);

  if (loading) {
    return <div className="p-4">جاري التحميل...</div>;
  }

  if (!application) {
    return <div className="p-4">لم يتم العثور على الطلب</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد المراجعة';
      case 'accepted':
        return 'مقبول';
      case 'rejected':
        return 'مرفوض';
      default:
        return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">تفاصيل طلب التوظيف</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">المتقدم</h2>
          <p className="text-gray-700">{application.applicantName}</p>
        </div>

        {application.offerDetails && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">الشركة</h2>
            <p className="text-gray-700">{application.offerDetails.companyName}</p>
            <p className="text-gray-600 text-sm mt-1">
              {application.offerDetails.location.state}, {application.offerDetails.location.municipality}
            </p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">المناصب المطلوبة</h2>
          <div className="space-y-3">
            {application.positions.map((position, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-gray-700">{position.title}</span>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(position.status)}`}>
                  {getStatusText(position.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">تاريخ التقديم</h2>
          <p className="text-gray-700">
            {new Date(application.appliedAt).toLocaleDateString('ar-SA')}
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">حالة الطلب</h2>
          <span className={`px-4 py-2 rounded-lg inline-block ${getStatusColor(application.status)}`}>
            {getStatusText(application.status)}
          </span>
        </div>
      </div>
    </div>
  );
} 
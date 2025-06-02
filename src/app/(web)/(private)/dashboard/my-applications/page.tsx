"use client"
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";

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
}

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/jobs/my-applications');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error("Error loading applications");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchApplications();
    }
  }, [session]);

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    
    try {
      const response = await fetch(`/api/jobs/my-applications/${applicationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete');
      }
      
      toast.success("Application deleted successfully");
      setApplications(applications.filter(app => app._id !== applicationId));
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : "Error deleting application");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">طلباتي</h1>

      {applications.length > 0 ? (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Link
              key={application._id}
              href={`/dashboard/my-applications/${application._id}`}
              className="block bg-white p-6 rounded-lg shadow hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {application.offerDetails?.companyName}
                  </h3>
                  <div className="mt-2">
                    <div className="flex flex-col gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'interview_scheduled' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.status === 'pending' ? 'قيد المراجعة' :
                         application.status === 'interview_scheduled' ? 'تم استدعائك لمقابلة عمل' :
                         'تم رفض الطلب'}
                      </span>
                      
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">المناصب: </span>
                        {application.positions.map((position, idx) => (
                          <span key={idx} className="ml-1">
                            {position.title}
                            {idx < application.positions.length - 1 ? '، ' : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {application.offerDetails?.location && (
                    <p className="text-sm text-gray-500 mt-2">
                      {application.offerDetails.location.state}, {application.offerDetails.location.municipality}
                    </p>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(application.appliedAt).toLocaleDateString('ar-SA')}
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeleteApplication(application._id);
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  حذف الطلب
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">لم تقم بتقديم أي طلبات بعد</p>
        </div>
      )}
    </div>
  );
} 
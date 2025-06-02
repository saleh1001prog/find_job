import Link from "next/link";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";

interface JobRequest {
  _id: string;
  firstName: string;
  lastName: string;
  age: string;
  state: string;
  municipality: string;
  phone: string;
  educationLevel: string;
  academicYears: string;
  diploma: string;
  diplomaName: string;
  specialization: string;
  aboutMe: string;
  hasExperience: boolean;
  experienceDuration: string;
  previousPosition: string;
  images: string[];
}

const GetMyRequestJob: React.FC = () => {
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  useEffect(() => {
    fetchJobRequests();
  }, []);

  const fetchJobRequests = async () => {
    try {
      const response = await fetch("/api/request-job", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("فشل في جلب طلبات العمل");
      }

      const data = await response.json();
      setJobRequests(data);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
      setError(err.message);
      toast.error("حدث خطأ أثناء جلب طلبات العمل");
    } finally {
      setLoading(false);
    }
  };

  const deleteJobRequest = async (id: string) => {
    try {
      const response = await fetch(`/api/request-job/?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("فشل في حذف طلب العمل");
      }

      setJobRequests((prev) => prev.filter((request) => request._id !== id));
      toast.success("تم حذف طلب العمل بنجاح");
    } catch (err: any) {
      console.error("Delete error:", err.message);
      toast.error("حدث خطأ أثناء حذف طلب العمل");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">خطأ: {error}</p>
        <button
          onClick={fetchJobRequests}
          className="mt-2 px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jobRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات عمل</h3>
          <p className="mt-1 text-sm text-gray-500">ابدأ بإنشاء طلب عمل جديد</p>
          <div className="mt-6">
            <Link href="/profile/request-job">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                إنشاء طلب عمل
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {jobRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.firstName} {request.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{request.specialization}</p>
                  </div>
                  <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                    {request.age} سنة
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {request.state}, {request.municipality}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {request.educationLevel} - {request.diplomaName}
                  </div>
                </div>

                {request.images && request.images.length > 0 && (
                  <div className="mt-4 flex space-x-2 rtl:space-x-reverse overflow-x-auto pb-2">
                    {request.images.map((image, index) => (
                      <div key={index} className="flex-shrink-0">
                        <Image
                          src={image}
                          alt={`Document ${index + 1}`}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex justify-end space-x-3 rtl:space-x-reverse">
                  <Link
                    href={`/profile/request-job/EditMyRequestJob?id=${request._id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    تعديل
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
                        deleteJobRequest(request._id);
                      }
                    }}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GetMyRequestJob;

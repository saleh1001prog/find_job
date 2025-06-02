"use client"
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Applicant {
  _id: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

interface Application {
  _id: string;
  applicantId: string;
  applicant: Applicant;
  positions: Array<{
    title: string;
    status: string;
  }>;
  status: 'pending' | 'interview_scheduled' | 'rejected';
  appliedAt: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isInterviewDialogOpen, setIsInterviewDialogOpen] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState({
    date: '',
    time: '',
    location: '',
    notes: ''
  });
  const { data: session } = useSession();

  useEffect(() => {
    fetchApplications();
  }, [session]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/jobs/applications');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      // Fetch applicant details for each application
      const enrichedApplications = await Promise.all(
        data.map(async (app: Application) => {
          const userResponse = await fetch(`/api/users/${app.applicantId}/individual?endpoint=profile`);
          const userData = await userResponse.json();
          return {
            ...app,
            applicant: userData
          };
        })
      );
      
      setApplications(enrichedApplications);
    } catch (error) {
      console.error('Error:', error);
      toast.error("حدث خطأ أثناء تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: 'interview_scheduled' | 'rejected') => {
    try {
      const response = await fetch(`/api/jobs/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update status');

      if (status === 'interview_scheduled') {
        setSelectedApplication(applications.find(app => app._id === applicationId) || null);
        setIsInterviewDialogOpen(true);
      } else {
        toast.success("تم تحديث حالة الطلب بنجاح");
        fetchApplications(); // Refresh the list
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث حالة الطلب");
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    
    try {
      const response = await fetch(`/api/jobs/applications/${applicationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete');
      
      toast.success("تم حذف الطلب بنجاح");
      fetchApplications(); // Refresh the list
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الطلب");
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplication) return;

    try {
      const response = await fetch(`/api/jobs/applications/${selectedApplication._id}/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interviewDetails)
      });

      if (!response.ok) throw new Error('Failed to schedule interview');

      toast.success("تم جدولة المقابلة بنجاح");
      setIsInterviewDialogOpen(false);
      fetchApplications(); // Refresh the list
    } catch (error) {
      toast.error("حدث خطأ أثناء جدولة المقابلة");
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
      <h1 className="text-2xl font-bold mb-6">طلبات التوظيف</h1>

      {applications.length > 0 ? (
        <div className="grid gap-4">
          {applications.map((application) => (
            <div
              key={application._id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Link href={`/users/${application.applicantId}/individual`}>
                    <Image
                      src={application.applicant.avatar || '/default-avatar.png'}
                      alt={`${application.applicant.firstName} ${application.applicant.lastName}`}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  </Link>
                  <div>
                    <Link 
                      href={`/users/${application.applicantId}/individual`}
                      className="font-semibold text-lg hover:text-blue-600"
                    >
                      {application.applicant.firstName} {application.applicant.lastName}
                    </Link>
                    <div className="mt-2 space-y-1">
                      {application.positions.map((position, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {position.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(application.appliedAt).toLocaleDateString('ar-SA')}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  application.status === 'interview_scheduled' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {application.status === 'pending' ? 'قيد المراجعة' :
                   application.status === 'interview_scheduled' ? 'تم جدولة مقابلة' : 'مرفوض'}
                </span>

                <div className="flex gap-2">
                  {application.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleStatusUpdate(application._id, 'interview_scheduled')}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        جدولة مقابلة
                      </Button>
                      <Button
                        onClick={() => handleStatusUpdate(application._id, 'rejected')}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        رفض
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => handleDeleteApplication(application._id)}
                    variant="outline"
                    className="text-red-500 hover:text-red-600"
                  >
                    حذف
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">لا توجد طلبات</p>
        </div>
      )}

      <Dialog open={isInterviewDialogOpen} onOpenChange={setIsInterviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>جدولة مقابلة العمل</DialogTitle>
            <DialogDescription>
              الرجاء تحديد تفاصيل المقابلة مع المتقدم للوظيفة
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">التاريخ</label>
              <input
                type="date"
                className="col-span-3 p-2 border rounded"
                value={interviewDetails.date}
                onChange={(e) => setInterviewDetails({
                  ...interviewDetails,
                  date: e.target.value
                })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">الوقت</label>
              <input
                type="time"
                className="col-span-3 p-2 border rounded"
                value={interviewDetails.time}
                onChange={(e) => setInterviewDetails({
                  ...interviewDetails,
                  time: e.target.value
                })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">المكان</label>
              <input
                type="text"
                className="col-span-3 p-2 border rounded"
                value={interviewDetails.location}
                onChange={(e) => setInterviewDetails({
                  ...interviewDetails,
                  location: e.target.value
                })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">ملاحظات</label>
              <textarea
                className="col-span-3 p-2 border rounded"
                value={interviewDetails.notes}
                onChange={(e) => setInterviewDetails({
                  ...interviewDetails,
                  notes: e.target.value
                })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleScheduleInterview}>تأكيد المقابلة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
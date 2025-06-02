"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { FiBell } from 'react-icons/fi';
import { useSocket } from './SocketProvider';

interface Notification {
  _id: string;
  type: 'interview_scheduled' | 'application_deleted';
  message: string;
  isRead: boolean;
  readAt: Date | null;
  createdAt: string;
  applicationId: string;
  interviewDetails?: {
    date: string;
    time: string;
    location: string;
    notes?: string;
    companyName: string;
  };
}

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const { socket } = useSocket();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
          
          setNotifications(prev => {
            const newNotifications = Array.isArray(data) ? data : [];
            return newNotifications.map(newNotif => ({
              ...newNotif,
              isRead: readNotifications.includes(newNotif._id) || 
                      prev.find(p => p._id === newNotif._id)?.isRead || 
                      false
            }));
          });
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      }
    };

    if (session) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  useEffect(() => {
    if (!socket) return;

    socket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      toast.success(notification.message);
    });

    return () => {
      socket.off('newNotification');
    };
  }, [socket]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        const response = await fetch(`/api/notifications/${notification._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to mark notification as read');
        }

        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, isRead: true, readAt: new Date() } : n
          )
        );
      }

      setShowNotifications(false);

      const checkApplication = await fetch(
        `/api/jobs/my-applications/${notification.applicationId}`
      );

      if (checkApplication.status === 404) {
        toast.error("تم حذف هذا الطلب");
        setNotifications(prev => prev.filter(n => n.applicationId !== notification.applicationId));
        return;
      }

      router.push(`/dashboard/my-applications/${notification.applicationId}`);
    } catch (error) {
      console.error('Error handling notification:', error);
      toast.error('حدث خطأ أثناء معالجة الإشعار');
    }
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      const unreadNotifications = notifications.filter(n => !n.isRead);
      unreadNotifications.forEach(async (notification) => {
        try {
          await fetch(`/api/notifications/${notification._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead: true }),
          });
        } catch (error) {
          console.error('Error updating notification:', error);
        }
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <FiBell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 max-h-96 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">الإشعارات</h3>
            {notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 rounded-lg transition-colors cursor-pointer
                      ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50'}
                    `}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3 rtl:space-x-reverse">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {notification.message}
                        </p>
                        {notification.type === 'interview_scheduled' && notification.interviewDetails && (
                          <div className="mt-1 text-xs text-gray-600">
                            <p>التاريخ: {new Date(notification.interviewDetails.date).toLocaleDateString('ar-SA')}</p>
                            <p>الوقت: {notification.interviewDetails.time}</p>
                            <p>المكان: {notification.interviewDetails.location}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString('ar-SA')}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">لا توجد إشعارات</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 
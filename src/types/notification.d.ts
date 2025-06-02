interface Notification {
  _id: string;
  type: 'job_application' | 'application_rejected' | 'interview_invitation';
  message: string;
  recipientId: string;
  applicationId: string;
  offerId: string;
  positions?: string[];
  applicantName?: string;
  interviewDetails?: {
    date: string;
    time: string;
    location: string;
    message: string;
  };
  createdAt: Date;
  isRead: boolean;
} 
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import OfferJob from '@/components/OfferJob';
import { JobOffer } from '@/types/types';

export default function EditMyJobOffer() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchJobOffer();
    }
  }, [id]);

  const fetchJobOffer = async () => {
    try {
      const response = await fetch(`/api/job-offers/edit?id=${id}`);
      if (!response.ok) throw new Error('Failed to fetch job offer');
      const data = await response.json();
      setJobOffer(data);
    } catch (error) {
      toast.error('خطأ في تحميل بيانات العرض');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!jobOffer) {
    return <div className="text-center py-12">لم يتم العثور على العرض</div>;
  }

  return <OfferJob initialData={jobOffer} isEditing={true} />;
} 
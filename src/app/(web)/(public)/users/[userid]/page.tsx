//find_job\src\app\users\[userid]\page.tsx
"use client"
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const { userid } = params;

  useEffect(() => {
    const checkUserType = async () => {
      try {
        const res = await fetch(`/api/users/${userid}`);
        if (!res.ok) throw new Error("Failed to fetch user type");
        
        const { userType } = await res.json();
        
        // توجيه المستخدم للصفحة المناسبة
        router.replace(`/users/${userid}/${userType}`);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    checkUserType();
  }, [userid, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

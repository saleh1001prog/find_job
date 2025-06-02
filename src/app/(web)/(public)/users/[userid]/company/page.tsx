"use client"
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import DOMPurify from 'isomorphic-dompurify';

interface CompanyProfile {
  companyDetails: {
    about: string;
  };
}

export default function CompanyProfilePage() {
  const { userid } = useParams();
  const [companyData, setCompanyData] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const profileRes = await fetch(`/api/users/${userid}/company?endpoint=company`);

        if (!profileRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const profileData = await profileRes.json();
        setCompanyData(profileData);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [userid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Entreprise non trouvée</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">À propos de l'entreprise</h2>
        <div 
          className="prose prose-sm max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(companyData.companyDetails.about || '') 
          }}
        />
      </div>
    </div>
  );
} 
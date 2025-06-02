"use client"
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface JobOffer {
  _id: string;
  companyName: string;
  companyLocation: {
    state: string;
    municipality: string;
  };
  positions: {
    title: string;
    requiredExperience: string;
    availablePositions: number;
  }[];
  createdAt: string;
}

export default function CompanyOffersPage() {
  const { userid } = useParams();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch(`/api/users/${userid}/company?endpoint=offers`);
        if (!response.ok) throw new Error("Failed to fetch offers");
        const data = await response.json();
        setOffers(data.offers);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Erreur lors du chargement des offres");
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, [userid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Offres d'emploi ({offers.length})
      </h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {offers.map((offer) => (
          <Link
            href={`/users/${userid}/company/offers/${offer._id}`}
            key={offer._id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {offer.companyName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {offer.companyLocation?.state}, {offer.companyLocation?.municipality}
                  </p>
                </div>
                <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                  {offer.positions?.length} postes
                </span>
              </div>

              <div className="space-y-3">
                {offer.positions?.map((position, index) => (
                  <div key={index} className="border-b border-gray-100 pb-2 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-800">
                          {position.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Expérience requise: {position.requiredExperience}
                        </div>
                      </div>
                      <div className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">
                        {position.availablePositions} poste{position.availablePositions > 1 ? 's' : ''} disponible{position.availablePositions > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <time className="block mt-4 text-xs text-gray-500">
                Publié le {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
              </time>
            </div>
          </Link>
        ))}
      </div>

      {offers.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">Aucune offre d'emploi disponible pour le moment</p>
        </div>
      )}
    </div>
  );
} 
"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { JobOffer } from "@/types/types";
import { FaPlus, FaPen, FaTrashAlt } from "react-icons/fa";
import { FiLoader } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";

export default function GetMyJobOffers() {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJobOffers();
  }, []);

  const fetchJobOffers = async () => {
    try {
      const response = await fetch("/api/job-offers");
      if (!response.ok) throw new Error("Échec de la récupération des offres d'emploi");
      const data = await response.json();
      setJobOffers(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des offres d'emploi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteJobOffer = async (id: string) => {
    try {
      const response = await fetch(`/api/job-offers?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Échec de la suppression de l'offre d'emploi");
      }

      setJobOffers((prev) => prev.filter((offer) => offer._id !== id));
      toast.success("Offre d'emploi supprimée avec succès");
    } catch (error) {
      console.error("Erreur de suppression :", error);
      toast.error("Une erreur est survenue lors de la suppression de l'offre d'emploi");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <FiLoader className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (!jobOffers.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
  <HiOutlineDocumentText className="mx-auto text-gray-400" size={48} />
  <h3 className="mt-2 text-sm font-medium text-gray-900">
    No job offers available
  </h3>
  <p className="mt-1 text-sm text-gray-500">Start by creating a new job offer</p>
  <div className="mt-6">
    <Link href="/profile/job-offers">
      <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
        <FaPlus className="mr-2" />
        Create a Job Offer
      </button>
    </Link>
  </div>
</div>

    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {jobOffers.map((offer) => (
        <div
          key={offer._id}
          className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {offer.companyName}
                </h3>
                <p className="text-sm text-gray-500">
                  {offer.companyLocation.state}, {offer.companyLocation.municipality}
                </p>
              </div>
              <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                {offer.positions.length} postes
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {offer.positions.map((position, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{position.title}</span>
                  <span className="text-gray-600">{position.availablePositions} postes</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end space-x-3 rtl:space-x-reverse">
              <Link
                href={`/profile/job-offers/EditMyJobOffer?id=${offer._id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                <FaPen className="mr-2" />
                Modifier
              </Link>
              <button
                onClick={() => {
                  if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
                    deleteJobOffer(offer._id!);
                  }
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition"
              >
                <FaTrashAlt className="mr-2" />
                Supprimer
              </button>
            </div>

            {offer.createdAt && (
              <div className="mt-4 text-xs text-gray-500 text-left">
                {new Date(offer.createdAt).toLocaleDateString("fr-FR")}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

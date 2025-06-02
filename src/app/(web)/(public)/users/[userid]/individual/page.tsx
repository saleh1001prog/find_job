"use client"
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface UserProfile {
  email: string;
  image: string | null;
  avatar: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  userType: 'individual';
}

interface UserJobRequest {
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
  createdAt: string;
}

export default function IndividualProfilePage() {
  const { userid } = useParams();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [requests, setRequests] = useState<UserJobRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [profileRes, requestsRes] = await Promise.all([
          fetch(`/api/users/${userid}/individual?endpoint=profile`),
          fetch(`/api/users/${userid}/individual?endpoint=requests`)
        ]);

        if (!profileRes.ok || !requestsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const profileData = await profileRes.json();
        const requestsData = await requestsRes.json();

        setUserData(profileData);
        setRequests(requestsData.requests);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Utilisateur non trouvé</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* User Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-16 right-8">
              <Image
                src={userData.avatar || "/default-avatar.png"}
                alt={`${userData.firstName} ${userData.lastName}`}
                width={128}
                height={128}
                className="rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>
          </div>

          <div className="pt-20 pb-6 px-8">
            <h1 className="text-2xl font-bold text-gray-900">
              {userData.firstName} {userData.lastName}
            </h1>
            <p className="text-gray-500 mt-1">{userData.email}</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <p className="mt-1 text-gray-900">{userData.phone || "Non spécifié"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                <p className="mt-1 text-gray-900">
                  {userData.birthDate 
                    ? new Date(userData.birthDate).toLocaleDateString('fr-FR')
                    : "Non spécifié"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Requests Section */}
        {requests.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Demandes d'emploi ({requests.length})
            </h2>
            <div className="space-y-6">
              {requests.map((request) => (
                <div key={request._id.toString()} 
                  className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* En-tête de la demande */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-white">
                        {request.specialization || "Sans spécialisation"}
                      </h3>
                      <span className="px-3 py-1 bg-white text-blue-600 rounded-full text-sm font-medium">
                        {request.age} ans
                      </span>
                    </div>
                  </div>

                  {/* Contenu de la demande */}
                  <div className="p-6 space-y-4">
                    {/* Informations personnelles */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Nom complet</p>
                        <p className="font-medium">{request.firstName} {request.lastName}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Téléphone</p>
                        <p className="font-medium">{request.phone}</p>
                      </div>
                    </div>

                    {/* Localisation */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Localisation</h4>
                      <div className="flex items-center text-gray-600">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{request.state}, {request.municipality}</span>
                      </div>
                    </div>

                    {/* Formation */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Formation</h4>
                      <div className="space-y-2">
                        <p className="text-blue-800">
                          <span className="font-medium">Niveau d'études :</span> {request.educationLevel}
                        </p>
                        <p className="text-blue-800">
                          <span className="font-medium">Années d'études :</span> {request.academicYears}
                        </p>
                        {request.diploma !== "Sans diplôme" && (
                          <>
                            <p className="text-blue-800">
                              <span className="font-medium">Diplôme :</span> {request.diploma}
                            </p>
                            <p className="text-blue-800">
                              <span className="font-medium">Intitulé du diplôme :</span> {request.diplomaName}
                            </p>
                            {request.specialization && (
                              <p className="text-blue-800">
                                <span className="font-medium">Spécialisation :</span> {request.specialization}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* À propos */}
                    {request.aboutMe && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">À propos</h4>
                        <p className="text-gray-600">{request.aboutMe}</p>
                      </div>
                    )}

                    {/* Expérience professionnelle */}
                    {request.hasExperience && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">Expérience professionnelle</h4>
                        <div className="space-y-2">
                          <p className="text-green-800">
                            <span className="font-medium">Poste précédent :</span> {request.previousPosition}
                          </p>
                          <p className="text-green-800">
                            <span className="font-medium">Durée d'expérience :</span> {request.experienceDuration} ans
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    {request.images && request.images.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Documents joints</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {request.images.map((image, index) => (
                            <Dialog key={index}>
                              <DialogTrigger asChild>
                                <div className="relative aspect-square cursor-pointer hover:opacity-90 transition">
                                  <Image
                                    src={image}
                                    alt={`Document ${index + 1}`}
                                    fill
                                    className="rounded-lg object-cover"
                                  />
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl w-full p-0">
                                <DialogTitle className="sr-only">
                                  Document {index + 1} de {request.firstName} {request.lastName}
                                </DialogTitle>
                                <div className="relative w-full h-[80vh]">
                                  <Image
                                    src={image}
                                    alt={`Document ${index + 1}`}
                                    fill
                                    className="object-contain"
                                    priority
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date de publication */}
                    <div className="text-sm text-gray-500">
                      Publié le : {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
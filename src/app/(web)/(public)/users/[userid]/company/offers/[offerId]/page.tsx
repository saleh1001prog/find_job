"use client"
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FiMapPin, FiCalendar, FiBriefcase, FiDollarSign, FiBook, FiList } from "react-icons/fi";
import parse from 'html-react-parser';
import DOMPurify from 'isomorphic-dompurify';
import { useSession } from "next-auth/react";
import Link from "next/link";

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
    description: string;
    requirements: string[];
    education: {
      level: string;
      years: string;
      details: string;
    };
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
  }[];
  description: string;
  createdAt: string;
}

interface JobApplication {
  userId: string;
  userName: string;
  userProfile: string;
  appliedAt: string;
}

interface Position {
  title: string;
  requiredExperience: string;
  availablePositions: number;
  description: string;
  requirements: string[];
  education: {
    level: string;
    years: string;
    details: string;
  };
}

const formatExperience = (experience: string) => {
  const experienceMap: { [key: string]: string } = {
    'بدون خبرة': 'Débutant accepté',
    'no experience': 'Débutant accepté',
    '1-2': "1-2 ans d'expérience",
    '2-5': "2-5 ans d'expérience",
    '5+': 'Plus de 5 ans',
  };
  return experienceMap[experience.toLowerCase()] || `${experience} ans d'expérience`;
};

export default function OfferDetailsPage() {
  const { userid, offerId } = useParams();
  const [offer, setOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const { data: session } = useSession();
  const [userType, setUserType] = useState<string | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    const checkUserType = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/profile');
          if (!response.ok) throw new Error('Failed to fetch user type');
          const data = await response.json();
          setUserType(data.userType);
        } catch (error) {
          console.error('Error fetching user type:', error);
        }
      }
    };

    checkUserType();
  }, [session]);

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        const response = await fetch(`/api/users/${userid}/company/offers/${offerId}`);
        if (!response.ok) throw new Error("Échec du chargement des détails de l'offre");
        const data = await response.json();
        setOffer(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Erreur lors du chargement des détails de l'offre");
      } finally {
        setLoading(false);
      }
    };

    fetchOfferDetails();
  }, [userid, offerId]);

  const handleApply = async () => {
    if (!session) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    if (selectedPositions.length === 0) {
      toast.error("الرجاء اختيار منصب واحد على الأقل");
      return;
    }

    try {
      setIsApplying(true);
      const response = await fetch(`/api/jobs/apply/${offerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: userid,
          positionTitles: selectedPositions,
        }),
      });

      if (!response.ok) {
        throw new Error("فشل في تقديم الطلب");
      }

      setHasApplied(true);
      setIsApplyModalOpen(false);
      toast.success("تم تقديم طلبك بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء تقديم الطلب");
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-900">Offre non trouvée</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* En-tête de l'offre */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-gray-900">{offer.companyName}</h1>
              <div className="flex items-center text-sm text-gray-500">
                <FiCalendar className="mr-2" />
                <time>
                  Publié le {new Date(offer.createdAt).toLocaleDateString('fr-FR')}
                </time>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <FiMapPin className="mr-2" />
              <span>{offer.companyLocation?.state}, {offer.companyLocation?.municipality}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description générale */}
      {offer.description && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Description de l'offre
          </h2>
          <div 
            className="prose max-w-none text-gray-600"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(offer.description)
            }}
          />
        </div>
      )}

      {/* Postes disponibles */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <FiList className="mr-2" />
          Postes disponibles
        </h2>
        
        <div className="space-y-8">
          {offer.positions.map((position, index) => (
            <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
              {/* En-tête du poste */}
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {position.title}
                </h3>
                <span className="px-3 py-1 text-sm font-medium text-green-600 bg-green-50 rounded-full">
                  {position.availablePositions} poste{position.availablePositions > 1 ? 's' : ''}
                </span>
              </div>

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center space-x-3">
                  <FiBriefcase className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Expérience requise</p>
                    <p className="font-medium text-gray-900">
                      {formatExperience(position.requiredExperience)}
                    </p>
                  </div>
                </div>

                {position.salary && (
                  <div className="flex items-center space-x-3">
                    <FiDollarSign className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Salaire</p>
                      <p className="font-medium text-gray-900">
                        {position.salary.min.toLocaleString()} - {position.salary.max.toLocaleString()} {position.salary.currency}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <FiBook className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Formation requise</p>
                    <p className="font-medium text-gray-900">{position.education.details}</p>
                  </div>
                </div>
              </div>

              {/* Description du poste */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Description du poste</h4>
                <p className="text-gray-600 whitespace-pre-line">{position.description}</p>
              </div>

              {/* Exigences */}
              {position.requirements && position.requirements.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Exigences du poste</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-2">
                    {position.requirements.map((req, idx) => (
                      <li key={idx} className="text-gray-600">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* زر التقديم - يظهر فقط للمستخدمين الطبيعيين */}
      {session?.user && userType === 'individual' && !hasApplied && (
        <div className="fixed bottom-8 right-8">
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
                     hover:bg-blue-700 transition shadow-lg"
          >
            <FiBriefcase className="w-5 h-5 mr-2 inline" />
            تقديم طلب
          </button>
        </div>
      )}

      {/* Modal اختيار المناصب */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">اختر المناصب التي تريد التقدم لها</h3>
            
            <div className="space-y-3">
              {offer?.positions.map((position, index) => (
                <label 
                  key={index} 
                  className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer
                    ${selectedPositions.includes(position.title) ? 'border-blue-500 bg-blue-50' : ''}
                  `}
                >
                  <input
                    type="checkbox"
                    name="positions"
                    value={position.title}
                    checked={selectedPositions.includes(position.title)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPositions([...selectedPositions, position.title]);
                      } else {
                        setSelectedPositions(selectedPositions.filter(title => title !== position.title));
                      }
                    }}
                    className="form-checkbox text-blue-600 h-5 w-5"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{position.title}</p>
                    <p className="text-sm text-gray-500">
                      {formatExperience(position.requiredExperience)}
                    </p>
                  </div>
                  <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                    {position.availablePositions} منصب متاح
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                تم اختيار {selectedPositions.length} منصب
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleApply}
                  disabled={selectedPositions.length === 0 || isApplying}
                  className={`
                    px-4 py-2 bg-blue-600 text-white rounded-lg
                    ${(selectedPositions.length === 0 || isApplying) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
                  `}
                >
                  {isApplying ? 'جاري التقديم...' : 'تأكيد التقديم'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* رسالة للشركات */}
      {session?.user && userType === 'company' && (
        <div className="fixed bottom-8 right-8">
          <div className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium shadow-lg">
            لا يمكن للشركات التقدم لعروض العمل
          </div>
        </div>
      )}

      {/* رسالة للمستخدمين غير المسجلين */}
      {!session?.user && (
        <div className="fixed bottom-8 right-8">
          <Link href="/auth/signin">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-lg">
              سجل دخول للتقديم
            </button>
          </Link>
        </div>
      )}

      {hasApplied && (
        <div className="fixed bottom-8 right-8">
          <div className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium shadow-lg">
            تم تقديم طلبك بنجاح ✓
          </div>
        </div>
      )}
    </div>
  );
}

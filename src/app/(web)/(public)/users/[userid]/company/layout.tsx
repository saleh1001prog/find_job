"use client"
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface CompanyProfile {
  email: string;
  avatar: string;
  coverImage: string;
  companyDetails: {
    companyName: string;
  };
}

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userid } = useParams();
  const pathname = usePathname();
  const [companyData, setCompanyData] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`/api/users/${userid}/company?endpoint=company`);
        if (!response.ok) throw new Error("Failed to fetch company data");
        const data = await response.json();
        setCompanyData(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [userid]);

  const navigation = [
    {
      name: "Profil de l'entreprise",
      href: `/users/${userid}/company`,
      current: pathname === `/users/${userid}/company`,
    },
    {
      name: "Offres d'emploi",
      href: `/users/${userid}/company/offers`,
      current: pathname === `/users/${userid}/company/offers`,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto">
          {/* Company Header */}
          <div className="relative h-48">
            {/* Cover Image */}
            <div className="absolute inset-0">
              <Image
                src={companyData?.coverImage || "/default-cover.jpg"}
                alt={companyData?.companyDetails.companyName || ""}
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-16 right-8">
              <Image
                src={companyData?.avatar || "/default-company.png"}
                alt={companyData?.companyDetails.companyName || ""}
                width={128}
                height={128}
                className="rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>
          </div>

          <div className="pt-20 px-8">
            <div className="flex justify-between items-center">
              <nav className="flex space-x-8" aria-label="Navigation">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      inline-flex items-center px-1 pt-1 pb-2 text-sm font-medium
                      ${item.current
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="text-right">
                <h1 className="text-2xl font-bold text-gray-900">
                  {companyData?.companyDetails.companyName}
                </h1>
                <p className="text-gray-500 mt-1">{companyData?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-8">
        {children}
      </div>
    </div>
  );
} 
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// استيراد TextEditor بشكل ديناميكي لتجنب مشاكل SSR
const TextEditor = dynamic(() => import("@/components/TextEditor"), {
  ssr: false,
  loading: () => <div className="h-32 w-full bg-gray-100 animate-pulse rounded-md" />
});

interface CompanyContact {
  phone: string;
  email: string;
}

interface CompanyDetails {
  companyName: string;
  about: string;
  headquarters: string;
  contacts: CompanyContact[];
}

interface UserData {
  avatar?: string;
  userType?: "company";
  companyDetails?: CompanyDetails;
}

export default function CompanySetup() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [companyDetails, setCompanyDetails] = useState<CompanyDetails>(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('companySetupData');
      return savedData ? JSON.parse(savedData) : {
        companyName: "",
        about: "",
        headquarters: "",
        contacts: [{ phone: "", email: "" }],
      };
    }
    return {
      companyName: "",
      about: "",
      headquarters: "",
      contacts: [{ phone: "", email: "" }],
    };
  });

  const [userData, setUserData] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const loadExistingProfile = async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) {
          throw new Error('Failed to load profile');
        }
        const data = await res.json();
        setUserData(data);

        if (data.companyDetails) {
          const details = {
            companyName: data.companyDetails.companyName || "",
            about: data.companyDetails.about || "",
            headquarters: data.companyDetails.headquarters || "",
            contacts: data.companyDetails.contacts?.length ? 
              data.companyDetails.contacts : 
              [{ phone: "", email: "" }],
          };
          setCompanyDetails(details);
          if (typeof window !== 'undefined') {
            localStorage.setItem('companySetupData', JSON.stringify(details));
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Error loading profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingProfile();
  }, [session, router]);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('companySetupData', JSON.stringify(companyDetails));
    }
  }, [companyDetails, mounted]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (value: string) => {
    setCompanyDetails((prev) => ({
      ...prev,
      about: value,
    }));
  };

  const handleContactChange = (index: number, field: keyof CompanyContact, value: string) => {
    const newContacts = [...companyDetails.contacts];
    newContacts[index] = {
      ...newContacts[index],
      [field]: value.toString(),
    };
    setCompanyDetails((prev) => ({
      ...prev,
      contacts: newContacts,
    }));
  };

  const addContact = () => {
    setCompanyDetails((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { phone: "", email: "" }],
    }));
  };

  const removeContact = (index: number) => {
    setCompanyDetails((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userType: "company",
          companyDetails: {
            companyName: companyDetails.companyName,
            about: companyDetails.about,
            headquarters: companyDetails.headquarters,
            contacts: companyDetails.contacts
          }
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update company profile");
      }

      localStorage.removeItem('companySetupData');
      
      toast.success("Company profile updated successfully");
      router.push("/profile");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while updating");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Company Profile Setup</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={companyDetails.companyName}
              onChange={handleCompanyChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">About the Company</label>
            <TextEditor
              value={companyDetails.about}
              onChange={handleEditorChange}
              placeholder="Write about your company here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Headquarters</label>
            <input
              type="text"
              name="headquarters"
              value={companyDetails.headquarters}
              onChange={handleCompanyChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <button
                type="button"
                onClick={addContact}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add Contact
              </button>
            </div>

            {companyDetails.contacts.map((contact, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Contact {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="text-red-500 hover:text-red-600"
                    disabled={companyDetails.contacts.length === 1}
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                      pattern="^(0)(5|6|7)[0-9]{8}$"
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => handleContactChange(index, "email", e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Information'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

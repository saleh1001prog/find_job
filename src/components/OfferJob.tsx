"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import states from "@/lib/states";
import {  JobOffer } from "@/types/types";
import { useRouter } from "next/navigation";
import TextEditor from './TextEditor';

interface OfferJobProps {
  initialData?: JobOffer;
  isEditing?: boolean;
}

interface JobPosition {
  title: string;
  requiredExperience: string;
  availablePositions: number;
  education: {
    level: string;
    years: string;
  };
}

export default function OfferJob({ initialData, isEditing }: OfferJobProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || "",
    state: initialData?.companyLocation?.state || "",
    municipality: initialData?.companyLocation?.municipality || "",
    address: initialData?.companyLocation?.address || "",
    description: initialData?.description || "",
  });
  const [positions, setPositions] = useState<JobPosition[]>(
    initialData?.positions as JobPosition[] || [{
      title: "",
      requiredExperience: "", 
      availablePositions: 1,
      education: {
        level: "",
        years: ""
      }
    }]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addPosition = () => {
    setPositions([...positions, {
      title: "",
      requiredExperience: "",
      availablePositions: 1,
      education: {
        level: "",
        years: ""
      }
    }]);
  };

  const removePosition = (index: number) => {
    setPositions(positions.filter((_, i) => i !== index));
  };

  const updatePosition = (index: number, field: string, value: any) => {
    const newPositions = [...positions];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newPositions[index] = {
        ...newPositions[index],
        [parent]: {
          ...(newPositions[index][parent as keyof JobPosition] as object),
          [child]: value
        }
      };
    } else {
      newPositions[index] = {
        ...newPositions[index],
        [field]: value
      };
    }
    setPositions(newPositions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("companyName", formData.companyName);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("municipality", formData.municipality);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("positions", JSON.stringify(positions));

      const url = isEditing 
        ? `/api/job-offers/edit?id=${initialData?._id}`
        : "/api/job-offers";
      
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method: method,
        body: formDataToSend
      });

      if (response.ok) {
        toast.success(isEditing ? "Job offer updated successfully" : "Job offer created successfully");
        router.push("/profile");
        router.refresh();
      } else {
        throw new Error("Failed to submit job offer");
      }
    } catch (error) {
      toast.error("An error occurred while submitting the job offer");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Company Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select a state</option>
                  {states.map((state, index) => (
                    <option key={index} value={state}>
                      {`${String(index + 1).padStart(2, '0')} - ${state}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Municipality</label>
                <input
                  type="text"
                  value={formData.municipality}
                  onChange={(e) => setFormData(prev => ({ ...prev, municipality: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          {/* General Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              General Description
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <TextEditor
                value={formData.description}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Describe your job offer in detail..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Add a general description of your job offer
              </p>
            </div>
          </div>

          {/* Job Positions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Available Positions</h3>
              <button
                type="button"
                onClick={addPosition}
                className="text-blue-500 hover:text-blue-600 transition-colors"
              >
                + Add Position
              </button>
            </div>

            <div className="space-y-6">
              {positions.map((position, index) => (
                <div key={index} className="p-6 bg-white border border-gray-200 rounded-md shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-lg">Position {index + 1}</h3>
                    {positions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePosition(index)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Position Title</label>
                        <input
                          type="text"
                          value={position.title}
                          onChange={(e) => updatePosition(index, "title", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Required Experience</label>
                        <input
                          type="text"
                          value={position.requiredExperience}
                          onChange={(e) => updatePosition(index, "requiredExperience", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Optional"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Number of Positions</label>
                        <input
                          type="number"
                          min="1"
                          value={position.availablePositions}
                          onChange={(e) => updatePosition(index, "availablePositions", parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Required Education Level</label>
                        <select
                          value={position.education.level}
                          onChange={(e) => updatePosition(index, "education.level", e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Select level</option>
                          <option value="middle">Middle School</option>
                          <option value="secondary">High School</option>
                          <option value="university">University</option>
                          <option value="no_condition">No Requirements</option>
                        </select>
                      </div>

                      {position.education.level && position.education.level !== "no_condition" && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Year of Study</label>
                          <select
                            value={position.education.years}
                            onChange={(e) => updatePosition(index, "education.years", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                          >
                            <option value="">Select year</option>
                            {position.education.level === "middle" && (
                              <>
                                <option value="1">1st year</option>
                                <option value="2">2nd year</option>
                                <option value="3">3rd year</option>
                                <option value="4">4th year</option>
                              </>
                            )}
                            {position.education.level === "secondary" && (
                              <>
                                <option value="1">1st year</option>
                                <option value="2">2nd year</option>
                                <option value="3">3rd year</option>
                              </>
                            )}
                            {position.education.level === "university" && (
                              <>
                                <option value="1">1st year</option>
                                <option value="2">2nd year</option>
                                <option value="3">3rd year</option>
                                <option value="4">4th year</option>
                                <option value="5">5th year</option>
                              </>
                            )}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-6 py-3 px-4 text-white rounded-md transition-colors ${
              isSubmitting 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting 
              ? "Processing..." 
              : isEditing 
                ? "Update Job Offer" 
                : "Create Job Offer"
            }
          </button>
        </div>
      </form>
    </div>
  );
} 
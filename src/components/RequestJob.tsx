"use client";
import states from "@/lib/states";
import educationalFields from "@/lib/educationalFields";
import { useState } from "react";
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BsPersonFill } from "react-icons/bs";
import { HiLocationMarker } from "react-icons/hi";
import { FaGraduationCap } from "react-icons/fa";
import { BsFileEarmarkText } from "react-icons/bs";
import { MdWork } from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { BiImageAdd } from "react-icons/bi";

interface FormData {
  firstName: string;
  lastName: string;
  birthDate: Date | null;
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
  images: File[];
}

const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export default function RequestJob() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    birthDate: null,
    state: "",
    municipality: "",
    phone: "",
    educationLevel: "",
    academicYears: "",
    diploma: "No diploma",
    diplomaName: "",
    specialization: "",
    aboutMe: "",
    hasExperience: false,
    experienceDuration: "",
    previousPosition: "",
    images: [],
  });

  const [specializationOptions, setSpecializationOptions] = useState<string[]>([]);
  const [academicYearOptions, setAcademicYearOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleEducationLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const educationLevel = e.target.value;
    setFormData((prevData) => ({ ...prevData, educationLevel, academicYears: "" }));

    switch (educationLevel) {
      case "Universitaire":
        setAcademicYearOptions(["1", "2", "3", "4", "5", "6", "7"]);
        break;
      case "Secondaire":
        setAcademicYearOptions(["1", "2", "3"]);
        break;
      case "Moyen":
        setAcademicYearOptions(["1", "2", "3", "4"]);
        break;
      case "Primaire":
        setAcademicYearOptions(["1", "2", "3", "4", "5", "6"]);
        break;
      default:
        setAcademicYearOptions([]);
        break;
    }
  };

  const handleDiplomaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const diploma = e.target.value;
    setFormData((prevData) => ({ ...prevData, diploma, specialization: "" }));

    switch (diploma) {
      case "Diplôme universitaire":
        setSpecializationOptions(educationalFields.university);
        break;
      case "Diplôme technique":
        setSpecializationOptions(educationalFields.technical);
        break;
      case "Diplôme professionnel":
        setSpecializationOptions(educationalFields.vocational);
        break;
      default:
        setSpecializationOptions([]);
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 5) {
      toast.error('Maximum 5 images authorized');
      return;
    }

    setNewImages(prev => [...prev, ...files]);
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('First name and last name are required');
      return false;
    }
    if (!formData.birthDate) {
      toast.error('Birth date is required');
      return false;
    }
    if (!formData.phone) {
      toast.error('Phone number is required');
      return false;
    }
    if (!formData.state || !formData.municipality) {
      toast.error('Wilaya and municipality are required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== 'images') {
          const value = formData[key as keyof FormData];
          if (value !== undefined && value !== null) {
            if (value instanceof Date) {
              formDataToSend.append(key, value.toISOString());
            } else {
              formDataToSend.append(key, String(value));
            }
          }
        }
      });

      newImages.forEach((file, index) => {
        formDataToSend.append(`images[${index}]`, file);
      });

      const response = await fetch("/api/request-job", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        toast.success('Application submitted successfully!');
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          birthDate: null,
          state: "",
          municipality: "",
          phone: "",
          educationLevel: "",
          academicYears: "",
          diploma: "No diploma",
          diplomaName: "",
          specialization: "",
          aboutMe: "",
          hasExperience: false,
          experienceDuration: "",
          previousPosition: "",
          images: [],
        });
        setNewImages([]);
        setPreviewUrls([]);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error submitting application');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-2 md:p-4 ">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Job Application</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <BsPersonFill className="inline-block mr-2 text-gray-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Birth Date</label>
                  <DatePicker
                    selected={formData.birthDate}
                    onChange={(date: Date | null) => setFormData(prev => ({ ...prev, birthDate: date || new Date() }))}
                    dateFormat="dd/MM/yyyy"
                    locale={fr}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    maxDate={new Date()}
                    minDate={new Date(1954, 0, 1)}
                    placeholderText="Select your birth date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <HiLocationMarker className="inline-block mr-2 text-gray-600" />
                Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Wilaya</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Choose the wilaya</option>
                    {states.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Commune</label>
                  <input
                    type="text"
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleChange}
                    placeholder="Enter your municipality"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Education Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <FaGraduationCap className="inline-block mr-2 text-gray-600" />
                Education
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Education Level</label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleEducationLevelChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Choose education level</option>
                    <option value="Universitaire">University</option>
                    <option value="Secondaire">Secondary</option>
                    <option value="Moyen">Middle School</option>
                    <option value="Primaire">Primary</option>
                  </select>
                </div>
                {academicYearOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Year</label>
                    <select
                      name="academicYears"
                      value={formData.academicYears}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select a year</option>
                      {academicYearOptions.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Diploma Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <BsFileEarmarkText className="inline-block mr-2 text-gray-600" />
                Diploma
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Diploma</label>
                      <select
                        name="diploma"
                        value={formData.diploma}
                        onChange={handleDiplomaChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="No diploma">No diploma</option>
                        <option value="University degree">University degree</option>
                        <option value="Technical diploma">Technical diploma</option>
                        <option value="Professional diploma">Professional diploma</option>
                      </select>
                    </div>

                    {specializationOptions.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Specialization</label>
                        <select
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Choose specialization</option>
                          {specializationOptions.map((specialization, index) => (
                            <option key={index} value={specialization}>
                              {specialization}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Diploma Name */}
                  {formData.diploma !== "No diploma" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-1">Diploma Name</label>
                      <input
                        type="text"
                        name="diplomaName"
                        value={formData.diplomaName}
                        onChange={handleChange}
                        placeholder="Enter diploma name"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Experience Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <MdWork className="inline-block mr-2 text-gray-600" />
                Professional Experience
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasExperience"
                    checked={formData.hasExperience}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    I have professional experience
                  </label>
                </div>

                {formData.hasExperience && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">Experience Duration</label>
                      <input
                        type="text"
                        name="experienceDuration"
                        value={formData.experienceDuration}
                        onChange={handleChange}
                        placeholder="Ex: 2 years"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Previous Position</label>
                      <input
                        type="text"
                        name="previousPosition"
                        value={formData.previousPosition}
                        onChange={handleChange}
                        placeholder="Ex: Web Developer"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About Me Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <FiEdit className="inline-block mr-2 text-gray-600" />
                About Me
              </h2>
              <textarea
                name="aboutMe"
                value={formData.aboutMe}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className="w-full h-32 p-2 border border-gray-300 rounded-md resize-none"
              />
            </div>

            {/* Images Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <BiImageAdd className="inline-block mr-2 text-gray-600" />
                Images and Documents
              </h2>
              <div className="mt-2">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {/* Preview Images */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square relative rounded-lg overflow-hidden">
                          <Image
                            src={url}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 text-white font-medium rounded-lg transition ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

//find_job\src\app\(web)\profile\request-job\EditMyRequestJob\page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import states from "@/lib/states";
import educationalFields from "@/lib/educationalFields";
import { toast } from 'react-hot-toast';
import DatePicker from "react-datepicker";
import { fr } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

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
  images: never[];
}

export default function EditMyRequestJob() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    birthDate: null,
    state: "",
    municipality: "",
    phone: "",
    educationLevel: "",
    academicYears: "",
    diploma: "Sans diplôme",
    diplomaName: "",
    specialization: "",
    aboutMe: "",
    hasExperience: false,
    experienceDuration: "",
    previousPosition: "",
    images: [],
  });
  const searchParams = useSearchParams();
  const id = searchParams.get('id');  
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchJobRequest = async () => {
      try {
        const response = await fetch(`/api/request-job/edit?id=${id}`);
        if (!response.ok) throw new Error("Failed to fetch job request");
        
        const data = await response.json();
        
        const formattedData = {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
        };
        
        setFormData(formattedData);
        setExistingImages(data.images || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Fetch error:", err.message);
        } else {
          console.error("An unknown error occurred");
        }
      }
    };

    if (id) fetchJobRequest();
  }, [id]);

  const [specializationOptions, setSpecializationOptions] = useState<string[]>([]);
  const [academicYearOptions, setAcademicYearOptions] = useState<string[]>([]);

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
        setSpecializationOptions(educationalFields.vocational as string[]);
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

  const handleDeleteImage = () => {
    setFormData((prevData) => ({
      ...prevData,
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    setNewImages(prev => [...prev, ...files]);
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]); 
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();

      // Add form data
      Object.keys(formData).forEach(key => {
        if (key !== 'images' && key in formData) {
          const value = formData[key as keyof typeof formData];
          if (typeof value === 'string') {
            formDataToSend.append(key, value);
          } else if (typeof value === 'boolean') {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      formDataToSend.append('existingImages', JSON.stringify(existingImages));

      newImages.forEach((file, index) => {
        formDataToSend.append(`images[${index}]`, file);
      });

      const response = await fetch(`/api/request-job/edit?id=${id}`, {
        method: 'PATCH',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Échec de la mise à jour de la demande');
      }
      
      // Show success toast
      toast.success('Demande mise à jour avec succès!', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });

      // Optional: Redirect or refresh data
      // router.push('/profile');
      
    } catch (error) {
      console.error('Error updating job request:', error);
      toast.error('Erreur lors de la mise à jour de la demande', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier ma demande d'emploi</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <span className="mr-2">👤</span>
                Informations personnelles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                  <DatePicker
                    selected={formData.birthDate}
                    onChange={(date: Date | null) => setFormData(prev => ({ 
                      ...prev, 
                      birthDate: date 
                    }))}
                    dateFormat="dd/MM/yyyy"
                    locale={fr}
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    maxDate={new Date()}
                    minDate={new Date(1954, 0, 1)}
                    placeholderText="Sélectionnez votre date de naissance"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Votre numéro"
                  />
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <span className="mr-2">📍</span>
                Localisation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wilaya</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Sélectionnez une wilaya</option>
                    {states.map((state, index) => (
                      <option key={index} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Commune</label>
                  <input
                    type="text"
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Votre commune"
                  />
                </div>
              </div>
            </div>

            {/* Education Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <span className="mr-2">🎓</span>
                Formation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d'études</label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleEducationLevelChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="">Sélectionnez un niveau</option>
                    <option value="Universitaire">Universitaire</option>
                    <option value="Secondaire">Secondaire</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Primaire">Primaire</option>
                  </select>
                </div>
                {academicYearOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Année</label>
                    <select
                      name="academicYears"
                      value={formData.academicYears}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                      <option value="">Sélectionnez une année</option>
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
                <span className="mr-2">📜</span>
                Diplôme
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diplôme
                      </label>
                      <select
                        name="diploma"
                        value={formData.diploma}
                        onChange={handleDiplomaChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      >
                        <option value="Sans diplôme">Sans diplôme</option>
                        <option value="Diplôme universitaire">Diplôme universitaire</option>
                        <option value="Diplôme technique">Diplôme technique</option>
                        <option value="Diplôme professionnel">Diplôme professionnel</option>
                      </select>
                    </div>

                    {specializationOptions.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Spécialisation
                        </label>
                        <select
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                          <option value="">Sélectionnez une spécialisation</option>
                          {specializationOptions.map((spec, index) => (
                            <option key={index} value={spec}>{spec}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Nom du diplôme */}
                  {formData.diploma !== "Sans diplôme" && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom du diplôme
                      </label>
                      <input
                        type="text"
                        name="diplomaName"
                        value={formData.diplomaName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Nom de votre diplôme"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Experience Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <span className="mr-2">💼</span>
                Expérience professionnelle
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
                    J'ai une expérience professionnelle
                  </label>
                </div>

                {formData.hasExperience && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée d'expérience
                      </label>
                      <input
                        type="text"
                        name="experienceDuration"
                        value={formData.experienceDuration}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Ex: 2 ans"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poste précédent
                      </label>
                      <input
                        type="text"
                        name="previousPosition"
                        value={formData.previousPosition}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Ex: Développeur Web"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About Me Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <span className="mr-2">✍️</span>
                À propos de moi
              </h2>
              <textarea
                name="aboutMe"
                value={formData.aboutMe}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition h-32"
                placeholder="Parlez-nous de vous..."
              />
            </div>

            {/* Images Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                <span className="mr-2">📸</span>
                Images et documents
              </h2>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Images existantes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square relative rounded-lg overflow-hidden">
                          <Image
                            src={imageUrl}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Upload */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Ajouter de nouvelles images</h3>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Cliquez pour télécharger</span> ou glissez-déposez
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF jusqu'à 10MB</p>
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

                {/* Preview New Images */}
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
                          onClick={() => removeNewImage(index)}
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
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

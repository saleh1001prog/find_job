"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBuilding, FiMapPin, FiUsers, FiImage, FiCheck, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { 
  EnhancedFormField, 
  FormProgress, 
  AnimatedButton, 
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  useNotifications,
  NotificationContainer,
  validationRules
} from '@/components/ui';

interface CompanyData {
  basicInfo: {
    companyName: string;
    industry: string;
    companySize: string;
    foundedYear: string;
    website: string;
    phone: string;
    email: string;
  };
  location: {
    state: string;
    municipality: string;
    address: string;
    postalCode: string;
  };
  description: {
    about: string;
    mission: string;
    vision: string;
    values: string[];
  };
  media: {
    logo: File | null;
    coverImage: File | null;
    gallery: File[];
  };
}

const CompanySetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyData, setCompanyData] = useState<CompanyData>({
    basicInfo: {
      companyName: '',
      industry: '',
      companySize: '',
      foundedYear: '',
      website: '',
      phone: '',
      email: ''
    },
    location: {
      state: '',
      municipality: '',
      address: '',
      postalCode: ''
    },
    description: {
      about: '',
      mission: '',
      vision: '',
      values: []
    },
    media: {
      logo: null,
      coverImage: null,
      gallery: []
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { success, error, notifications } = useNotifications();

  const steps = [
    'المعلومات الأساسية',
    'الموقع والعنوان',
    'وصف الشركة',
    'الصور والشعار',
    'المراجعة والإنهاء'
  ];

  const industries = [
    'التكنولوجيا والبرمجيات',
    'الصحة والطب',
    'التعليم والتدريب',
    'المالية والمصرفية',
    'التجارة والمبيعات',
    'الصناعة والتصنيع',
    'السياحة والضيافة',
    'النقل واللوجستيات',
    'الإعلام والاتصالات',
    'الطاقة والبيئة'
  ];

  const companySizes = [
    '1-10 موظفين',
    '11-50 موظف',
    '51-200 موظف',
    '201-500 موظف',
    '501-1000 موظف',
    '1000+ موظف'
  ];

  const algerianStates = [
    'الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'باتنة', 'بليدة', 'سطيف', 'سيدي بلعباس',
    'بسكرة', 'تلمسان', 'بجاية', 'تيزي وزو', 'الشلف', 'جيجل', 'مستغانم', 'المدية'
  ];

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('companySetupData', JSON.stringify(companyData));
    }, 1000);

    return () => clearTimeout(timer);
  }, [companyData]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('companySetupData');
    if (savedData) {
      setCompanyData(JSON.parse(savedData));
    }
  }, []);

  const updateCompanyData = (section: keyof CompanyData, field: string, value: any) => {
    setCompanyData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Basic Info
        if (!companyData.basicInfo.companyName) newErrors.companyName = 'اسم الشركة مطلوب';
        if (!companyData.basicInfo.industry) newErrors.industry = 'القطاع مطلوب';
        if (!companyData.basicInfo.companySize) newErrors.companySize = 'حجم الشركة مطلوب';
        if (!companyData.basicInfo.email) newErrors.email = 'البريد الإلكتروني مطلوب';
        else if (validationRules.email(companyData.basicInfo.email)) newErrors.email = validationRules.email(companyData.basicInfo.email)!;
        break;
      
      case 1: // Location
        if (!companyData.location.state) newErrors.state = 'الولاية مطلوبة';
        if (!companyData.location.municipality) newErrors.municipality = 'البلدية مطلوبة';
        if (!companyData.location.address) newErrors.address = 'العنوان مطلوب';
        break;
      
      case 2: // Description
        if (!companyData.description.about) newErrors.about = 'وصف الشركة مطلوب';
        if (companyData.description.about.length < 50) newErrors.about = 'يجب أن يكون الوصف 50 حرف على الأقل';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      success('تم حفظ البيانات', 'يمكنك المتابعة للخطوة التالية');
    } else {
      error('يرجى تصحيح الأخطاء', 'تحقق من البيانات المطلوبة');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      success(
        'تم إنشاء ملف الشركة بنجاح!',
        'يمكنك الآن البدء في نشر عروض العمل',
        {
          action: {
            label: 'انتقل لنشر وظيفة',
            onClick: () => window.location.href = '/profile/job-offers'
          }
        }
      );
      
      // Clear saved data
      localStorage.removeItem('companySetupData');
    } catch (err) {
      error('فشل في حفظ البيانات', 'يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep />;
      case 1:
        return <LocationStep />;
      case 2:
        return <DescriptionStep />;
      case 3:
        return <MediaStep />;
      case 4:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  const BasicInfoStep = () => (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBuilding className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">المعلومات الأساسية</h2>
          <p className="text-gray-600">أدخل المعلومات الأساسية عن شركتك</p>
        </div>
      </StaggerItem>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StaggerItem>
          <EnhancedFormField
            label="اسم الشركة"
            name="companyName"
            value={companyData.basicInfo.companyName}
            onChange={(value) => updateCompanyData('basicInfo', 'companyName', value)}
            error={errors.companyName}
            required
            autoSave
            icon={<FiBuilding />}
          />
        </StaggerItem>

        <StaggerItem>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              القطاع <span className="text-red-500">*</span>
            </label>
            <select
              value={companyData.basicInfo.industry}
              onChange={(e) => updateCompanyData('basicInfo', 'industry', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">اختر القطاع</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
            {errors.industry && (
              <p className="text-red-600 text-sm">{errors.industry}</p>
            )}
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              حجم الشركة <span className="text-red-500">*</span>
            </label>
            <select
              value={companyData.basicInfo.companySize}
              onChange={(e) => updateCompanyData('basicInfo', 'companySize', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">اختر حجم الشركة</option>
              {companySizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            {errors.companySize && (
              <p className="text-red-600 text-sm">{errors.companySize}</p>
            )}
          </div>
        </StaggerItem>

        <StaggerItem>
          <EnhancedFormField
            label="سنة التأسيس"
            name="foundedYear"
            type="number"
            value={companyData.basicInfo.foundedYear}
            onChange={(value) => updateCompanyData('basicInfo', 'foundedYear', value)}
            placeholder="2020"
          />
        </StaggerItem>

        <StaggerItem>
          <EnhancedFormField
            label="الموقع الإلكتروني"
            name="website"
            type="url"
            value={companyData.basicInfo.website}
            onChange={(value) => updateCompanyData('basicInfo', 'website', value)}
            placeholder="https://company.com"
          />
        </StaggerItem>

        <StaggerItem>
          <EnhancedFormField
            label="رقم الهاتف"
            name="phone"
            type="tel"
            value={companyData.basicInfo.phone}
            onChange={(value) => updateCompanyData('basicInfo', 'phone', value)}
            placeholder="+213 XXX XXX XXX"
            validation={validationRules.phone}
          />
        </StaggerItem>

        <StaggerItem className="md:col-span-2">
          <EnhancedFormField
            label="البريد الإلكتروني للشركة"
            name="email"
            type="email"
            value={companyData.basicInfo.email}
            onChange={(value) => updateCompanyData('basicInfo', 'email', value)}
            error={errors.email}
            validation={validationRules.email}
            required
            autoSave
          />
        </StaggerItem>
      </div>
    </StaggerContainer>
  );

  const LocationStep = () => (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiMapPin className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الموقع والعنوان</h2>
          <p className="text-gray-600">حدد موقع شركتك بدقة</p>
        </div>
      </StaggerItem>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StaggerItem>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              الولاية <span className="text-red-500">*</span>
            </label>
            <select
              value={companyData.location.state}
              onChange={(e) => updateCompanyData('location', 'state', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">اختر الولاية</option>
              {algerianStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-600 text-sm">{errors.state}</p>
            )}
          </div>
        </StaggerItem>

        <StaggerItem>
          <EnhancedFormField
            label="البلدية"
            name="municipality"
            value={companyData.location.municipality}
            onChange={(value) => updateCompanyData('location', 'municipality', value)}
            error={errors.municipality}
            required
            autoSave
          />
        </StaggerItem>

        <StaggerItem className="md:col-span-2">
          <EnhancedFormField
            label="العنوان التفصيلي"
            name="address"
            value={companyData.location.address}
            onChange={(value) => updateCompanyData('location', 'address', value)}
            error={errors.address}
            placeholder="الشارع، الحي، رقم المبنى..."
            required
            autoSave
          />
        </StaggerItem>

        <StaggerItem>
          <EnhancedFormField
            label="الرمز البريدي"
            name="postalCode"
            value={companyData.location.postalCode}
            onChange={(value) => updateCompanyData('location', 'postalCode', value)}
            placeholder="16000"
          />
        </StaggerItem>
      </div>
    </StaggerContainer>
  );

  const DescriptionStep = () => (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">وصف الشركة</h2>
          <p className="text-gray-600">اكتب وصفاً جذاباً عن شركتك</p>
        </div>
      </StaggerItem>

      <div className="space-y-6">
        <StaggerItem>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              نبذة عن الشركة <span className="text-red-500">*</span>
            </label>
            <textarea
              value={companyData.description.about}
              onChange={(e) => updateCompanyData('description', 'about', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="اكتب وصفاً شاملاً عن شركتك، أنشطتها، وما يميزها..."
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{companyData.description.about.length}/500 حرف</span>
              {errors.about && <span className="text-red-600">{errors.about}</span>}
            </div>
          </div>
        </StaggerItem>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StaggerItem>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">رسالة الشركة</label>
              <textarea
                value={companyData.description.mission}
                onChange={(e) => updateCompanyData('description', 'mission', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ما هي رسالة شركتك؟"
              />
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">رؤية الشركة</label>
              <textarea
                value={companyData.description.vision}
                onChange={(e) => updateCompanyData('description', 'vision', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ما هي رؤية شركتك للمستقبل؟"
              />
            </div>
          </StaggerItem>
        </div>
      </div>
    </StaggerContainer>
  );

  const MediaStep = () => (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiImage className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الصور والشعار</h2>
          <p className="text-gray-600">أضف شعار الشركة والصور التعريفية</p>
        </div>
      </StaggerItem>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StaggerItem>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">شعار الشركة</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">اسحب الشعار هنا أو انقر للاختيار</p>
              <AnimatedButton variant="secondary" size="sm">
                اختيار الشعار
              </AnimatedButton>
            </div>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">صورة الغلاف</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">اسحب صورة الغلاف هنا أو انقر للاختيار</p>
              <AnimatedButton variant="secondary" size="sm">
                اختيار صورة الغلاف
              </AnimatedButton>
            </div>
          </div>
        </StaggerItem>
      </div>
    </StaggerContainer>
  );

  const ReviewStep = () => (
    <StaggerContainer className="space-y-6">
      <StaggerItem>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">مراجعة البيانات</h2>
          <p className="text-gray-600">تأكد من صحة جميع البيانات قبل الحفظ</p>
        </div>
      </StaggerItem>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">ملخص بيانات الشركة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">اسم الشركة:</span> {companyData.basicInfo.companyName}
          </div>
          <div>
            <span className="font-medium">القطاع:</span> {companyData.basicInfo.industry}
          </div>
          <div>
            <span className="font-medium">الموقع:</span> {companyData.location.state}, {companyData.location.municipality}
          </div>
          <div>
            <span className="font-medium">حجم الشركة:</span> {companyData.basicInfo.companySize}
          </div>
        </div>
      </div>
    </StaggerContainer>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Progress Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <FormProgress
                steps={steps}
                currentStep={currentStep}
                className="text-white"
              />
            </div>

            {/* Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="bg-gray-50 px-8 py-6 flex justify-between">
              <AnimatedButton
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <FiArrowLeft className="w-4 h-4" />
                السابق
              </AnimatedButton>

              {currentStep < steps.length - 1 ? (
                <AnimatedButton
                  variant="primary"
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  التالي
                  <FiArrowRight className="w-4 h-4" />
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  variant="primary"
                  onClick={handleSubmit}
                  loading={isLoading}
                  className="flex items-center gap-2"
                >
                  <FiCheck className="w-4 h-4" />
                  إنهاء الإعداد
                </AnimatedButton>
              )}
            </div>
          </div>
        </ScrollReveal>

        <NotificationContainer notifications={notifications} />
      </div>
    </div>
  );
};

export default CompanySetupWizard;

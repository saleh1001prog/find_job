# نظام الفلترة المحسن لعروض العمل 🔍

## نظرة عامة

تم تطوير نظام فلترة ديناميكي ومتطور لصفحة عروض العمل (`/users/offers`) يعتمد على البيانات الفعلية من قاعدة البيانات بدلاً من القيم الثابتة.

## الميزات الجديدة ✨

### 1. فلترة ديناميكية
- **استخراج تلقائي للفلاتر**: من البيانات الموجودة في قاعدة البيانات
- **تحديث فوري**: عند إضافة عروض جديدة
- **فلترة ذكية**: تعتمد على محتوى العروض الفعلي

### 2. أنواع الفلاتر المدعومة

#### 🌍 الولايات (States)
- استخراج تلقائي من `companyLocation.state`
- ترتيب أبجدي
- عدد العروض لكل ولاية

#### 💼 مستوى الخبرة (Experience Levels)
- استخراج من `positions.requiredExperience`
- تنسيق ذكي للعرض (سنة/سنوات)
- فلترة حسب المستوى المطلوب

#### 📋 نوع العقد (Contract Types)
- استخراج من `positions.contractType`
- دعم أنواع العقود المختلفة
- فلترة حسب نوع التوظيف

#### 🏢 القطاعات (Sectors)
- استخراج ذكي من عناوين الوظائف
- تصنيف تلقائي للقطاعات
- 10 قطاعات رئيسية مدعومة

### 3. واجهة مستخدم محسنة

#### عرض الفلاتر النشطة
- **بطاقات ملونة**: لكل فلتر نشط
- **إزالة سريعة**: بنقرة واحدة
- **مسح شامل**: لجميع الفلاتر

#### إحصائيات البحث
- **عدد النتائج**: إجمالي العروض المطابقة
- **نطاق العرض**: من X إلى Y من إجمالي Z
- **رقم الصفحة**: الحالية من الإجمالي

#### أوضاع العرض
- **عرض شبكي**: للتصفح السريع
- **عرض قائمة**: للتفاصيل الأكثر

## البنية التقنية 🏗️

### 1. API Endpoints

#### `/api/users/offers` (محسن)
```typescript
GET /api/users/offers?page=1&limit=12&search=developer&state=Alger&experience=2&contractType=CDI&sector=Informatique
```

**المعاملات المدعومة:**
- `page`: رقم الصفحة
- `limit`: عدد النتائج لكل صفحة
- `search`: البحث في اسم الشركة وعناوين الوظائف
- `state`: فلترة حسب الولاية
- `experience`: فلترة حسب مستوى الخبرة
- `contractType`: فلترة حسب نوع العقد
- `sector`: فلترة حسب القطاع

**الاستجابة:**
```json
{
  "offers": [...],
  "filters": {
    "states": ["Alger", "Batna", "Constantine", ...],
    "experienceLevels": ["0", "1", "2", "3", "5", ...],
    "contractTypes": ["CDI", "CDD", "Stage", ...],
    "sectors": ["Informatique", "Finance", "Marketing", ...]
  },
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 12,
    "pages": 13
  }
}
```

#### `/api/users/offers/filters` (جديد)
```typescript
GET /api/users/offers/filters
```

**الغرض**: الحصول على إحصائيات مفصلة للفلاتر
**الاستجابة:**
```json
{
  "filters": {
    "states": [
      { "value": "Alger", "count": 45 },
      { "value": "Batna", "count": 12 },
      ...
    ],
    "experienceLevels": [
      { "value": "0", "count": 23 },
      { "value": "2", "count": 34 },
      ...
    ],
    "contractTypes": [...],
    "sectors": [...]
  },
  "summary": {
    "totalOffers": 150,
    "totalStates": 48,
    "totalExperienceLevels": 8,
    "totalContractTypes": 4,
    "totalSectors": 10
  }
}
```

### 2. مكونات React الجديدة

#### `ActiveFilters` Component
```typescript
<ActiveFilters
  searchTerm={searchTerm}
  selectedState={selectedState}
  selectedExperience={selectedExperience}
  selectedContractType={selectedContractType}
  selectedSector={selectedSector}
  onClearSearch={() => setSearchTerm('')}
  onClearState={() => setSelectedState('')}
  onClearExperience={() => setSelectedExperience('')}
  onClearContractType={() => setSelectedContractType('')}
  onClearSector={() => setSelectedSector('')}
  onClearAll={clearAllFilters}
  formatExperience={formatExperience}
/>
```

#### `SearchResultsHeader` Component
```typescript
<SearchResultsHeader
  totalResults={pagination.total}
  currentPage={currentPage}
  totalPages={pagination.pages}
  viewMode={viewMode}
  showFilters={showFilters}
  onViewModeChange={setViewMode}
  onToggleFilters={() => setShowFilters(!showFilters)}
  searchTerm={searchTerm}
  hasActiveFilters={hasActiveFilters}
/>
```

### 3. Custom Hook

#### `useJobFilters` Hook
```typescript
const {
  // State
  searchTerm,
  selectedState,
  selectedExperience,
  selectedContractType,
  selectedSector,
  currentPage,
  viewMode,
  showFilters,
  
  // Actions
  setSearchTerm,
  setSelectedState,
  setSelectedExperience,
  setSelectedContractType,
  setSelectedSector,
  setCurrentPage,
  setViewMode,
  setShowFilters,
  clearAllFilters,
  
  // Computed
  hasActiveFilters,
  getQueryParams
} = useJobFilters();
```

**الميزات:**
- **مزامنة URL**: حفظ حالة الفلاتر في URL
- **تاريخ التصفح**: دعم الرجوع والتقدم
- **مشاركة الروابط**: إمكانية مشاركة البحث مع الفلاتر

## خوارزمية استخراج القطاعات 🤖

### الكلمات المفتاحية للقطاعات

```typescript
const sectorKeywords = {
  'Informatique': ['développeur', 'developer', 'programmeur', 'informatique', 'it', 'tech', 'software', 'web', 'mobile', 'data', 'système', 'réseau'],
  'Finance': ['comptable', 'finance', 'banque', 'audit', 'comptabilité', 'économie', 'gestion'],
  'Marketing': ['marketing', 'communication', 'publicité', 'commercial', 'vente', 'digital'],
  'Santé': ['médecin', 'infirmier', 'pharmacien', 'santé', 'médical', 'dentiste'],
  'Éducation': ['professeur', 'enseignant', 'éducation', 'formation', 'école', 'université'],
  'Ingénierie': ['ingénieur', 'technique', 'mécanique', 'électrique', 'civil', 'industriel'],
  'Ressources Humaines': ['rh', 'ressources humaines', 'recrutement', 'hr'],
  'Juridique': ['avocat', 'juridique', 'droit', 'legal'],
  'Design': ['designer', 'graphique', 'ui', 'ux', 'créatif', 'design'],
  'Logistique': ['logistique', 'transport', 'supply chain', 'chaîne d\'approvisionnement']
};
```

### آلية العمل
1. **استخراج العناوين**: من جميع الوظائف في قاعدة البيانات
2. **تحليل النص**: البحث عن الكلمات المفتاحية
3. **تصنيف تلقائي**: ربط العناوين بالقطاعات
4. **إزالة التكرار**: قائمة فريدة من القطاعات

## تحسينات الأداء ⚡

### 1. تحسين قاعدة البيانات
- **فهرسة الحقول**: للبحث السريع
- **Aggregation Pipeline**: لاستعلامات معقدة
- **Caching**: للفلاتر المستخدمة بكثرة

### 2. تحسين الواجهة
- **Debouncing**: للبحث النصي (500ms)
- **Lazy Loading**: للصور
- **Virtual Scrolling**: للقوائم الطويلة

### 3. إدارة الحالة
- **URL State**: مزامنة مع المتصفح
- **Local Storage**: حفظ التفضيلات
- **Error Boundaries**: معالجة الأخطاء

## الاستخدام العملي 📖

### 1. البحث الأساسي
```
/users/offers?search=developer
```

### 2. فلترة متقدمة
```
/users/offers?search=developer&state=Alger&experience=2&sector=Informatique
```

### 3. تغيير العرض
```
/users/offers?view=list&showFilters=true
```

### 4. التنقل بين الصفحات
```
/users/offers?page=2&search=developer&state=Alger
```

## المزايا الجديدة 🎯

### 1. للمستخدمين
- **بحث أكثر دقة**: نتائج مطابقة للمعايير
- **واجهة بديهية**: سهولة في الاستخدام
- **حفظ البحث**: إمكانية مشاركة الروابط
- **تجربة سلسة**: تحديث فوري للنتائج

### 2. للمطورين
- **كود منظم**: مكونات قابلة لإعادة الاستخدام
- **سهولة الصيانة**: بنية واضحة ومفهومة
- **قابلية التوسع**: إضافة فلاتر جديدة بسهولة
- **اختبار سهل**: مكونات منفصلة ومستقلة

### 3. للأداء
- **استعلامات محسنة**: أسرع في قاعدة البيانات
- **تحميل ذكي**: فقط البيانات المطلوبة
- **ذاكرة تخزين**: للنتائج المتكررة
- **تحديث تدريجي**: بدون إعادة تحميل الصفحة

## الخطوات التالية 🚀

### 1. تحسينات مستقبلية
- **فلاتر إضافية**: الراتب، تاريخ النشر، حجم الشركة
- **بحث جغرافي**: حسب المسافة من موقع المستخدم
- **ترشيحات ذكية**: حسب ملف المستخدم
- **إشعارات**: للعروض الجديدة المطابقة للفلاتر

### 2. تحليلات
- **إحصائيات الاستخدام**: أكثر الفلاتر استخداماً
- **تحسين النتائج**: حسب سلوك المستخدمين
- **A/B Testing**: لواجهات مختلفة

### 3. تكامل
- **API خارجية**: لبيانات إضافية
- **تصدير النتائج**: PDF, Excel
- **مشاركة اجتماعية**: للعروض المثيرة للاهتمام

## الخلاصة ✅

تم تطوير نظام فلترة شامل ومتطور يحسن بشكل كبير من تجربة البحث عن الوظائف. النظام الجديد:

- **ديناميكي**: يتكيف مع البيانات الفعلية
- **سريع**: استعلامات محسنة وواجهة متجاوبة
- **سهل الاستخدام**: واجهة بديهية ومفهومة
- **قابل للتوسع**: إمكانية إضافة ميزات جديدة
- **موثوق**: معالجة شاملة للأخطاء

النظام جاهز للاستخدام ويوفر تجربة بحث متقدمة ومتطورة للمستخدمين! 🎉

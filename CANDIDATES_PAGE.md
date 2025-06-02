# صفحة المرشحين - Candidates Page 👥

## نظرة عامة

تم إنشاء صفحة المرشحين (`/candidates`) لعرض جميع المرشحين المسجلين في المنصة والذين أكملوا ملفاتهم الشخصية.

## الميزات الرئيسية ✨

### 1. عرض المرشحين
- **قائمة شاملة**: جميع المرشحين من نوع `individual`
- **ملفات مكتملة فقط**: `isProfileComplete: true`
- **ترتيب ذكي**: حسب آخر تحديث ثم تاريخ التسجيل
- **عرض شبكي**: 4 أعمدة على الشاشات الكبيرة، متجاوب للأجهزة الصغيرة

### 2. بحث متقدم
- **بحث في الأسماء**: الاسم الأول واللقب
- **بحث فوري**: تحديث النتائج أثناء الكتابة
- **إعادة تعيين**: مسح البحث بسهولة

### 3. معلومات المرشح
- **الصورة الشخصية**: avatar مع صورة افتراضية
- **الاسم الكامل**: firstName + lastName
- **الموقع**: الولاية والبلدية
- **العمر**: محسوب تلقائياً من تاريخ الميلاد
- **سنوات الخبرة**: محسوبة من الخبرات المسجلة
- **تاريخ التسجيل**: متى انضم للمنصة

### 4. إحصائيات المرشح
- **سنوات الخبرة**: عدد السنوات المحسوبة
- **العمر**: السن الحالي
- **طلبات العمل**: عدد الطلبات المرسلة
- **التطبيقات**: عدد التطبيقات على الوظائف

## البنية التقنية 🏗️

### API Endpoint

#### `/api/candidates`
```typescript
GET /api/candidates?page=1&limit=12&search=ahmed
```

**المعاملات:**
- `page`: رقم الصفحة (افتراضي: 1)
- `limit`: عدد النتائج لكل صفحة (افتراضي: 12)
- `search`: البحث في الأسماء (اختياري)

**الاستجابة:**
```json
{
  "candidates": [
    {
      "_id": "...",
      "firstName": "Ahmed",
      "lastName": "Ben Ali",
      "avatar": "https://...",
      "phone": "0555123456",
      "birthDate": "1990-01-01",
      "location": {
        "state": "Alger",
        "municipality": "Bab Ezzouar"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z",
      "stats": {
        "jobRequestsCount": 5,
        "applicationsCount": 12,
        "experienceYears": 3,
        "age": 34
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 12,
    "pages": 13
  }
}
```

### شروط الفلترة

```typescript
const matchConditions = {
  userType: 'individual',        // مرشحين فقط
  isProfileComplete: true        // ملفات مكتملة فقط
};
```

### حساب الإحصائيات

#### حساب العمر
```typescript
function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}
```

#### حساب سنوات الخبرة
```typescript
function calculateExperienceYears(experience: any[]): number {
  if (!experience || experience.length === 0) return 0;
  
  let totalMonths = 0;
  
  experience.forEach(exp => {
    if (exp.startDate && exp.endDate) {
      const start = new Date(exp.startDate);
      const end = new Date(exp.endDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                    (end.getMonth() - start.getMonth());
      totalMonths += months;
    }
  });
  
  return Math.floor(totalMonths / 12);
}
```

## واجهة المستخدم 🎨

### تصميم البطاقة

```typescript
// بطاقة مرشح
<div className="card-enhanced overflow-hidden group hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
  {/* Header مع خلفية متدرجة */}
  <div className="relative h-32 bg-gradient-to-br from-blue-500 to-indigo-600">
    {/* صورة المرشح */}
    <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-white">
      <Image src={avatar} alt={name} />
    </div>
    {/* اسم المرشح والموقع */}
  </div>
  
  {/* إحصائيات */}
  <div className="grid grid-cols-2 gap-4">
    <div className="text-center p-3 bg-blue-50 rounded-lg">
      <div className="text-lg font-bold text-blue-600">{experienceYears}</div>
      <div className="text-xs text-gray-600">Ans d'expérience</div>
    </div>
    <div className="text-center p-3 bg-green-50 rounded-lg">
      <div className="text-lg font-bold text-green-600">{age}</div>
      <div className="text-xs text-gray-600">Ans</div>
    </div>
  </div>
  
  {/* زر عرض الملف */}
  <Link href={`/users/${_id}/individual`} className="btn-primary">
    Voir profil
  </Link>
</div>
```

### ألوان وتدرجات

- **خلفية الصفحة**: `bg-gradient-to-br from-blue-50 via-white to-indigo-50`
- **خلفية البطاقة**: `bg-gradient-to-br from-blue-500 to-indigo-600`
- **إحصائية الخبرة**: `bg-blue-50 text-blue-600`
- **إحصائية العمر**: `bg-green-50 text-green-600`

### تأثيرات التفاعل

- **Hover على البطاقة**: `hover:shadow-xl hover:-translate-y-2`
- **انتقالات سلسة**: `transition-all duration-300`
- **تكبير الأزرار**: `hover:scale-105`

## التنقل والروابط 🔗

### من Header
```typescript
<Link href="/candidates" className="...">
  <FiUsers className="w-5 h-5" />
  <span>Candidates</span>
</Link>
```

### إلى ملف المرشح
```typescript
<Link href={`/users/${candidate._id}/individual`}>
  Voir profil
</Link>
```

## التقسيم والتنقل 📄

### Pagination
- **12 مرشح لكل صفحة**
- **أزرار التنقل**: السابق/التالي
- **أرقام الصفحات**: قابلة للنقر
- **معلومات الصفحة**: "Page X sur Y"

### عرض النتائج
```typescript
// عدد النتائج
{total.toLocaleString()} candidat{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}

// مع البحث
{total} candidats trouvés pour "{searchTerm}"

// معلومات الصفحة
Page {currentPage} sur {totalPages}
```

## حالات خاصة 🔄

### حالة التحميل
```typescript
<Loading variant="wave" text="جاري تحميل المرشحين..." size="xl" />
```

### حالة عدم وجود نتائج
```typescript
<div className="text-center py-16">
  <FiSearch className="w-12 h-12 text-blue-500" />
  <h3>Aucun candidat trouvé</h3>
  <p>Essayez de modifier vos critères de recherche...</p>
  <button onClick={() => setSearchTerm('')}>
    Réinitialiser la recherche
  </button>
</div>
```

### معالجة الأخطاء
```typescript
try {
  const res = await fetch(`/api/candidates?${queryParams}`);
  if (!res.ok) throw new Error("Failed to fetch candidates");
  // ...
} catch (error) {
  console.error("Error:", error);
  toast.error("خطأ في تحميل المرشحين");
}
```

## التحسينات المستقبلية 🚀

### 1. فلاتر إضافية
- **العمر**: نطاق عمري
- **الخبرة**: سنوات الخبرة
- **الموقع**: حسب الولاية
- **المهارات**: فلترة حسب المهارات
- **التعليم**: مستوى التعليم

### 2. ترتيب متقدم
- **حسب العمر**: الأصغر/الأكبر
- **حسب الخبرة**: الأكثر/الأقل خبرة
- **حسب التسجيل**: الأحدث/الأقدم
- **حسب النشاط**: الأكثر نشاطاً

### 3. عرض محسن
- **عرض قائمة**: بتفاصيل أكثر
- **عرض مضغوط**: المزيد من المرشحين
- **معاينة سريعة**: popup مع تفاصيل إضافية

### 4. تفاعل متقدم
- **حفظ المرشحين**: قائمة مفضلة
- **مقارنة المرشحين**: جنباً إلى جنب
- **تصدير القائمة**: PDF/Excel
- **مشاركة الملفات**: روابط مباشرة

## الاستخدام العملي 📖

### للشركات
1. **تصفح المرشحين**: عرض جميع المتاحين
2. **البحث المستهدف**: حسب الاسم أو المهارات
3. **مراجعة الملفات**: الانتقال للملف الكامل
4. **التواصل المباشر**: عبر معلومات الاتصال

### للمرشحين
1. **رؤية المنافسة**: معرفة المرشحين الآخرين
2. **تحسين الملف**: مقارنة مع الآخرين
3. **التواصل**: مع مرشحين آخرين
4. **الإلهام**: من ملفات متميزة

## الخلاصة ✅

صفحة المرشحين توفر:
- **عرض شامل**: لجميع المرشحين المؤهلين
- **بحث فعال**: للعثور على المواهب المناسبة
- **معلومات مفيدة**: إحصائيات وتفاصيل مهمة
- **تصميم جذاب**: واجهة حديثة ومتجاوبة
- **تنقل سهل**: للملفات الشخصية الكاملة

الصفحة جاهزة للاستخدام وتوفر تجربة ممتازة لاستكشاف المواهب المتاحة! 🎉

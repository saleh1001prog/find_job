# دليل مكونات واجهة المستخدم المحسنة 🎨

## نظرة عامة

تم إنشاء مجموعة شاملة من مكونات واجهة المستخدم المحسنة لتطبيق Find Job، مع التركيز على:
- **الرسوم المتحركة المتقدمة** 🎭
- **التفاعلات الصغيرة** ⚡
- **تحسين الأداء** 🚀
- **إمكانية الوصول** ♿
- **تجربة المستخدم المحسنة** 👥

---

## 1. مكونات الرسوم المتحركة 🎭

### PageTransition
انتقالات سلسة بين الصفحات مع تأثيرات متقدمة.

```typescript
import PageTransition from '@/components/ui/page-transition';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  );
}
```

**الميزات:**
- انتقالات سلسة بين الصفحات
- تأثيرات scale وopacity
- مدة قابلة للتخصيص
- دعم Next.js routing

### StaggerContainer & StaggerItem
تأثيرات متتالية للقوائم والشبكات.

```typescript
import StaggerContainer, { StaggerItem } from '@/components/ui/stagger-container';

function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job, index) => (
        <StaggerItem key={job.id} index={index}>
          <JobCard job={job} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
```

**الميزات:**
- تأثيرات متتالية قابلة للتخصيص
- تأخير قابل للتحكم
- تأثيرات hover وtap
- دعم spring animations

### ScrollReveal
تأثيرات عند التمرير مع اتجاهات متعددة.

```typescript
import ScrollReveal from '@/components/ui/scroll-reveal';

function Section() {
  return (
    <ScrollReveal direction="up" delay={0.2} distance={50}>
      <div className="content">
        <h2>يظهر عند التمرير</h2>
        <p>محتوى يظهر بتأثير جميل</p>
      </div>
    </ScrollReveal>
  );
}
```

**الخصائص:**
- `direction`: 'up' | 'down' | 'left' | 'right'
- `delay`: تأخير بالثواني
- `duration`: مدة الحركة
- `distance`: مسافة الحركة
- `once`: تشغيل مرة واحدة أم متكرر

---

## 2. التفاعلات الصغيرة ⚡

### AnimatedButton
أزرار تفاعلية مع تأثيرات متقدمة.

```typescript
import { AnimatedButton } from '@/components/ui/micro-interactions';

function SubmitForm() {
  const [loading, setLoading] = useState(false);

  return (
    <AnimatedButton
      variant="primary"
      size="lg"
      loading={loading}
      onClick={handleSubmit}
      className="w-full"
    >
      إرسال الطلب
    </AnimatedButton>
  );
}
```

**المتغيرات:**
- `primary`: أزرق مع تدرج
- `secondary`: رمادي فاتح
- `ghost`: شفاف مع نص ملون

**الأحجام:**
- `sm`: صغير
- `md`: متوسط (افتراضي)
- `lg`: كبير

### FloatingActionButton
زر عائم مع موضع قابل للتخصيص.

```typescript
import { FloatingActionButton } from '@/components/ui/micro-interactions';
import { FiPlus } from 'react-icons/fi';

function AddJobButton() {
  return (
    <FloatingActionButton
      position="bottom-right"
      onClick={() => router.push('/profile/job-offers')}
    >
      <FiPlus className="w-6 h-6" />
    </FloatingActionButton>
  );
}
```

### PulseIndicator
مؤشر نبضي للحالات المباشرة.

```typescript
import { PulseIndicator } from '@/components/ui/micro-interactions';

function OnlineStatus({ isOnline }: { isOnline: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <PulseIndicator 
        color={isOnline ? "bg-green-500" : "bg-gray-400"}
        size="sm"
      />
      <span>{isOnline ? 'متصل' : 'غير متصل'}</span>
    </div>
  );
}
```

### AnimatedCounter
عداد متحرك للإحصائيات.

```typescript
import { AnimatedCounter } from '@/components/ui/micro-interactions';

function Statistics() {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <AnimatedCounter 
          from={0} 
          to={1250} 
          duration={2}
          suffix=" وظيفة"
        />
        <p>إجمالي الوظائف</p>
      </div>
    </div>
  );
}
```

---

## 3. نظام الإشعارات المحسن 🔔

### useNotifications Hook
خطاف لإدارة الإشعارات.

```typescript
import { useNotifications } from '@/components/ui/enhanced-notifications';

function JobForm() {
  const { success, error, warning, info } = useNotifications();

  const handleSubmit = async () => {
    try {
      await submitJob();
      success(
        "تم نشر الوظيفة بنجاح!",
        "سيتم مراجعة طلبك خلال 24 ساعة"
      );
    } catch (err) {
      error(
        "فشل في نشر الوظيفة",
        "يرجى المحاولة مرة أخرى",
        {
          action: {
            label: "إعادة المحاولة",
            onClick: handleSubmit
          }
        }
      );
    }
  };
}
```

### NotificationContainer
حاوي عرض الإشعارات.

```typescript
import { NotificationContainer } from '@/components/ui/enhanced-notifications';

function Layout() {
  const { notifications } = useNotifications();

  return (
    <div>
      {/* محتوى التطبيق */}
      <NotificationContainer
        notifications={notifications}
        position="top-right"
      />
    </div>
  );
}
```

### NotificationBadge
شارة الإشعارات مع عداد.

```typescript
import { NotificationBadge } from '@/components/ui/enhanced-notifications';

function Header() {
  const [unreadCount, setUnreadCount] = useState(5);

  return (
    <header>
      <NotificationBadge
        count={unreadCount}
        onClick={() => setShowNotifications(true)}
      />
    </header>
  );
}
```

---

## 4. تحسينات الأداء 🚀

### LazyImage
تحميل ذكي للصور مع تأثيرات.

```typescript
import LazyImage from '@/components/ui/lazy-image';

function JobCard({ job }: { job: Job }) {
  return (
    <div className="job-card">
      <LazyImage
        src={job.companyLogo}
        alt={job.companyName}
        width={300}
        height={200}
        className="rounded-lg"
        placeholder="blur"
        quality={80}
        priority={false}
      />
    </div>
  );
}
```

**الميزات:**
- **Intersection Observer**: تحميل عند الحاجة
- **Skeleton Loading**: حالة تحميل جميلة
- **Error Handling**: معالجة أخطاء التحميل
- **Blur Placeholder**: صورة ضبابية أثناء التحميل
- **Progressive Enhancement**: تحسين تدريجي

---

## 5. النماذج المحسنة 📝

### EnhancedFormField
حقول نماذج متقدمة مع validation.

```typescript
import { EnhancedFormField, validationRules } from '@/components/ui/enhanced-form';

function ProfileForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form>
      <EnhancedFormField
        label="البريد الإلكتروني"
        name="email"
        type="email"
        value={email}
        onChange={setEmail}
        validation={validationRules.email}
        autoSave={true}
        helpText="لن نشارك بريدك مع أحد"
        icon={<FiMail />}
        required
      />

      <EnhancedFormField
        label="كلمة المرور"
        name="password"
        type="password"
        value={password}
        onChange={setPassword}
        validation={validationRules.password}
        helpText="يجب أن تحتوي على 8 أحرف على الأقل"
        required
      />
    </form>
  );
}
```

### FormProgress
مؤشر تقدم النموذج متعدد الخطوات.

```typescript
import { FormProgress } from '@/components/ui/enhanced-form';

function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['المعلومات الأساسية', 'التفاصيل', 'المراجعة'];

  return (
    <div>
      <FormProgress
        steps={steps}
        currentStep={currentStep}
        className="mb-8"
      />
      {/* محتوى الخطوات */}
    </div>
  );
}
```

---

## 6. إمكانية الوصول ♿

### AccessibleButton
زر محسن لإمكانية الوصول.

```typescript
import { AccessibleButton } from '@/components/ui/accessibility-helpers';

function ActionButton() {
  return (
    <AccessibleButton
      variant="primary"
      ariaLabel="حفظ التغييرات في الملف الشخصي"
      loading={isSaving}
      onClick={handleSave}
    >
      حفظ
    </AccessibleButton>
  );
}
```

### FocusTrap
حبس التركيز للنوافذ المنبثقة.

```typescript
import { FocusTrap } from '@/components/ui/accessibility-helpers';

function Modal({ isOpen, children }: { isOpen: boolean, children: React.ReactNode }) {
  return (
    <FocusTrap isActive={isOpen}>
      <div className="modal">
        {children}
      </div>
    </FocusTrap>
  );
}
```

### useScreenReader
خطاف لإعلانات قارئ الشاشة.

```typescript
import { useScreenReader } from '@/components/ui/accessibility-helpers';

function JobSearch() {
  const { announce, AnnouncementRegion } = useScreenReader();

  const handleSearch = async () => {
    const results = await searchJobs();
    announce(`تم العثور على ${results.length} وظيفة`);
  };

  return (
    <div>
      {/* محتوى البحث */}
      <AnnouncementRegion />
    </div>
  );
}
```

---

## أفضل الممارسات 💡

### 1. الأداء
- استخدم `LazyImage` للصور الكبيرة
- طبق `ScrollReveal` بحذر لتجنب الإفراط
- استخدم `useReducedMotion` للمستخدمين الذين يفضلون تقليل الحركة

### 2. إمكانية الوصول
- أضف `aria-label` للأزرار التفاعلية
- استخدم `FocusTrap` في النوافذ المنبثقة
- طبق `KeyboardNavigation` للقوائم

### 3. تجربة المستخدم
- استخدم الإشعارات بحكمة
- طبق التحقق الفوري في النماذج
- أضف حالات تحميل واضحة

### 4. التطوير
- اختبر المكونات على أجهزة مختلفة
- تأكد من دعم الوضع المظلم
- استخدم TypeScript للأمان

---

## الخلاصة ✨

هذه المكونات توفر:
- **تجربة مستخدم محسنة** مع رسوم متحركة سلسة
- **أداء محسن** مع تحميل ذكي
- **إمكانية وصول شاملة** لجميع المستخدمين
- **سهولة الاستخدام** مع APIs بسيطة
- **قابلية التخصيص** العالية

استخدم هذه المكونات لبناء واجهات مستخدم حديثة ومتقدمة! 🚀

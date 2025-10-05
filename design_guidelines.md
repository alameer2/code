# تصميم تطبيق تعديل الفيديوهات والترجمة العربية

## Design Approach: Reference-Based (CapCut + Canva Hybrid)

**Justification:** تطبيق محرر الفيديو يتطلب واجهة احترافية مشابهة لـ CapCut (محرر Timeline) وCanva (سهولة الاستخدام). سنستلهم من:
- CapCut: محرر Timeline الاحترافي، أدوات التحكم الدقيقة
- Canva: البساطة، المكتبات المرئية، التنظيم الواضح
- Adobe Premiere Rush: نظام الطبقات والتأثيرات

## Core Design Principles
1. **محرر-أولاً (Editor-First):** مساحة العمل الرئيسية تستحوذ على 70% من الشاشة
2. **أدوات سياقية:** الأدوات تظهر عند الحاجة فقط
3. **معاينة مباشرة:** تحديثات فورية لكل تغيير
4. **تدفق عربي طبيعي:** RTL كامل مع تصميم يراعي اللغة العربية

## Color Palette

### Dark Mode (Primary)
- **Background Primary:** 220 18% 12% (خلفية رئيسية داكنة)
- **Background Secondary:** 220 16% 16% (لوحات الأدوات)
- **Background Tertiary:** 220 14% 20% (عناصر مرفوعة)
- **Primary Brand:** 220 90% 56% (أزرق احترافي للأكشن الرئيسي)
- **Accent:** 160 84% 39% (أخضر للتأكيدات والنجاح)
- **Text Primary:** 0 0% 98%
- **Text Secondary:** 220 9% 70%
- **Border:** 220 14% 28%

### Light Mode
- **Background Primary:** 0 0% 100%
- **Background Secondary:** 220 20% 97%
- **Background Tertiary:** 220 18% 94%
- **Primary Brand:** 220 90% 50%
- **Text Primary:** 220 18% 12%

## Typography

**Font Families:**
- **Primary (عربي):** 'Cairo', 'Tajawal' من Google Fonts
- **Secondary (إنجليزي):** 'Inter', sans-serif
- **Monospace (أرقام/كود):** 'IBM Plex Mono'

**Hierarchy:**
- Hero/Titles: text-3xl md:text-4xl font-bold
- Section Headers: text-xl md:text-2xl font-semibold
- Tool Labels: text-sm font-medium
- Body Text: text-base
- Captions/Timestamps: text-xs font-mono

## Layout System

**Spacing Primitives:** استخدام وحدات Tailwind: 1, 2, 3, 4, 6, 8, 12, 16, 24
- Micro spacing: p-1, gap-2, m-3
- Component spacing: p-4, gap-6, m-8
- Section spacing: py-12, px-16, gap-24

**Grid Structure:**
```
محرر الفيديو (Editor Layout):
├── Header: h-16 (شريط علوي ثابت)
├── Main Workspace: flex-1 (مساحة العمل)
│   ├── Left Sidebar: w-72 (أدوات ومكتبات)
│   ├── Canvas Area: flex-1 (معاينة الفيديو)
│   └── Right Panel: w-80 (خصائص العنصر المحدد)
└── Timeline Footer: h-64 (محرر Timeline)

لوحة التحكم (Dashboard):
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Max Width: max-w-7xl mx-auto
```

## Component Library

### Navigation & Header
- شريط علوي ثابت مع شعار التطبيق (يسار في RTL)
- قوائم منسدلة: ملف، تحرير، عرض، مساعدة
- أزرق أكشن سريعة: حفظ، تصدير، مشاركة
- مؤشر حالة المشروع (محفوظ/غير محفوظ)

### Editor Canvas
- خلفية داكنة مع شبكة خفيفة اختيارية
- حدود واضحة للفيديو مع نسبة العرض
- أدوات تكبير/تصغير (zoom controls) في الزاوية
- Rulers (مساطر) للقياس الدقيق

### Timeline Panel
- مسارات متعددة: فيديو، صوت، ترجمات، تأثيرات
- نظام ألوان مميز لكل نوع مسار
- مقياس زمني دقيق (بالثواني والإطارات)
- أدوات: قص، تقسيم، حذف، نسخ

### Tool Panels (Left Sidebar)
- أيقونات أدوات كبيرة مع تسميات
- أقسام قابلة للطي: وسائط، نصوص، ترجمات، تأثيرات، موسيقى
- شريط بحث لكل مكتبة
- معاينات مصغرة للعناصر

### Properties Panel (Right)
- عرض ديناميكي حسب العنصر المحدد
- مجموعات قابلة للطي: موضع، حجم، لون، تأثيرات
- Sliders دقيقة مع إدخال رقمي
- معاينة مباشرة للتغييرات

### Buttons & Controls
- Primary: bg-primary مع hover:brightness-110
- Secondary: variant="outline" مع border-primary
- Destructive: bg-red-600 للحذف
- أيقونات من Heroicons
- أحجام: sm للأدوات، md للأكشن، lg للـ CTA

### Cards & Media Items
- بطاقات مشاريع: aspect-video مع صورة معاينة
- hover:scale-105 transition-transform
- overlay gradient للنصوص فوق الصور
- badges للحالة (قيد التحرير، مكتمل، مصدّر)

### Forms & Inputs
- حقول إدخال مع placeholder واضح
- validation states: success (أخضر)، error (أحمر)
- dropdowns واسعة مع بحث
- sliders مع قيم رقمية مرئية

### Modals & Overlays
- تصدير: modal كبير مع خيارات الجودة والصيغة
- رفع الملفات: drag & drop zone
- إعدادات: panel منزلق من اليمين (RTL)
- تحذيرات: alerts في أعلى الشاشة

### Data Displays
- قائمة المشاريع: grid مع sorting وfiltering
- معلومات الملف: جدول مع أيقونات
- إحصائيات: cards مع أرقام بارزة
- Timeline markers: علامات زمنية ملونة

## Images

**Dashboard Hero:**
- صورة خلفية gradient subtle مع overlay
- تصوير workspace إبداعي بألوان العلامة
- موضع: أعلى الصفحة، h-96
- نص فوقها مع backdrop-blur

**Project Thumbnails:**
- معاينة إطار من الفيديو
- placeholder: gradient مع أيقونة فيديو
- aspect-ratio: 16/9

**Empty States:**
- illustrations بسيطة لحالات فارغة
- أيقونات كبيرة مع نص توجيهي

## Animations

**Essential Only:**
- Transitions: duration-200 للـ hover
- Loading: spinner للعمليات الطويلة
- Progress bars: للرفع والتصدير
- NO: تأثيرات scroll، parallax، أو حركات معقدة

## Accessibility & RTL

- جميع النصوص والأدوات بالعربية
- dir="rtl" على كامل التطبيق
- keyboard shortcuts مع دعم عربي
- contrast ratios: AAA للنصوص الأساسية
- focus states واضحة بلون Primary
- screen reader labels لكل أداة

## Special Features UI

**محرر الترجمات:**
- split view: قائمة ترجمات + معاينة
- محرر نصي مع خط عربي واضح
- timeline sync مع الفيديو
- أدوات توقيت بالميلي ثانية

**محرر النصوص:**
- WYSIWYG editor للنصوص
- palettes للخطوط العربية
- أدوات تنسيق: حجم، لون، position
- keyframes للحركة

**مكتبة التأثيرات:**
- grid معاينات متحركة
- categories: انتقالات، فلاتر، تأثيرات
- drag to apply على Timeline
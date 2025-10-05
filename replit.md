# محرر الفيديو العربي - Arabic Video Editor

## نظرة عامة
تطبيق ويب احترافي لتحرير الفيديو مع دعم كامل للغة العربية، مشابه لـ CapCut و Canva. يتضمن التطبيق معالجة الفيديو، دعم الترجمات العربية بتقنية RTL، تصدير بجودات متعددة، ومعالجة الصوت.

## البنية التقنية

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: wouter
- **State Management**: React Query (TanStack Query)
- **Port**: 5000

### Backend
- **API Framework**: FastAPI (Python 3.11)
- **Video Processing**: MoviePy 2.x + FFmpeg
- **Arabic Text**: arabic-reshaper + python-bidi (RTL support)
- **Database**: PostgreSQL (Neon) via Drizzle ORM
- **Port**: 8000 (قيد الإعداد)

## المميزات المنفذة ✅

### 1. معالجة الفيديو الأساسية
- ✅ رفع الفيديوهات وإدارة الملفات
- ✅ قص الفيديو (Trim) - اختيار بداية ونهاية محددة
- ✅ دمج عدة مقاطع فيديو (Merge)
- ✅ تدوير الفيديو (90°, 180°, 270°)
- ✅ تغيير سرعة الفيديو (Speed Up/Slow Down)

### 2. الترجمات العربية
- ✅ دعم كامل للنصوص العربية بتقنية RTL
- ✅ رفع ملفات الترجمات (SRT, VTT)
- ✅ دمج الترجمات مع الفيديو
- ✅ تخصيص حجم، لون، وموقع الترجمات
- ✅ معالجة النصوص المركبة (reshaping + bidi)

### 3. نظام التصدير
- ✅ جودات متعددة: 720p, 1080p, 1440p, 4K
- ✅ صيغ متعددة: MP4, WebM, AVI, MOV
- ✅ تخصيص FPS وbitrate
- ✅ إعدادات مخصصة للأبعاد والجودة

### 4. معالجة الصوت
- ✅ استخراج الصوت من الفيديو
- ✅ إضافة موسيقى خلفية
- ✅ ضبط مستوى الصوت
- ✅ استبدال الصوت
- ✅ إزالة الصوت
- ✅ تأثيرات Fade In/Fade Out

### 5. مكتبة المحتوى والتأثيرات
- ✅ انتقالات احترافية: fade, crossfade, slide, zoom
- ✅ فلاتر متنوعة: brightness, contrast, grayscale, sepia, blur, invert
- ✅ إضافة نصوص على الفيديو
- ✅ إضافة ملصقات وصور

### 6. قاعدة البيانات
- ✅ PostgreSQL متصلة عبر DATABASE_URL
- ✅ جداول: users, projects, files
- ✅ DatabaseStorage يستخدم Drizzle ORM
- ✅ حفظ دائم للمشاريع والملفات

## الملفات الرئيسية

### Backend (FastAPI)
```
backend/
├── main.py                 # نقطة البداية وجميع API endpoints
├── video_processor.py      # معالجة الفيديو (trim, merge, rotate, speed)
├── subtitle_processor.py   # معالجة الترجمات العربية (RTL)
├── export_processor.py     # التصدير بجودات وصيغ متعددة
├── audio_processor.py      # معالجة الصوت والموسيقى
└── content_library.py      # التأثيرات والفلاتر والانتقالات
```

### Frontend (React)
```
client/src/
├── App.tsx                 # تطبيق React الرئيسي
├── pages/
│   ├── Home.tsx           # الصفحة الرئيسية
│   └── Editor.tsx         # محرر الفيديو
├── lib/
│   ├── videoApi.ts        # API wrapper للتواصل مع Backend
│   └── queryClient.ts     # إعداد React Query
└── components/ui/         # مكونات shadcn/ui
```

### Database & Server
```
server/
├── db.ts                  # اتصال PostgreSQL عبر Drizzle
├── storage.ts             # DatabaseStorage + MemStorage
├── routes.ts              # Express API routes
└── index.ts               # Express server (port 5000)

shared/
└── schema.ts              # Drizzle schema (users, projects, files)
```

## API Endpoints

### معالجة الفيديو
- `POST /api/upload` - رفع ملف
- `POST /api/video/trim` - قص الفيديو
- `POST /api/video/merge` - دمج مقاطع
- `POST /api/video/rotate` - تدوير
- `POST /api/video/speed` - تغيير السرعة

### الترجمات
- `POST /api/subtitles/add` - إضافة ترجمات للفيديو
- `POST /api/subtitles/parse` - تحليل ملف ترجمة

### التصدير
- `POST /api/export/video` - تصدير بإعدادات محددة
- `POST /api/export/custom` - تصدير بإعدادات مخصصة
- `GET /api/export/qualities` - قائمة الجودات المتاحة
- `GET /api/export/formats` - قائمة الصيغ المتاحة

### الصوت
- `POST /api/audio/extract` - استخراج الصوت
- `POST /api/audio/background` - إضافة موسيقى خلفية
- `POST /api/audio/volume` - ضبط مستوى الصوت
- `POST /api/audio/replace` - استبدال الصوت
- `POST /api/audio/remove` - إزالة الصوت
- `POST /api/audio/fade` - تأثيرات fade

### التأثيرات والفلاتر
- `POST /api/effects/transition` - انتقالات بين المقاطع
- `POST /api/effects/filter` - تطبيق فلاتر
- `POST /api/effects/text` - إضافة نصوص
- `POST /api/effects/sticker` - إضافة ملصقات
- `GET /api/effects/transitions` - قائمة الانتقالات
- `GET /api/effects/filters` - قائمة الفلاتر

### عام
- `GET /api/health` - التحقق من حالة الـ API
- `GET /api/download/{filename}` - تحميل ملف معالج

## التشغيل

### تشغيل Frontend + Express
```bash
npm run dev
```
يعمل على: http://localhost:5000

### تشغيل FastAPI Backend (يدوي حالياً)
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```
يعمل على: http://localhost:8000

## المكتبات المثبتة

### Python
- fastapi
- uvicorn
- moviepy
- arabic-reshaper
- python-bidi
- aiofiles
- python-multipart
- scipy
- numpy

### Node.js
- react + react-dom
- typescript
- vite
- express
- drizzle-orm + drizzle-kit
- @tanstack/react-query
- wouter
- shadcn/ui components
- tailwindcss

## قاعدة البيانات

### الجداول
```typescript
// users
id: varchar (PK)
username: varchar (unique)
email: varchar (unique)
passwordHash: varchar

// projects
id: varchar (PK)
title: varchar
description: text (nullable)
duration: varchar
status: varchar (draft/processing/completed)
updatedAt: timestamp

// files
id: varchar (PK)
projectId: varchar (FK -> projects)
filename: varchar
filepath: varchar
type: varchar (video/audio/subtitle/image)
size: integer
```

### الاتصال
```typescript
DATABASE_URL من environment variables
استخدام Neon PostgreSQL
Drizzle ORM للاستعلامات
```

## المهام القادمة

### 1. إكمال ربط Backend
- [ ] إنشاء workflow دائم لـ FastAPI
- [ ] تحديث Editor.tsx لاستخدام VideoAPI
- [ ] اختبار كل العمليات end-to-end

### 2. تحسينات UI/UX
- [ ] Timeline متقدم للتحرير
- [ ] معاينة فورية للتعديلات
- [ ] drag & drop للملفات
- [ ] progress bars للعمليات

### 3. مميزات إضافية
- [ ] تسجيل صوتي مباشر
- [ ] تكامل Google Drive
- [ ] مشاركة وتعاون على المشاريع
- [ ] قوالب جاهزة للفيديوهات

## ملاحظات مهمة

### تقنية MoviePy 2.x
- استخدام `from moviepy import VideoFileClip` بدلاً من `moviepy.editor`
- effects API مختلف: `.with_effects([...])` بدلاً من `.fx(...)`
- opacity: `.with_opacity(lambda t: ...)` بدلاً من fadeout/fadein القديم

### دعم العربية
- arabic-reshaper: لإعادة تشكيل الحروف المتصلة
- python-bidi: لترتيب النص من اليمين لليسار
- مهم جداً تطبيقهما معاً للحصول على نص عربي صحيح

### الأداء
- MoviePy يعالج الفيديو بشكل متزامن (قد يستغرق وقت)
- ينصح بإضافة job queue للعمليات الطويلة
- استخدام WebSocket لإشعار المستخدم بتقدم العملية

## آخر تحديث
**التاريخ**: 2025-10-05
**الحالة**: 9 من 11 مهمة منجزة
**الأولوية التالية**: ربط Frontend بـ Backend واختبار شامل

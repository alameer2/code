# دليل الإعداد - Setup Guide

## خطوات استيراد المشروع من GitHub إلى Replit

### الطريقة 1: الاستيراد السريع (Rapid Import)
1. افتح المتصفح وانتقل إلى:
   ```
   https://replit.com/github/<your-username>/<repository-name>
   ```
2. Replit سيقوم بـ:
   - استنساخ المستودع تلقائياً
   - تثبيت التبعيات
   - إعداد بيئة التشغيل

### الطريقة 2: الاستيراد الموجّه (Guided Import)
1. اذهب إلى [replit.com/new](https://replit.com/new)
2. اختر "Import from GitHub"
3. وصّل حسابك في GitHub
4. اختر المستودع
5. اضغط "Import"

## التحقق من التثبيت الصحيح

### 1. فحص الملفات الأساسية
تأكد من وجود:
- ✅ `.replit` - إعدادات المشروع
- ✅ `replit.nix` - تبعيات النظام
- ✅ `package.json` - تبعيات Node.js
- ✅ `README.md` - التوثيق

### 2. فحص التبعيات
افتح Shell في Replit وشغّل:
```bash
npm list
```

### 3. تشغيل التطبيق
- اضغط على زر "Run" أو
- في Shell: `npm run dev`
- التطبيق يجب أن يعمل على المنفذ 5000

## حل المشاكل الشائعة

### المشكلة: التبعيات لم تُثبّت
**الحل:**
```bash
npm install
```

### المشكلة: خطأ في الخطوط العربية
**التأكد من:**
- ملف `client/index.html` يحتوي على روابط خطوط Cairo و Tajawal
- الملف يحتوي على `lang="ar" dir="rtl"`

### المشكلة: الصفحة فارغة أو خطأ 404
**الحل:**
1. تحقق من تشغيل الـ workflow "Start application"
2. افحص Logs للأخطاء
3. تأكد من أن المنفذ 5000 مفتوح

### المشكلة: الوضع الداكن لا يعمل
**الحل:**
- امسح localStorage في المتصفح
- أعد تحميل الصفحة
- جرب التبديل من الزر في الهيدر

## الإعدادات المطلوبة

### المتغيرات البيئية (اختياري حالياً)
لا توجد متغيرات بيئية مطلوبة في المرحلة الحالية.

**للمراحل القادمة ستحتاج:**
```env
# Google Drive API (للمستقبل)
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=

# FFmpeg Settings (للمستقبل)
FFMPEG_PATH=/usr/bin/ffmpeg

# Database (للمستقبل)
DATABASE_URL=
```

## التطوير المستمر

### إضافة ميزات جديدة
1. افتح المشروع في Replit
2. قم بالتعديلات المطلوبة
3. احفظ التغييرات (Ctrl+S / Cmd+S)
4. استخدم Git pane لعمل commit و push

### مزامنة التغييرات من GitHub
```bash
git pull origin main
```

## النشر (Publishing)

### على Replit
1. اضغط على زر "Publish" في الأعلى
2. اختر Domain name
3. التطبيق سيكون متاحاً على `.replit.app`

### على منصات أخرى
المشروع متوافق مع:
- Vercel
- Netlify
- Railway
- Render

## الدعم والمساعدة

### الموارد المفيدة
- [Replit Docs](https://docs.replit.com)
- [GitHub Repository Issues](./issues)
- [Design Guidelines](./design_guidelines.md)

### نصائح للتطوير السلس
1. استخدم Hot Reload - التطبيق يُحدّث تلقائياً عند التعديل
2. افحص Browser Console للأخطاء
3. استخدم React DevTools للتصحيح
4. راجع `design_guidelines.md` قبل تعديل UI

---

## خطة العمل للمراحل القادمة

### المرحلة 2: الباك إند والمعالجة
- [ ] إعداد FastAPI backend
- [ ] دمج FFmpeg لمعالجة الفيديو
- [ ] نظام رفع الملفات
- [ ] معالجة الترجمات العربية

### المرحلة 3: الميزات المتقدمة
- [ ] مكتبة التأثيرات والانتقالات
- [ ] التكامل مع Google Drive
- [ ] نظام الحفظ في قاعدة البيانات
- [ ] تحسين الأداء

### المرحلة 4: التحسينات والنشر
- [ ] اختبار شامل
- [ ] تحسين السرعة
- [ ] النشر النهائي
- [ ] التوثيق الكامل

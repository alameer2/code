# دليل رفع المشروع إلى GitHub

## الطريقة 1: استخدام Git Pane في Replit (الأسهل)

### الخطوات:
1. **افتح Git Pane**
   - في Replit، ابحث عن أيقونة Git في القائمة الجانبية
   - أو اضغط على `Version Control` من القائمة

2. **إنشاء مستودع GitHub جديد**
   - في Git pane، اضغط على "Create a Git Repo"
   - سجّل دخول إلى حساب GitHub
   - اختر اسم المستودع (مثل: `video-editor-pro`)
   - اختر إذا كنت تريده عام (Public) أو خاص (Private)
   - اضغط "Create"

3. **عمل Commit للتغييرات**
   - سترى قائمة بجميع الملفات المتغيرة
   - أضف رسالة commit مثل: "Initial commit - Video Editor Prototype"
   - اضغط "Commit & Push"

4. **التحقق**
   - اذهب إلى GitHub.com
   - افتح المستودع الجديد
   - تأكد من أن جميع الملفات موجودة

## الطريقة 2: استخدام Terminal (متقدمة)

### إذا لم يكن لديك مستودع بعد:

```bash
# 1. إنشاء مستودع Git محلي
git init

# 2. إضافة جميع الملفات
git add .

# 3. عمل Commit
git commit -m "Initial commit - Video Editor Prototype"

# 4. إنشاء مستودع على GitHub
# اذهب إلى GitHub.com وأنشئ مستودع جديد
# ثم نفذ الأوامر التالية (استبدل YOUR_USERNAME واسم المستودع)

# 5. ربط المستودع المحلي بـ GitHub
git remote add origin https://github.com/YOUR_USERNAME/video-editor-pro.git

# 6. رفع الملفات
git branch -M main
git push -u origin main
```

### إذا كان لديك مستودع موجود:

```bash
# تحديث المستودع الموجود
git add .
git commit -m "Update: Complete prototype with all components"
git push origin main
```

## بعد الرفع إلى GitHub

### رابط المشروع سيكون:
```
https://github.com/YOUR_USERNAME/video-editor-pro
```

### للاستيراد في Replit آخر:
```
https://replit.com/github/YOUR_USERNAME/video-editor-pro
```

## المعلومات المهمة المضمنة

تم إنشاء الملفات التالية لضمان استيراد سلس:

✅ **README.md** - وصف المشروع والميزات
✅ **SETUP.md** - دليل الإعداد الكامل
✅ **replit.md** - معلومات المشروع لـ Replit
✅ **.gitignore** - الملفات المستبعدة من Git
✅ **design_guidelines.md** - إرشادات التصميم
✅ **package.json** - جميع التبعيات
✅ **.replit** - إعدادات Replit
✅ **replit.nix** - تبعيات النظام

## خطة الاستيراد في الحساب الآخر

### 1. استيراد المشروع
```
https://replit.com/github/YOUR_USERNAME/video-editor-pro
```

### 2. التحقق من التبعيات
- Replit سيثبت التبعيات تلقائياً
- إذا لم يحدث، شغّل: `npm install`

### 3. تشغيل التطبيق
- اضغط زر "Run"
- أو في Shell: `npm run dev`
- التطبيق سيعمل على المنفذ 5000

### 4. إكمال التطوير
الآن يمكنك المتابعة بإضافة:
- FastAPI backend لمعالجة الفيديو
- FFmpeg integration
- نظام رفع الملفات الحقيقي
- معالجة الترجمات العربية
- Google Drive integration
- قاعدة بيانات للمشاريع

## نصائح مهمة

### للحفاظ على المزامنة:
```bash
# سحب التحديثات من GitHub
git pull origin main

# رفع التغييرات إلى GitHub
git add .
git commit -m "وصف التغيير"
git push origin main
```

### عند العمل على ميزة جديدة:
```bash
# إنشاء branch جديد
git checkout -b feature/video-processing

# بعد الانتهاء
git add .
git commit -m "Add: Video processing with FFmpeg"
git push origin feature/video-processing

# ثم اعمل Pull Request على GitHub
```

## حل المشاكل

### مشكلة: Authentication عند Push
**الحل:**
1. استخدم Personal Access Token بدلاً من كلمة المرور
2. اذهب إلى GitHub Settings → Developer settings → Personal access tokens
3. أنشئ token جديد
4. استخدمه كـ password عند الـ push

### مشكلة: الملفات الكبيرة
**الحل:**
- تأكد من أن `node_modules/` في `.gitignore`
- لا ترفع ملفات الفيديو الاختبارية

### مشكلة: Merge Conflicts
**الحل:**
```bash
git pull origin main
# حل النزاعات يدوياً
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

## الخطوات التالية

بعد رفع المشروع بنجاح:

1. ✅ المشروع على GitHub
2. ✅ جاهز للاستيراد في أي Replit
3. 🔄 ابدأ العمل على الباك إند
4. 🔄 أضف معالجة الفيديو الفعلية
5. 🔄 طوّر الميزات المتبقية

---

**ملاحظة:** احتفظ بنسخة احتياطية من المشروع قبل أي تغييرات كبيرة!

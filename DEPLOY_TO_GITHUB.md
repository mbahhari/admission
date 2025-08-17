# 🚀 رفع المشروع إلى GitHub - الدليل النهائي

## 🎯 الهدف
رفع مشروع نظام ترتيب المتقدمين إلى مستودع GitHub جديد باسم `admission47`

## 📋 المتطلبات المسبقة
- حساب على GitHub
- Git مثبت على النظام
- المشروع جاهز (✅ تم إعداده)

## 🔧 الخطوات التفصيلية

### الخطوة 1: تثبيت Git
```bash
# افتح PowerShell كمسؤول
winget install --id Git.Git -e --source winget
```

### الخطوة 2: إعادة تشغيل PowerShell
- أغلق PowerShell الحالي
- افتح PowerShell جديد
- انتقل إلى مجلد المشروع:
```bash
cd C:\Users\bahhari\admission
```

### الخطوة 3: إعداد Git
```bash
# تعيين اسم المستخدم
git config --global user.name "اسمك الحقيقي"

# تعيين البريد الإلكتروني
git config --global user.email "بريدك@example.com"

# التحقق من الإعدادات
git config --list
```

### الخطوة 4: إعداد المشروع المحلي
```bash
# تهيئة Git (إذا لم يتم)
git init

# إضافة جميع الملفات
git add .

# عمل commit أولي
git commit -m "Initial commit: نظام ترتيب المتقدمين مع دعم الأولوية للثانوية الصناعية"
```

### الخطوة 5: إنشاء مستودع على GitHub
1. اذهب إلى [github.com](https://github.com)
2. اضغط على زر **"New repository"** (أو **"+"** ثم **"New repository"**)
3. أدخل المعلومات التالية:
   - **Repository name**: `admission47`
   - **Description**: `نظام ترتيب المتقدمين للقبول الجامعي مع دعم الأولوية للثانوية الصناعية`
   - **Visibility**: اختر `Public` أو `Private`
   - **لا تضع علامة** على "Add a README file"
   - **لا تضع علامة** على "Add .gitignore"
   - **لا تضع علامة** على "Choose a license"
4. اضغط **"Create repository"**

### الخطوة 6: ربط المستودع المحلي بـ GitHub
```bash
# إضافة المستودع البعيد (استبدل اسم-المستخدم باسمك)
git remote add origin https://github.com/اسم-المستخدم/admission47.git

# التحقق من المستودعات البعيدة
git remote -v
```

### الخطوة 7: رفع المشروع
```bash
# تغيير اسم الفرع إلى main
git branch -M main

# رفع المشروع
git push -u origin main
```

## 🎉 النتيجة النهائية
سيتم رفع المشروع إلى: `https://github.com/اسم-المستخدم/admission47`

## 📁 الملفات المرفوعة
- ✅ `index.html` - الصفحة الرئيسية
- ✅ `styles.css` - ملف التنسيق
- ✅ `script.js` - ملف الجافاسكربت
- ✅ `README.md` - دليل المشروع بالعربية
- ✅ `README_EN.md` - دليل المشروع بالإنجليزية
- ✅ `.gitignore` - ملف تجاهل Git
- ✅ `GIT_SETUP.md` - تعليمات إعداد Git
- ✅ `QUICK_START.md` - دليل سريع
- ✅ `DEPLOY_TO_GITHUB.md` - هذا الملف
- ✅ `applicanrs.xlsx` - ملف Excel النموذجي

## 🔄 أوامر مفيدة لاحقاً

### عرض حالة المشروع
```bash
git status
```

### رفع تحديثات جديدة
```bash
git add .
git commit -m "وصف التحديث"
git push origin main
```

### جلب تحديثات من GitHub
```bash
git pull origin main
```

## 🆘 حل المشاكل الشائعة

### مشكلة: Git غير معروف
**الحل**: أعد تشغيل PowerShell بعد تثبيت Git

### مشكلة: خطأ في المصادقة
**الحل**: استخدم Personal Access Token من GitHub

### مشكلة: رفض الاتصال
**الحل**: تأكد من صحة رابط المستودع

### مشكلة: خطأ في push
**الحل**: تأكد من أن لديك صلاحيات الكتابة على المستودع

## 📚 روابط مفيدة
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

## 🎯 ملخص سريع
1. **ثبت Git** ← `winget install --id Git.Git -e --source winget`
2. **أعد تشغيل PowerShell**
3. **أعد Git** ← `git config --global user.name "اسمك"`
4. **أضف الملفات** ← `git add . && git commit -m "رسالة"`
5. **أنشئ مستودع** على GitHub باسم `admission47`
6. **اربط المستودع** ← `git remote add origin https://github.com/اسم-المستخدم/admission47.git`
7. **ارفع المشروع** ← `git push -u origin main`

**🎉 تم! المشروع الآن على GitHub**

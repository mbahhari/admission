# تعليمات إعداد Git ورفع المشروع إلى GitHub

## 📥 تثبيت Git

### الطريقة الأولى: التحميل المباشر
1. اذهب إلى [git-scm.com](https://git-scm.com/)
2. اضغط على "Download for Windows"
3. قم بتشغيل الملف المحمل
4. اتبع خطوات التثبيت (استخدم الإعدادات الافتراضية)

### الطريقة الثانية: عبر Microsoft Store
1. افتح Microsoft Store
2. ابحث عن "Git"
3. اضغط على "Install"

### الطريقة الثالثة: عبر winget
```powershell
winget install --id Git.Git -e --source winget
```

## 🔧 إعداد Git

بعد تثبيت Git، افتح PowerShell جديد وقم بتنفيذ الأوامر التالية:

### 1. تعيين اسم المستخدم والبريد الإلكتروني
```bash
git config --global user.name "اسمك هنا"
git config --global user.email "بريدك@example.com"
```

### 2. تهيئة المشروع (إذا لم يتم تهيئته)
```bash
git init
```

### 3. إضافة الملفات
```bash
git add .
```

### 4. عمل commit أولي
```bash
git commit -m "Initial commit: نظام ترتيب المتقدمين"
```

## 🚀 رفع المشروع إلى GitHub

### 1. إنشاء مستودع جديد على GitHub
1. اذهب إلى [github.com](https://github.com)
2. اضغط على "New repository"
3. أدخل اسم المستودع: `admission47`
4. اختر "Public" أو "Private"
5. لا تضع علامة على "Initialize this repository with a README"
6. اضغط "Create repository"

### 2. ربط المستودع المحلي بـ GitHub
```bash
git remote add origin https://github.com/اسم-المستخدم/admission47.git
```

### 3. رفع المشروع
```bash
git branch -M main
git push -u origin main
```

## 📁 هيكل المشروع

```
admission47/
├── index.html          # الصفحة الرئيسية
├── styles.css          # ملف التنسيق
├── script.js           # ملف الجافاسكربت
├── README.md           # دليل المشروع
├── .gitignore          # ملف تجاهل Git
├── GIT_SETUP.md        # هذا الملف
└── applicanrs.xlsx     # ملف Excel النموذجي
```

## 🔄 أوامر Git الأساسية

### عرض حالة المشروع
```bash
git status
```

### عرض التغييرات
```bash
git diff
```

### عرض التاريخ
```bash
git log
```

### تحديث المشروع
```bash
git pull origin main
```

### رفع التحديثات
```bash
git add .
git commit -m "وصف التحديث"
git push origin main
```

## 🆘 حل المشاكل الشائعة

### مشكلة: Git غير معروف
**الحل**: أعد تشغيل PowerShell بعد تثبيت Git

### مشكلة: خطأ في المصادقة
**الحل**: استخدم Personal Access Token من GitHub

### مشكلة: رفض الاتصال
**الحل**: تأكد من صحة رابط المستودع

## 📚 روابط مفيدة

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**ملاحظة**: تأكد من إعادة تشغيل PowerShell بعد تثبيت Git

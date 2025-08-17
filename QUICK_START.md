# 🚀 رفع المشروع إلى GitHub - تعليمات سريعة

## ⚡ الخطوات السريعة

### 1. تثبيت Git
```bash
# افتح PowerShell كمسؤول وقم بتنفيذ:
winget install --id Git.Git -e --source winget
```

### 2. إعادة تشغيل PowerShell
- أغلق PowerShell الحالي
- افتح PowerShell جديد

### 3. إعداد Git
```bash
git config --global user.name "اسمك"
git config --global user.email "بريدك@example.com"
```

### 4. إعداد المشروع
```bash
cd C:\Users\bahhari\admission
git add .
git commit -m "Initial commit: نظام ترتيب المتقدمين"
```

### 5. إنشاء مستودع على GitHub
- اذهب إلى [github.com](https://github.com)
- اضغط "New repository"
- اسم المستودع: `admission47`
- اضغط "Create repository"

### 6. رفع المشروع
```bash
git remote add origin https://github.com/اسم-المستخدم/admission47.git
git branch -M main
git push -u origin main
```

## 🎯 النتيجة النهائية
سيتم رفع المشروع إلى: `https://github.com/اسم-المستخدم/admission47`

---

**ملاحظة**: استبدل `اسم-المستخدم` باسم المستخدم الخاص بك على GitHub

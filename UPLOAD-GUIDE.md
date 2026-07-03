# 🚀 4 طرق لرفع المشروع إلى GitHub

<div dir="rtl">

## المشكلة

GitHub لا يقبل رفع المجلدات (مثل `src/`) عبر المتصفح — فقط ملفات.

## ✅ الحلول الأربعة (اختر ما يناسبك)

---

## 🥇 الحل 1: GitHub Desktop (الأسهل — بدون أكواد)

### الخطوات:

1. **حمّل GitHub Desktop** من https://desktop.github.com/
2. **ثبّته** وافتحه
3. **سجّل الدخول** بحساب GitHub:
   - File → Options → Accounts → Sign in
4. **أنشئ مستودعاً جديداً**:
   - File → New Repository
   - Name: `feasibility-study-app`
   - Local path: اختر مجلد المشروع (بعد فك الضغط)
   - **Initialize with README**: ❌ لا تختر
   - Click: **Create Repository**
5. **ارفع المشروع**:
   - اكتب وصفاً في Summary (مثلاً: "Initial commit")
   - اضغط **Commit to main**
   - اضغط **Publish repository**
   - اختر **Public**
   - Click: **Publish Repository**
6. **انتظر** حتى يكتمل الرفع (5-10 دقائق)
7. اذهب لمستودعك على GitHub → تبويب **Actions**

---

## 🥈 الحل 2: VS Code (إذا كان مثبتاً)

1. افتح **VS Code**
2. **File → Open Folder** → اختر مجلد المشروع
3. اضغط **Ctrl + `** لفتح Terminal
4. اكتب الأوامر التالية:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/feasibility-study-app.git
git push -u origin main
```

استبدل `USERNAME` باسم مستخدمك في GitHub.

---

## 🥉 الحل 3: Git Bash (يدوياً)

### 1️⃣ ثبّت Git
- حمّل من https://git-scm.com/downloads
- شغّل المثبّت (اقبل الإعدادات الافتراضية)

### 2️⃣ أنشئ مستودع فارغ على GitHub
- https://github.com/new
- الاسم: `feasibility-study-app`
- **Public**
- ❌ لا تختر أي تهيئة (no README, no .gitignore)
- **Create repository**

### 3️⃣ أنشئ Personal Access Token
- GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- **Generate new token** → اختر `repo` scope
- انسخ الـ Token (لن تراه مرة أخرى!)

### 4️⃣ ارفع المشروع
افتح **Git Bash** في مجلد المشروع (انقر يميناً في المجلد → Git Bash Here):

```bash
# تهيئة
git init
git add .
git commit -m "Initial commit - Feasibility Study App"

# اربط بـ GitHub (استبدل USERNAME)
git remote add origin https://github.com/USERNAME/feasibility-study-app.git
git branch -M main

# الرفع
git push -u origin main
```

عند الطلب:
- **Username**: اسم مستخدم GitHub
- **Password**: الـ Token الذي نسخته (ليس كلمة المرور!)

---

## 🏆 الحل 4: GitHub CLI (للمستخدمين المتقدمين)

### 1️⃣ ثبّت GitHub CLI
```cmd
:: Windows
winget install GitHub.cli
```

### 2️⃣ سجّل الدخول
```cmd
gh auth login
```

### 3️⃣ ارفع المشروع
```cmd
cd D:\feasibility-study-app
git init
git add .
git commit -m "Initial commit"
gh repo create feasibility-study-app --public --source=. --push
```

---

## 🤔 لم يعمل `upload-to-github.bat`؟

### الأسباب الشائعة:

| السبب | الحل |
|------|------|
| Git غير مثبت | حمّل من https://git-scm.com/downloads |
| لم تُسجّل الدخول | شغّل: `git config --global user.name "اسمك"` و `git config --global user.email "email@x.com"` |
| لم تُنشئ مستودع فارغ | https://github.com/new (بدون README!) |
| الرابط خاطئ | يجب أن ينتهي بـ `.git` |
| مصادقة فاشلة | استخدم Personal Access Token ككلمة مرور |

### تحقق من Git:
افتح CMD واكتب:
```cmd
git --version
```
يجب أن يظهر: `git version 2.x.x`

---

## ✅ بعد الرفع — شغّل GitHub Actions

1. اذهب لمستودعك على GitHub
2. تبويب **Actions**
3. في اليسار: **Build Desktop App (Windows .exe)**
4. اضغط **Run workflow** (يمين)
5. اختر `main` branch → **Run workflow**
6. انتظر 15-20 دقيقة
7. اضغط على آخر run (أخضر ✓)
8. اسحب لأسفل → **Artifacts**
9. حمّل `feasibility-app-windows-X.zip`

---

## 💡 نصيحة

**GitHub Desktop** هو الأسهل للمبتدئين — واجهة رسومية بسيطة بدون أكواد!

حمّله من: https://desktop.github.com/

</div>

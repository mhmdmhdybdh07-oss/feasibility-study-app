# 🔧 إذا لم يعمل build-all.bat

<div dir="rtl">

## الخطوات السريعة

### 1️⃣ أرسل لي لقطة شاشة

عند تشغيل `build-all.bat`، **سيتوقف عند الخطأ**. انسخ لي:
- **آخر 20 سطر** من الإخراج (الجزء الذي يحتوي على الخطأ)
- أو لقطة شاشة للمشكلة

بدون هذا، لا أستطيع تحديد المشكلة الدقيقة.

---

### 2️⃣ حلول سريعة شائعة

#### المشكلة: "node is not recognized"
**الحل**: ثبّت Node.js 20+ من https://nodejs.org

---

#### المشكلة: "npm install failed"
**الحل**: 
```cmd
:: احذف الملفات القديمة وأعد التثبيت
rmdir /s /q node_modules
del package-lock.json
npm install --legacy-peer-deps
```

---

#### المشكلة: "prisma generate failed"
**الحل**:
```cmd
npx prisma generate
```
إذا فشل، تأكد أن ملف `prisma/schema.prisma` موجود.

---

#### المشكلة: فشل Next.js build (الخطوة 9)
هذه **الأخطاء الأكثر شيوعاً**:

##### أ) "Cannot find module 'xxx'"
```cmd
npm install xxx --legacy-peer-deps
```

##### ب) "prisma client not found"
```cmd
npx prisma generate
```

##### ج) "TypeScript error"
الـ `next.config.ts` مُعدّ لتجاهلها، لكن إذا ظهرت:
```cmd
:: تحقق من الملف
type next.config.ts
:: يجب أن يحتوي على: ignoreBuildErrors: true
```

##### د) "EADDRINUSE" (المنفذ مشغول)
```cmd
:: أوقف أي عملية على المنفذ 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

#### المشكلة: فشل electron-builder (الخطوة 12)

##### أ) "Visual Studio installation"
شغّل `install-vs-buildtools.bat` أولاً، ثم أعد `build-all.bat`

##### ب) "icon.ico not found"
```cmd
:: تحقق من وجود الأيقونة
dir public\icons\
:: يجب أن تجد: icon-512.png و icon.ico
```

##### ج) "EACCES" أو "Permission denied"
شغّل `build-all.bat` **كمسؤول**:
- انقر يميناً → **Run as administrator**

---

### 3️⃣ حل بديل فوري: PWA

إذا استمرت المشاكل مع `.exe`، استخدم التطبيق كـ **PWA**:

```cmd
:: 1. شغّل التطبيق
run-windows.bat
```

ثم:
1. افتح **Chrome** أو **Edge**
2. اذهب إلى `http://localhost:3000`
3. اضغط زر **"تثبيت"** في شريط العنوان
4. سيظهر التطبيق كنافذة مستقلة على سطح المكتب
5. **يعمل بدون إنترنت** بعد التثبيت

---

### 4️⃣ حل بديل: GitHub Actions (موصى به)

بدلاً من البناء محلياً، استخدم GitHub Actions:

1. ارفع المشروع إلى GitHub
2. اذهب إلى تبويب **Actions**
3. شغّل **"Build Desktop App"**
4. انتظر ~15 دقيقة
5. حمّل `.exe` من **Artifacts**

راجع `DEPLOY-GUIDE.md` للتفاصيل.

---

## 📋 معلومات مفيدة لإرسالها

عند طلب المساعدة، أرسل:

1. **رسالة الخطأ** (آخر 20 سطر)
2. **إصدار Windows**: شغّل `winver`
3. **إصدار Node.js**: شغّل `node --version`
4. **إصدار npm**: شغّل `npm --version`
5. **الخطوة التي فشلت** (مثلاً: "Step 5 failed")

</div>

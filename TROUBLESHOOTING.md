# 🔍 استكشاف: مجلد `dist` لم يظهر بعد البناء

<div dir="rtl">

## المشكلة

بعد تشغيل `build.bat`، لم يظهر مجلد `dist` مع ملف `.exe`.

## 🔧 الخطوات الإصلاحية

### الخطوة 1: شغّل سكريبت التصحيح

شغّل `debug-build.bat` (انقر يميناً → Run as administrator)

هذا السكريبت يقوم بـ:
- فحص كل ملف مطلوب
- عرض محتويات `electron-builder.yml`
- تشغيل electron-builder مع `--verbose` لرؤية الخطأ الحقيقي
- عرض الخطأ بوضوح

### الخطوة 2: راجع ملف السجل

بعد تشغيل `build.bat`، سيُنشأ ملف `build-log.txt` في جذر المشروع.

افتحه وابحث عن:
```
error
Error
ERROR
failed
Failed
FAILED
```

### الخطوة 3: الأسباب الشائعة

| السبب | الحل |
|------|------|
| **electron-builder لم يُثبّت** | السكريبت يثبّته تلقائياً، لكن تحقق من `node_modules\electron-builder` |
| **icon.ico مفقود** | السكريبت يستخدم PNG كـ fallback |
| **@parcel/watcher يفشل** | السكريبت يحذفه تلقائياً |
| **مضاد الفيروسات يحجب** | عطّل Windows Defender مؤقتاً |
| **مساحة غير كافية** | تحتاج 3+ GB فارغة |
| **VS Build Tools غير مكتمل** | أعد التثبيت مع "Desktop development with C++" |
| **أذونات المجلد** | شغّل كمسؤول (Run as administrator) |

### الخطوة 4: حلول بديلة (إذا استمر الفشل)

#### ✅ الحل 1: GitHub Actions (الأفضل)
1. ارفع المشروع إلى GitHub
2. شغّل workflow "Build Desktop App"
3. حمّل `.exe` من Artifacts
4. **لا يحتاج أي تثبيت محلي!**

#### 🌐 الحل 2: PWA (فوري)
1. شغّل `run-windows.bat`
2. افتح `http://localhost:3000` في Chrome/Edge
3. اضغط زر **"تثبيت"** في شريط العنوان
4. التطبيق يعمل كنافذة مستقلة على سطح المكتب

#### 🔨 الحل 3: بناء يدوي خطوة بخطوة
افتح موجه الأوامر كمسؤول ونفّذ:

```cmd
cd D:\feasibility-study-app\feasibility-study-app

:: 1. تأكد من البناء
npm run build

:: 2. اذهب لـ standalone
cd .next\standalone

:: 3. ثبّت electron
npm install electron electron-builder --save-dev --legacy-peer-deps

:: 4. انسخ ملفات Electron
copy /Y ..\..\electron\main.js electron\main.js
copy /Y ..\..\electron\preload.js electron\preload.js
copy /Y ..\..\electron-builder.yml electron-builder.yml
xcopy /E /I /Y /Q ..\..\public public

:: 5. احذف @parcel/watcher
rmdir /s /q node_modules\@parcel\watcher 2>nul
rmdir /s /q node_modules\@parcel\watcher-win32-x64 2>nul

:: 6. بناء .exe (مع verbose)
npx electron-builder --win --config electron-builder.yml --config.npmRebuild=false --verbose
```

### الخطوة 5: معلومات مفيدة لإرسالها لي

إذا استمر الفشل، أرسل لي:
1. محتوى ملف `build-log.txt`
2. لقطة شاشة للخطأ الأخير
3. إصدار Windows (`winver`)
4. إصدار Node.js (`node --version`)

</div>

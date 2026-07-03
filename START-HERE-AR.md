# 🚀 دليل التشغيل السريع — برنامج إعداد دراسات الجدوى

> **الحزمة الكاملة** — تطبيق ويب تقدمي (PWA) قابل للتثبيت + يمكن بناؤه كملف `.exe` عبر GitHub Actions

---

## 📦 محتويات الحزمة

```
feasibility-study-app/
├── src/                    # كود المصدر (Next.js 16 + TypeScript)
│   ├── app/                # الصفحات + APIs
│   ├── components/         # مكوّنات الواجهة
│   ├── lib/                # مكتبات (محاصيل/مصانع/طاقة/مالية)
│   ├── hooks/              # React hooks
│   ├── store/              # Zustand state
│   └── i18n/               # ترجمات عربي/إنجليزي
├── public/                 # ملفات PWA (manifest + sw.js + icons)
├── prisma/                 # قاعدة البيانات (SQLite)
├── electron/               # ملفات Electron (.exe)
├── .github/workflows/      # GitHub Actions لبناء .exe
├── package.json
├── README.md
└── هذا الملف
```

---

## ⚡ التشغيل السريع (3 خطوات)

### المتطلبات
- **Node.js 20+** أو **Bun** (مُفضّل أسرع)
- أي نظام تشغيل (Windows / macOS / Linux)

### 1️⃣ تثبيت الحزمة

#### الطريقة (أ) — باستخدام Bun (مُوصى به):
```bash
# تثبيت Bun إن لم يكن مثبتًا
# Windows:  powershell -c "irm bun.sh/install.ps1 | iex"
# macOS/Linux:  curl -fsSL https://bun.sh/install | bash

# فك ضغط الحزمة ثم:
cd feasibility-study-app
bun install
```

#### الطريقة (ب) — باستخدام npm:
```bash
cd feasibility-study-app
npm install --legacy-peer-deps
```

### 2️⃣ إعداد قاعدة البيانات

```bash
# أنشئ ملف .env في جذر المشروع يحتوي:
# DATABASE_URL="file:./db/custom.db"

# ثم شغّل:
bun run db:push
# أو:  npx prisma db push
```

### 3️⃣ تشغيل التطبيق

```bash
bun run dev
# أو:  npm run dev
```

افتح المتصفح على: **http://localhost:3000**

✅ التطبيق يعمل الآن! يمكنك:
- إنشاء مشاريع جديدة
- إعداد 8 دراسات جدوى متكاملة
- تصدير النتائج (PDF / Word / Excel / PowerPoint)
- تثبيته كـ PWA (زر "تثبيت" في شريط المتصفح)

---

## 📲 تثبيت التطبيق كـ PWA (بدون .exe)

### على Chrome / Edge / Brave:
1. افتح `http://localhost:3000` في المتصفح
2. اضغط أيقونة **"تثبيت"** ⟶ في شريط العنوان (أو `⋮` ⟶ `تثبيت التطبيق`)
3. سيظهر التطبيق كنافذة مستقلة على سطح المكتب
4. **يعمل بدون إنترنت** بعد التثبيت (Service Worker)

### على الهاتف (Android):
- Chrome ⟶ `⋮` ⟶ **إضافة إلى الشاشة الرئيسية**

### على iPhone:
- Safari ⟶ زر المشاركة ⟶ **إضافة إلى الشاشة الرئيسية**

---

## 🖥️ بناء ملف `.exe` لـ Windows

### الطريقة الأسهل — GitHub Actions (مجاني):
1. ارفع المشروع إلى GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Feasibility Study App"
git branch -M main
git remote add origin https://github.com/USERNAME/feasibility-app.git
git push -u origin main
```

2. اذهب إلى تبويب **Actions** في مستودعك
3. اختر **"Build Desktop App (Windows .exe)"**
4. اضغط **"Run workflow"**
5. انتظر ~10 دقائق
6. حمّل ملف `.exe` من قسم **Artifacts**

### الطريقة اليدوية — على جهاز ويندوز:
```bash
# المتطلبات: Windows 10/11 + Node.js 20 + Git
git clone https://github.com/USERNAME/feasibility-app.git
cd feasibility-app
npm install --legacy-peer-deps
npm run db:push
npm run build

# بناء .exe:
cd .next/standalone
npm install electron electron-builder
cp -r ../../electron .
cp ../../electron-builder.yml .
cp -r ../../public .
npx electron-builder --win
```

ستجد ملف `.exe` في: `.next/standalone/dist/`

---

## 🌐 النشر على الإنترنت (مجاني)

### Vercel (الأسهل — مملوك لـ Next.js):
1. اذهب إلى https://vercel.com
2. اربط حساب GitHub
3. اختر المستودع ⟶ Deploy
4. ستحصل على رابط مثل: `feasibility-app.vercel.app`

### Netlify / Cloudflare Pages:
- نفس الفكرة — اربط المستودع وانشر

---

## 🔧 استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| `Cannot find module 'prisma'` | شغّل `bun run db:generate` |
| `DATABASE_URL` error | أنشئ ملف `.env` بالمحتوى أعلاه |
| خطأ في `bun install` | جرّب `npm install --legacy-peer-deps` |
| المنفذ 3000 مشغول | `bun run dev -- -p 3001` |
| صفحة فارغة | احذف `.next/` وأعد `bun run dev` |
| `prisma/client` not found | `bun add @prisma/client && bun run db:generate` |

---

## 📚 الأقسام الأساسية في التطبيق

| القسم | الوصف |
|------|-------|
| **المشاريع النموذجية** | 12 مشروع جاهز قابل للتحرير (زراعي/صناعي/طاقي) |
| **مكتبة المحاصيل** | 34 محصول يمني بمواصفات علمية + مقارنة |
| **مكتبة المصانع** | 30 مصنع تحويلي ببيانات اقتصادية |
| **مكتبة الطاقة** | 10 مشاريع (شمسية/رياح/كهروماء) + 4 حاسبات |
| **التحليلات المتقدمة** | Monte Carlo + Tornado + SWOT + Porter |
| **مساعد AI** | محادثة + تحليل تلقائي للمشروع |
| **التصدير** | PDF + Word + Excel + PowerPoint + JSON |
| **الإعدادات** | 8 ثيمات + أسعار صرف حية + لغة |

---

## 🆘 الدعم

- 📧 المشاكل التقنية: افتح issue في GitHub
- 📖 الوثائق: راجع `README.md`
- 🔄 التحديثات: `git pull && bun install`

**استمتع بإعداد دراسات الجدوى! 🎉**

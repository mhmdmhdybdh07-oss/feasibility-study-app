# ============================================================
#   بناء ملف .exe لتطبيق دراسات الجدوى على Windows
#   Build .exe for Feasibility Study App on Windows
#   PowerShell Version (cleaner output)
# ============================================================

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "بناء تطبيق دراسات الجدوى - Build Feasibility Study App"

# Track build time
$BuildStart = Get-Date

function Write-Step($step, $total, $msg) {
    Write-Host "`n[$step/$total] $msg`n" -ForegroundColor Cyan
}

function Write-OK($msg) {
    Write-Host "  ✅ $msg" -ForegroundColor Green
}

function Write-Warn($msg) {
    Write-Host "  ⚠️  $msg" -ForegroundColor Yellow
}

function Write-Err($msg) {
    Write-Host "  ❌ $msg" -ForegroundColor Red
}

function Write-Info($msg) {
    Write-Host "  ℹ️  $msg" -ForegroundColor Gray
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  📊 بناء تطبيق دراسات الجدوى (.exe)" -ForegroundColor Cyan
Write-Host "  Build Feasibility Study App (.exe)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  المسار: $(Get-Location)"
Write-Host "  الوقت:  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# ============================================================
# [1] Prerequisites
# ============================================================
Write-Step 1 8 "فحص المتطلبات... Checking prerequisites..."

# Node.js
try {
    $nodeVer = node --version 2>$null
    if ($LASTEXITCODE -ne 0) { throw "no node" }
    Write-OK "Node.js: $nodeVer"
} catch {
    Write-Err "Node.js غير مثبت! ثبّته من: https://nodejs.org"
    Read-Host "اضغط Enter للخروج"
    exit 1
}

# npm
try {
    $npmVer = npm --version 2>$null
    if ($LASTEXITCODE -ne 0) { throw "no npm" }
    Write-OK "npm: v$npmVer"
} catch {
    Write-Err "npm غير متوفر!"
    Read-Host "اضغط Enter للخوط"
    exit 1
}

# git (optional)
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-OK "Git: متوفر"
} else {
    Write-Warn "Git غير مثبت (اختياري)"
}

# ============================================================
# [2] Project files
# ============================================================
Write-Step 2 8 "فحص ملفات المشروع... Checking project files..."

$requiredFiles = @(
    "package.json",
    "next.config.ts",
    "electron\main.js",
    "electron\preload.js",
    "electron-builder.yml",
    "prisma\schema.prisma"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Err "$file غير موجود!"
        Read-Host "اضغط Enter للخروج"
        exit 1
    }
}
Write-OK "جميع الملفات الأساسية موجودة"

# ============================================================
# [3] Environment
# ============================================================
Write-Step 3 8 "إعداد ملف البيئة... Setting up environment..."

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-OK "تم إنشاء .env من .env.example"
    } else {
        'DATABASE_URL="file:./db/custom.db"' | Out-File -FilePath ".env" -Encoding utf8
        Write-OK "تم إنشاء .env جديد"
    }
} else {
    Write-OK ".env موجود مسبقاً"
}

# Set env vars for build
$env:DATABASE_URL = "file:./db/custom.db"
$env:NEXTAUTH_SECRET = "build-secret-$(Get-Random)"
$env:NEXTAUTH_URL = "http://localhost:3000"

# ============================================================
# [4] Install dependencies
# ============================================================
Write-Step 4 8 "تثبيت حزم المشروع... Installing dependencies..."

if (Test-Path "node_modules") {
    Write-Info "node_modules موجود. تخطي التثبيت."
    Write-Info "(لإعادة التثبيت: احذف المجلد ثم أعد التشغيل)"
} else {
    Write-Info "جاري التثبيت... قد يستغرق عدة دقائق"
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        Write-Err "فشل تثبيت الحزم!"
        Write-Info "جرّب يدوياً: npm install --legacy-peer-deps"
        Read-Host "اضغط Enter للخروج"
        exit 1
    }
}
Write-OK "الحزم مثبتة"

# ============================================================
# [5] Database setup
# ============================================================
Write-Step 5 8 "إعداد قاعدة البيانات... Setting up database..."

if (-not (Test-Path "db")) { New-Item -ItemType Directory -Path "db" | Out-Null }

Write-Info "تطبيق مخطط Prisma..."
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Warn "db push فشل (قد يكون طبيعياً للمرة الأولى)"
    npx prisma db push --accept-data-loss
}

Write-Info "توليد عميل Prisma..."
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Err "فشل توليد عميل Prisma!"
    Read-Host "اضغط Enter للخروج"
    exit 1
}
Write-OK "قاعدة البيانات جاهزة"

# ============================================================
# [6] Build Next.js (standalone)
# ============================================================
Write-Step 6 8 "بناء Next.js... Building Next.js (standalone)..."
Write-Info "⏱️  هذه الخطوة تستغرق 3-5 دقائق..."

# Clean previous
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
if (Test-Path "out") { Remove-Item -Recurse -Force "out" }

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Err "فشل بناء Next.js!"
    Write-Info "تحقق من:"
    Write-Info "  1. اتصال الإنترنت (لتحميل الخطوط)"
    Write-Info "  2. مساحة كافية على القرص"
    Read-Host "اضغط Enter للخروج"
    exit 1
}

# Copy static files
Write-Info "نسخ الملفات الثابتة..."
if (-not (Test-Path ".next\standalone")) {
    Write-Err "مجلد .next\standalone غير موجود!"
    Write-Info 'تأكد أن next.config.ts يحتوي: output: "standalone"'
    Read-Host "اضغط Enter للخروج"
    exit 1
}

Copy-Item -Recurse -Force ".next\static" ".next\standalone\.next\static"
Copy-Item -Recurse -Force "public" ".next\standalone\public"
Write-OK "تم بناء Next.js بنجاح"

# ============================================================
# [7] Electron setup
# ============================================================
Write-Step 7 8 "إعداد Electron... Setting up Electron..."

Push-Location ".next\standalone"

# package.json
if (-not (Test-Path "package.json")) {
    '{"name":"feasibility-app","version":"1.0.0","main":"electron/main.js"}' | Out-File -FilePath "package.json" -Encoding utf8
    Write-OK "تم إنشاء package.json"
} else {
    Write-OK "package.json موجود"
}

# Install electron
Write-Info "تثبيت electron و electron-builder..."
Write-Info "⏱️  قد يستغرق 2-3 دقائق..."
npm install electron electron-builder --save-dev --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Err "فشل تثبيت Electron!"
    Pop-Location
    Read-Host "اضغط Enter للخروج"
    exit 1
}
Write-OK "Electron مثبت"

# Copy electron files
Write-Info "نسخ ملفات Electron..."
if (-not (Test-Path "electron")) { New-Item -ItemType Directory -Path "electron" | Out-Null }
Copy-Item -Force "..\..\electron\main.js" "electron\main.js"
Copy-Item -Force "..\..\electron\preload.js" "electron\preload.js"
if (Test-Path "..\..\electron\README.md") {
    Copy-Item -Force "..\..\electron\README.md" "electron\README.md"
}

# Copy electron-builder.yml
Copy-Item -Force "..\..\electron-builder.yml" "electron-builder.yml"

# Make sure icons exist
if (-not (Test-Path "public\icons")) { New-Item -ItemType Directory -Path "public\icons" -Force | Out-Null }
if (Test-Path "..\..\public\icons\icon-192.png") {
    Copy-Item -Force "..\..\public\icons\icon-192.png" "public\icons\"
}
if (Test-Path "..\..\public\icons\icon-512.png") {
    Copy-Item -Force "..\..\public\icons\icon-512.png" "public\icons\"
}

# db folder
if (-not (Test-Path "db")) { New-Item -ItemType Directory -Path "db" | Out-Null }

Write-OK "Electron جاهز"

# ============================================================
# [8] Build .exe
# ============================================================
Write-Step 8 8 "بناء ملف .exe... Building .exe installer..."
Write-Info "⏱️  هذه الخطوة تستغرق 5-10 دقائق..."
Write-Info "(سيتم تنزيل أدوات إضافية في المرة الأولى)"

npx electron-builder --win --config electron-builder.yml
if ($LASTEXITCODE -ne 0) {
    Write-Err "فشل بناء .exe!"
    Write-Info "أسباب محتملة:"
    Write-Info "  1. مساحة غير كافية (تحتاج ~2 GB)"
    Write-Info "  2. اتصال إنترنت ضعيف"
    Write-Info "  3. مضاد الفيروسات يحجب العملية"
    Write-Info "جرّب: أعد التشغيل كمسؤول (Run as Administrator)"
    Pop-Location
    Read-Host "اضغط Enter للخروج"
    exit 1
}

Pop-Location

# ============================================================
# Done
# ============================================================
$BuildEnd = Get-Date
$Duration = $BuildEnd - $BuildStart

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  🎉 تم بناء التطبيق بنجاح!" -ForegroundColor Green
Write-Host "  Build completed successfully!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""

$distPath = ".next\standalone\dist"
if (Test-Path $distPath) {
    Write-Host "📁 ملفات الإخراج في: $(Resolve-Path $distPath)" -ForegroundColor Cyan
    Write-Host ""
    Get-ChildItem "$distPath\*.exe" | ForEach-Object {
        $sizeMB = [math]::Round($_.Length / 1MB, 2)
        Write-Host "📦 ملف .exe: $($_.Name)" -ForegroundColor Yellow
        Write-Host "📐 الحجم: $sizeMB MB" -ForegroundColor Yellow
    }
} else {
    Write-Warn "لم يتم العثور على ملف .exe في $distPath"
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  📋 معلومات البناء:" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  📂 مسار المشروع: $(Get-Location)"
Write-Host "  📂 مسار .exe:    $(Resolve-Path $distPath)"
Write-Host "  🕐 وقت البدء:    $($BuildStart.ToString('yyyy-MM-dd HH:mm:ss'))"
Write-Host "  🕐 وقت الانتهاء: $($BuildEnd.ToString('yyyy-MM-dd HH:mm:ss'))"
$durationStr = "$([math]::Floor($Duration.TotalMinutes)) دقيقة و $($Duration.Seconds) ثانية"
Write-Host "  ⏱️  المدة:        $durationStr"
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 لاستخدام ملف .exe:" -ForegroundColor Cyan
Write-Host "   1. شغّل الملف كمسؤول (right-click → Run as administrator)"
Write-Host "   2. اتبع معالج التثبيت"
Write-Host "   3. سيتم إنشاء اختصار على سطح المكتب"
Write-Host "   4. سيظهر البرنامج في قائمة Start"
Write-Host ""

# Open dist folder
Write-Host "🔓 فتح مجلد dist..." -ForegroundColor Cyan
Invoke-Item $distPath

Write-Host ""
Read-Host "اضغط Enter للخروج"
exit 0

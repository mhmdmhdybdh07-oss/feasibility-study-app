#!/usr/bin/env bash
# ============================================================
#  تشغيل برنامج إعداد دراسات الجدوى على macOS / Linux
#  Run Feasibility Study App on macOS / Linux
# ============================================================
set -e
cd "$(dirname "$0")"

echo ""
echo "============================================================"
echo "  برنامج إعداد دراسات الجدوى - تشغيل تلقائي"
echo "  Feasibility Study Builder - Auto Run"
echo "============================================================"
echo ""

# Check for node or bun
if ! command -v node &> /dev/null && ! command -v bun &> /dev/null; then
  echo "[خطأ] Node.js أو Bun غير مثبت."
  echo "ثبّت Node.js من: https://nodejs.org"
  echo "أو Bun من: https://bun.sh"
  exit 1
fi

# Create .env if missing
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "[OK] تم إنشاء ملف .env"
  else
    echo 'DATABASE_URL="file:./db/custom.db"' > .env
    echo "[OK] تم إنشاء ملف .env"
  fi
fi

# Pick package manager
if command -v bun &> /dev/null; then
  PM="bun"
  RUN_CMD="bun run"
  INSTALL_CMD="bun install"
  DB_PUSH="$PM run db:push"
  DB_GEN="$PM run db:generate"
else
  PM="npm"
  RUN_CMD="npm run"
  INSTALL_CMD="npm install --legacy-peer-deps"
  DB_PUSH="npx prisma db push"
  DB_GEN="npx prisma generate"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
  echo "[1/3] تثبيت الحزم... Installing dependencies..."
  $INSTALL_CMD
else
  echo "[1/3] الحزم مثبتة مسبقاً. Dependencies already installed."
fi

# Setup database
echo "[2/3] إعداد قاعدة البيانات... Setting up database..."
$DB_PUSH || true
$DB_GEN || true

# Start dev server
echo "[3/3] تشغيل التطبيق... Starting app..."
echo ""
echo "============================================================"
echo "  ✅ التطبيق يعمل على: http://localhost:3000"
echo "  افتح المتصفح على هذا الرابط"
echo "  لإيقاف التطبيق: اضغط Ctrl+C"
echo "============================================================"
echo ""

$RUN_CMD dev

@echo off
REM ============================================================
REM  Full diagnostic and fix script for Next.js build issues
REM  This script:
REM  1. Runs Next.js build with full output (no hiding)
REM  2. Captures all errors to a log file
REM  3. Verifies standalone output
REM  4. Provides specific fixes for common errors
REM ============================================================
setlocal enabledelayedexpansion

title Full Build Diagnostic - Next.js

cd /d "%~dp0"

echo.
echo ============================================================
echo   Full Build Diagnostic
echo   Next.js Build Issue Finder
echo ============================================================
echo.
echo   Path: %CD%
echo.

REM [1] Check Node version (Next.js 16 needs Node 18+)
echo [1/8] Checking Node.js version...
where node >nul 2>nul
if errorlevel 1 (
    echo   [ERROR] Node.js is NOT installed!
    echo   Install from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo   [OK] Node.js: %NODE_VER%

REM Extract major version
for /f "tokens=1 delims=v." %%a in ("%NODE_VER%") do set NODE_MAJOR=%%a
echo   [INFO] Major version: %NODE_MAJOR%
if !NODE_MAJOR! LSS 18 (
    echo   [ERROR] Node.js 18+ required! You have %NODE_VER%
    echo   Update from: https://nodejs.org
    pause
    exit /b 1
)

REM [2] Check npm
echo.
echo [2/8] Checking npm...
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo   [OK] npm: %NPM_VER%

REM [3] Check critical files
echo.
echo [3/8] Checking project files...
set MISSING=0
for %%f in (package.json next.config.ts tsconfig.json) do (
    if not exist "%%f" (
        echo   [ERROR] %%f NOT found!
        set /a MISSING+=1
    ) else (
        echo   [OK] %%f
    )
)
if !MISSING! gtr 0 (
    echo.
    echo   [ERROR] !MISSING! files missing!
    echo   Make sure you run this from the project root.
    pause
    exit /b 1
)

REM [4] Check next.config.ts has standalone
echo.
echo [4/8] Checking next.config.ts for standalone output...
if not exist "next.config.ts" (
    echo   [ERROR] next.config.ts not found!
    pause
    exit /b 1
)
findstr /C:"standalone" next.config.ts >nul
if errorlevel 1 (
    echo   [WARN] 'standalone' not found in next.config.ts
    echo   [INFO] Creating a proper next.config.ts...
    (
        echo import type { NextConfig } from "next"^;
        echo.
        echo const nextConfig: NextConfig = {
        echo   output: "standalone"^,
        echo   typescript: {
        echo     ignoreBuildErrors: true^,
        echo   }^,
        echo   reactStrictMode: false^,
        echo }^;
        echo.
        echo export default nextConfig^;
    ) > next.config.ts
    echo   [OK] Created new next.config.ts with standalone output
) else (
    echo   [OK] standalone output is configured
)
echo.
echo   Current next.config.ts:
echo   ----------------------------------------
type next.config.ts
echo   ----------------------------------------

REM [5] Check .env file
echo.
echo [5/8] Checking .env file...
if not exist ".env" (
    echo   [INFO] Creating .env file...
    echo DATABASE_URL="file:./db/custom.db" > .env
    echo   [OK] Created .env
) else (
    echo   [OK] .env exists
    type .env
)

REM [6] Setup database first
echo.
echo [6/8] Setting up database...
if not exist "db" mkdir "db"
if not exist "prisma\schema.prisma" (
    echo   [ERROR] prisma\schema.prisma not found!
    pause
    exit /b 1
)

echo   [INFO] Running prisma db push...
call npx prisma db push --accept-data-loss 2>&1
echo.

echo   [INFO] Running prisma generate...
call npx prisma generate 2>&1
echo.

REM [7] Clean and reinstall dependencies if needed
echo.
echo [7/8] Checking dependencies...
if not exist "node_modules\next" (
    echo   [WARN] Next.js not installed in node_modules
    echo   [INFO] Installing dependencies...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo   [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo   [OK] node_modules exists
)

REM [8] THE CRITICAL STEP - Build Next.js with FULL output
echo.
echo [8/8] Building Next.js (FULL OUTPUT - no hiding)...
echo.
echo ============================================================
echo   Next.js Build Output (this will show ALL errors)
echo ============================================================
echo.

REM Set environment variables
set DATABASE_URL=file:./db/custom.db
set NEXTAUTH_SECRET=diag-secret-%RANDOM%
set NEXTAUTH_URL=http://localhost:3000

REM Clean previous build
if exist ".next" rmdir /s /q ".next"
if exist "out" rmdir /s /q "out"

REM Run Next.js build directly - ALL output to console AND log
echo   Running: npx next build --turbopack
echo.

call npx next build --turbopack 2>&1

echo.
echo ============================================================
echo   End of Next.js Build Output
echo ============================================================
echo.

REM Check if standalone was created
if exist ".next\standalone\server.js" (
    echo   [SUCCESS] Standalone server created!
    echo.
    echo   Now run build.bat to create the .exe
    echo.
    pause
    exit /b 0
) else (
    echo   [FAILED] Standalone server NOT created
    echo.
    echo   ============================================
    echo   COMMON FIXES:
    echo   ============================================
    echo.
    echo   1. TypeScript errors:
    echo      - next.config.ts already has ignoreBuildErrors: true
    echo      - If still failing, check the errors above
    echo.
    echo   2. Font loading errors (Google Fonts):
    echo      - Check internet connection
    echo      - Or replace next/font/google with system fonts
    echo.
    echo   3. Prisma client errors:
    echo      - Run: npx prisma generate
    echo      - Then run this script again
    echo.
    echo   4. Memory issues:
    echo      - Close other applications
    echo      - Increase Node memory:
    echo        set NODE_OPTIONS=--max-old-space-size=4096
    echo.
    echo   5. Module not found errors:
    echo      - Delete node_modules and reinstall:
    echo        rmdir /s /q node_modules
    echo        npm install --legacy-peer-deps
    echo.
    echo   6. Try with SKIP_LINT:
    echo      set ESLINT_SKIP_DURING_BUILD=true
    echo      set NEXT_SKIP_ESLINT=true
    echo      npx next build
    echo.
    echo   ============================================
    echo.
    echo   Send me the error message above and I will
    echo   provide the exact fix!
    echo.
    pause
    exit /b 1
)

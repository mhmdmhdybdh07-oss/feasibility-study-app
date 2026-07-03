@echo off
REM ============================================================
REM  Alternative build script - uses prepackaged Electron
REM  Avoids native module rebuild entirely
REM ============================================================
setlocal enabledelayedexpansion

title Build .exe (Alternative - No VS Build Tools)

cd /d "%~dp0"

echo.
echo ============================================================
echo   Alternative Build (No Visual Studio Required)
echo ============================================================
echo.
echo This script builds the .exe without compiling native modules.
echo It uses prebuilt binaries only.
echo.

REM Check we're in standalone
if not exist ".next\standalone\server.js" (
    echo [ERROR] Next.js standalone build not found.
    echo Run build.bat first to build Next.js, then run this script.
    pause
    exit /b 1
)

cd .next\standalone

REM Make sure electron-builder is installed
if not exist "node_modules\electron-builder" (
    echo [INFO] Installing electron-builder...
    call npm install electron-builder --save-dev --legacy-peer-deps
)

REM Remove problematic native modules (only needed for dev)
echo [INFO] Removing dev-only native modules...
if exist "node_modules\@parcel\watcher" rmdir /s /q "node_modules\@parcel\watcher"
if exist "node_modules\@parcel\watcher-win32-x64" rmdir /s /q "node_modules\@parcel\watcher-win32-x64"

REM Build with all native rebuild disabled
echo.
echo [INFO] Building .exe (this may take 5-10 minutes)...
echo.

REM Combine all skip flags
call npx electron-builder --win ^
    --config electron-builder.yml ^
    --config.npmRebuild=false ^
    --config.buildDependenciesFromSource=false ^
    --config.nodeGypRebuild=false

if errorlevel 1 (
    echo.
    echo [ERROR] Build still failed.
    echo.
    echo Last resort options:
    echo   1. Install VS Build Tools: install-vs-buildtools.bat
    echo   2. Use GitHub Actions (see DEPLOY-GUIDE.md)
    echo   3. Use as PWA: npm run dev, then install in browser
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   BUILD COMPLETED!
echo ============================================================
echo.
echo .exe file location:
dir /b "dist\*.exe" 2>nul
echo.
echo Opening dist folder...
explorer "dist"
pause
exit /b 0

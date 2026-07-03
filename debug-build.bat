@echo off
REM ============================================================
REM  Debug script - checks why .exe build failed
REM  Run this if build.bat completed but no dist folder appeared
REM ============================================================
setlocal enabledelayedexpansion

title Debug Build Issues

cd /d "%~dp0"

echo.
echo ============================================================
echo   Debug Build Issues
echo ============================================================
echo.
echo This script checks for common build failure causes.
echo.

REM [1] Check if standalone exists
echo [1] Checking Next.js standalone build...
if exist ".next\standalone\server.js" (
    echo   [OK] Standalone server exists
) else (
    echo   [ERROR] .next\standalone\server.js NOT found!
    echo   The Next.js build did not complete successfully.
    echo   Run build.bat again and check build-log.txt
    pause
    exit /b 1
)

REM [2] Check standalone contents
echo.
echo [2] Checking standalone folder contents...
cd .next\standalone
echo   Files in .next\standalone:
dir /b 2>nul | findstr /v "^$"
echo.

REM [3] Check if electron is installed
echo [3] Checking Electron installation...
if exist "node_modules\electron" (
    echo   [OK] electron is installed
) else (
    echo   [ERROR] electron NOT installed in standalone!
    echo   Installing now...
    call npm install electron --save-dev --legacy-peer-deps
)
if exist "node_modules\electron-builder" (
    echo   [OK] electron-builder is installed
) else (
    echo   [ERROR] electron-builder NOT installed!
    echo   Installing now...
    call npm install electron-builder --save-dev --legacy-peer-deps
)

REM [4] Check electron files
echo.
echo [4] Checking Electron files...
if exist "electron\main.js" (
    echo   [OK] electron\main.js exists
) else (
    echo   [ERROR] electron\main.js missing!
    echo   Copying from project root...
    if not exist "electron" mkdir "electron"
    copy /Y "..\..\electron\main.js" "electron\main.js" >nul
)
if exist "electron\preload.js" (
    echo   [OK] electron\preload.js exists
) else (
    echo   [ERROR] electron\preload.js missing!
    copy /Y "..\..\electron\preload.js" "electron\preload.js" >nul
)

REM [5] Check electron-builder.yml
echo.
echo [5] Checking electron-builder.yml...
if exist "electron-builder.yml" (
    echo   [OK] electron-builder.yml exists
    echo.
    echo   Contents:
    type electron-builder.yml
    echo.
) else (
    echo   [ERROR] electron-builder.yml missing!
    echo   Copying from project root...
    copy /Y "..\..\electron-builder.yml" "electron-builder.yml" >nul
)

REM [6] Check icons
echo.
echo [6] Checking icons...
if exist "public\icons\icon.ico" (
    echo   [OK] icon.ico exists
) else (
    echo   [WARN] icon.ico missing
    if exist "public\icons\icon-512.png" (
        echo   [INFO] icon-512.png exists (will use as fallback)
    ) else (
        echo   [ERROR] No icons found!
        echo   Creating public\icons folder...
        mkdir "public\icons" 2>nul
    )
)

REM [7] Check package.json in standalone
echo.
echo [7] Checking package.json in standalone...
if exist "package.json" (
    echo   [OK] package.json exists
    echo.
    echo   Contents:
    type package.json
    echo.
) else (
    echo   [ERROR] package.json missing!
    echo   Creating one...
    echo {"name":"feasibility-app","version":"1.0.0","main":"electron/main.js"} > package.json
)

REM [8] Remove problematic native modules
echo.
echo [8] Removing problematic native modules...
if exist "node_modules\@parcel\watcher" (
    rmdir /s /q "node_modules\@parcel\watcher"
    echo   [OK] Removed @parcel/watcher
) else (
    echo   [OK] @parcel/watcher not present
)
if exist "node_modules\@parcel\watcher-win32-x64" (
    rmdir /s /q "node_modules\@parcel\watcher-win32-x64"
    echo   [OK] Removed @parcel/watcher-win32-x64
)

REM [9] Clean dist and try build with verbose output
echo.
echo [9] Cleaning dist and building with verbose output...
echo.
if exist "dist" rmdir /s /q "dist"

echo   Running electron-builder with verbose output...
echo   (This will show all errors in real-time)
echo.
echo   ============================================
echo   ELECTRON-BUILDER OUTPUT:
echo   ============================================
echo.

call npx electron-builder --win --config electron-builder.yml --config.npmRebuild=false --verbose

echo.
echo   ============================================
echo   END OF OUTPUT
echo   ============================================
echo.

REM [10] Check result
echo.
echo [10] Checking result...
if exist "dist" (
    echo   [OK] dist folder created!
    echo.
    echo   Contents:
    dir /b "dist" 2>nul
    echo.
    for %%f in (dist\*.exe) do (
        echo   [SUCCESS] .exe created: %%f
        echo   Size: %%~zf bytes
    )
    echo.
    echo   Opening dist folder...
    explorer "dist"
) else (
    echo   [ERROR] dist folder STILL not created
    echo.
    echo   The electron-builder failed. Common solutions:
    echo.
    echo   1. Run as Administrator (right-click this script)
    echo.
    echo   2. Disable antivirus temporarily
    echo      Windows Defender may block electron-builder
    echo.
    echo   3. Free up disk space (need 3+ GB)
    echo.
    echo   4. Try building with VS Build Tools:
    echo      - Make sure "Desktop development with C++"
    echo        was selected during VS Build Tools install
    echo      - Restart computer after install
    echo      - Run build.bat again
    echo.
    echo   5. Alternative: Use GitHub Actions
    echo      - Push to GitHub
    echo      - Run "Build Desktop App" workflow
    echo      - Download .exe from Artifacts
    echo.
    echo   6. Alternative: Use PWA
    echo      - Run run-windows.bat
    echo      - Install from Chrome/Edge
)

echo.
pause
exit /b 0

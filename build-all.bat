@echo off
REM ============================================================
REM   SIMPLE Build Script - works on first try
REM   Shows every step on screen - NO hiding
REM ============================================================
setlocal enabledelayedexpansion

title Simple Build for Feasibility App

cd /d "%~dp0"

echo.
echo ============================================================
echo   SIMPLE BUILD - Step by step
echo ============================================================
echo.
echo   Path: %CD%
echo.

REM ============================================================
REM STEP 1: Check Node
REM ============================================================
echo === STEP 1: Check Node.js ===
where node
if errorlevel 1 (
    echo   ERROR: Node.js NOT installed
    echo   Download from: https://nodejs.org
    pause
    exit /b 1
)
node --version
echo.

REM ============================================================
REM STEP 2: Check npm
REM ============================================================
echo === STEP 2: Check npm ===
where npm
if errorlevel 1 (
    echo   ERROR: npm NOT available
    pause
    exit /b 1
)
npm --version
echo.

REM ============================================================
REM STEP 3: Create .env
REM ============================================================
echo === STEP 3: Create .env ===
if not exist ".env" (
    echo DATABASE_URL="file:./db/custom.db" > .env
    echo   Created .env file
) else (
    echo   .env already exists
)
echo.

REM ============================================================
REM STEP 4: Create db folder
REM ============================================================
echo === STEP 4: Create db folder ===
if not exist "db" mkdir "db"
echo   db folder ready
echo.

REM ============================================================
REM STEP 5: Install dependencies (ALWAYS - ensures fresh install)
REM ============================================================
echo === STEP 5: Install dependencies ===
echo   This may take 5-10 minutes on first run...
echo   Running: npm install --legacy-peer-deps
echo.
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo.
    echo   ERROR: npm install failed!
    echo   Try manually: npm install --legacy-peer-deps
    pause
    exit /b 1
)
echo   Dependencies installed successfully
echo.

REM ============================================================
REM STEP 6: Generate Prisma client
REM ============================================================
echo === STEP 6: Generate Prisma client ===
call npx prisma generate
if errorlevel 1 (
    echo   WARNING: prisma generate had issues (continuing anyway)
)
echo.

REM ============================================================
REM STEP 7: Setup database
REM ============================================================
echo === STEP 7: Setup database ===
call npx prisma db push --accept-data-loss
if errorlevel 1 (
    echo   WARNING: prisma db push had issues (continuing anyway)
)
echo.

REM ============================================================
REM STEP 8: Clean previous build
REM ============================================================
echo === STEP 8: Clean previous build ===
if exist ".next" (
    echo   Removing .next folder...
    rmdir /s /q ".next"
)
if exist "out" (
    echo   Removing out folder...
    rmdir /s /q "out"
)
echo   Clean done
echo.

REM ============================================================
REM STEP 9: Build Next.js (ALL output visible!)
REM ============================================================
echo === STEP 9: Build Next.js ===
echo ============================================================
echo   NEXT.JS BUILD - ALL OUTPUT SHOWN BELOW
echo   If you see an error here, that is the real problem!
echo ============================================================
echo.

set DATABASE_URL=file:./db/custom.db
set NEXTAUTH_SECRET=secret-%RANDOM%
set NEXTAUTH_URL=http://localhost:3000

echo   Command: npx next build --turbopack
echo.

call npx next build --turbopack

echo.
echo ============================================================
echo   END OF NEXT.JS OUTPUT
echo ============================================================
echo.

REM Check if build succeeded
if exist ".next\standalone\server.js" (
    echo   SUCCESS: standalone server created!
) else (
    echo   FAILED: .next\standalone\server.js not created
    echo.
    echo   The error above tells you what went wrong.
    echo.
    echo   Copy the last 20 lines above and send to me
    echo   for a specific fix.
    echo.
    pause
    exit /b 1
)
echo.

REM ============================================================
REM STEP 10: Copy static files
REM ============================================================
echo === STEP 10: Copy static files ===
if exist ".next\static" (
    echo   Copying .next\static to standalone...
    xcopy /E /I /Y /Q ".next\static" ".next\standalone\.next\static" >nul
    echo   static copied
) else (
    echo   WARNING: .next\static not found
)
if exist "public" (
    echo   Copying public to standalone...
    xcopy /E /I /Y /Q "public" ".next\standalone\public" >nul
    echo   public copied
) else (
    echo   WARNING: public not found
)
echo.

REM ============================================================
REM STEP 11: Go to standalone and setup electron
REM ============================================================
echo === STEP 11: Setup Electron ===
cd .next\standalone

if not exist "package.json" (
    echo {"name":"feasibility-app","version":"1.0.0","main":"electron/main.js"} > package.json
    echo   Created package.json
) else (
    echo   package.json exists
)

echo   Installing electron + electron-builder...
call npm install electron electron-builder --save-dev --legacy-peer-deps
if errorlevel 1 (
    echo   ERROR: Failed to install electron-builder
    pause
    exit /b 1
)
echo   electron-builder installed
echo.

REM Copy electron files
if not exist "electron" mkdir "electron"
copy /Y "..\..\electron\main.js" "electron\main.js" >nul
copy /Y "..\..\electron\preload.js" "electron\preload.js" >nul
copy /Y "..\..\electron-builder.yml" "electron-builder.yml" >nul
echo   Electron files copied

REM Copy icons
if not exist "public\icons" mkdir "public\icons"
if exist "..\..\public\icons\icon-512.png" copy /Y "..\..\public\icons\icon-512.png" "public\icons\" >nul
if exist "..\..\public\icons\icon.ico" copy /Y "..\..\public\icons\icon.ico" "public\icons\" >nul
echo   Icons copied

REM Create db folder
if not exist "db" mkdir "db"

REM Remove problematic native module
if exist "node_modules\@parcel\watcher" rmdir /s /q "node_modules\@parcel\watcher"
if exist "node_modules\@parcel\watcher-win32-x64" rmdir /s /q "node_modules\@parcel\watcher-win32-x64"
echo   Cleaned native modules
echo.

REM ============================================================
REM STEP 12: Build .exe (ALL output visible!)
REM ============================================================
echo === STEP 12: Build .exe ===
echo ============================================================
echo   ELECTRON-BUILDER - ALL OUTPUT SHOWN BELOW
echo   This takes 5-10 minutes on first run
echo ============================================================
echo.

if exist "dist" rmdir /s /q "dist"

call npx electron-builder --win --config electron-builder.yml --config.npmRebuild=false

echo.
echo ============================================================
echo   END OF ELECTRON-BUILDER OUTPUT
echo ============================================================
echo.

REM ============================================================
REM STEP 13: Check result
REM ============================================================
echo === STEP 13: Check result ===
if exist "dist\*.exe" (
    echo.
    echo ============================================================
    echo   SUCCESS! .exe file created!
    echo ============================================================
    echo.
    dir /b "dist\*.exe"
    echo.
    for %%f in (dist\*.exe) do (
        echo   File: %%f
        echo   Size: %%~zf bytes
    )
    echo.
    echo   Opening dist folder...
    explorer "dist"
) else (
    echo.
    echo ============================================================
    echo   .exe NOT created
    echo ============================================================
    echo.
    echo   Check the errors above.
    echo.
    echo   If you see "Visual Studio" error, run install-vs-buildtools.bat
    echo   If you see other errors, copy them and send to me.
)

echo.
echo ============================================================
echo   Script finished
echo ============================================================
echo.
pause

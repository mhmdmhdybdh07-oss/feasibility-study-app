@echo off
REM ============================================================
REM   Build .exe for Feasibility Study App on Windows
REM   Enhanced version with full logging and error reporting
REM ============================================================
setlocal enabledelayedexpansion

title Build Feasibility Study App (.exe) - Enhanced

REM Go to script directory
cd /d "%~dp0"

REM Record start time
set BUILD_START=%DATE% %TIME%

REM Create log file
set LOGFILE=build-log.txt
echo Build started at %BUILD_START% > %LOGFILE%
echo ======================================= >> %LOGFILE%

echo.
echo ============================================================
echo   Build Feasibility Study App (.exe)
echo ============================================================
echo.
echo   Path:  %CD%
echo   Start: %BUILD_START%
echo   Log:   %LOGFILE%
echo.

REM ============================================================
REM [1] Check prerequisites
REM ============================================================
echo [1/9] Checking prerequisites...
echo. >> %LOGFILE%
echo [1/9] Checking prerequisites... >> %LOGFILE%

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo   [ERROR] Node.js is NOT installed!
    echo   [ERROR] Node.js is NOT installed! >> %LOGFILE%
    echo   Install Node.js 20+ from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo   [OK] Node.js: %NODE_VER%
echo   [OK] Node.js: %NODE_VER% >> %LOGFILE%

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo   [ERROR] npm is NOT available!
    echo   [ERROR] npm is NOT available! >> %LOGFILE%
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo   [OK] npm: %NPM_VER%
echo   [OK] npm: %NPM_VER% >> %LOGFILE%

REM Check VS Build Tools (optional but recommended)
where cl >nul 2>nul
if errorlevel 1 (
    echo   [WARN] VS C++ compiler (cl.exe) not in PATH
    echo   [WARN] This is OK if npmRebuild=false is used
    echo   [WARN] VS C++ compiler not in PATH >> %LOGFILE%
) else (
    echo   [OK] VS Build Tools: available
    echo   [OK] VS Build Tools: available >> %LOGFILE%
)

REM ============================================================
REM [2] Check project files
REM ============================================================
echo.
echo [2/9] Checking project files...
echo. >> %LOGFILE%
echo [2/9] Checking project files... >> %LOGFILE%

set MISSING=0
for %%f in (package.json next.config.ts electron\main.js electron-builder.yml prisma\schema.prisma) do (
    if not exist "%%f" (
        echo   [ERROR] %%f NOT found!
        echo   [ERROR] %%f NOT found! >> %LOGFILE%
        set /a MISSING+=1
    ) else (
        echo   [OK] %%f
        echo   [OK] %%f >> %LOGFILE%
    )
)
if !MISSING! gtr 0 (
    echo.
    echo   [ERROR] !MISSING! files are missing!
    echo   Run this script from the project root.
    pause
    exit /b 1
)

REM Check for icon.ico
if not exist "public\icons\icon.ico" (
    echo   [WARN] public\icons\icon.ico NOT found!
    echo   [WARN] Will try to generate it...
    echo   [WARN] icon.ico NOT found >> %LOGFILE%
) else (
    echo   [OK] public\icons\icon.ico
    echo   [OK] icon.ico found >> %LOGFILE%
)

REM ============================================================
REM [3] Setup .env file
REM ============================================================
echo.
echo [3/9] Setting up environment...
echo. >> %LOGFILE%
echo [3/9] Setting up environment... >> %LOGFILE%

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo   [OK] Created .env from .env.example
        echo   [OK] Created .env from .env.example >> %LOGFILE%
    ) else (
        echo DATABASE_URL="file:./db/custom.db" > .env
        echo   [OK] Created new .env
        echo   [OK] Created new .env >> %LOGFILE%
    )
) else (
    echo   [OK] .env already exists
    echo   [OK] .env already exists >> %LOGFILE%
)

REM ============================================================
REM [4] Install dependencies
REM ============================================================
echo.
echo [4/9] Installing dependencies...
echo. >> %LOGFILE%
echo [4/9] Installing dependencies... >> %LOGFILE%

if exist "node_modules" (
    echo   [INFO] node_modules exists. Skipping install.
    echo   [INFO] node_modules exists. Skipping install. >> %LOGFILE%
) else (
    echo   [INFO] Installing... may take several minutes
    echo   [INFO] Installing... >> %LOGFILE%
    call npm install --legacy-peer-deps >> %LOGFILE% 2>&1
    if errorlevel 1 (
        echo   [ERROR] Failed to install dependencies!
        echo   [ERROR] Failed to install dependencies! >> %LOGFILE%
        echo.
        echo   See %LOGFILE% for details
        pause
        exit /b 1
    )
)
echo   [OK] Dependencies installed
echo   [OK] Dependencies installed >> %LOGFILE%

REM ============================================================
REM [5] Setup database
REM ============================================================
echo.
echo [5/9] Setting up database...
echo. >> %LOGFILE%
echo [5/9] Setting up database... >> %LOGFILE%

if not exist "db" mkdir "db"

echo   [INFO] Applying Prisma schema...
call npx prisma db push >> %LOGFILE% 2>&1
if errorlevel 1 (
    echo   [WARN] db push failed, retrying...
    set DATABASE_URL=file:./db/custom.db
    call npx prisma db push >> %LOGFILE% 2>&1
    if errorlevel 1 (
        echo   [ERROR] Database setup failed!
        echo   [ERROR] Database setup failed! >> %LOGFILE%
        pause
        exit /b 1
    )
)

echo   [INFO] Generating Prisma client...
call npx prisma generate >> %LOGFILE% 2>&1
if errorlevel 1 (
    echo   [ERROR] Failed to generate Prisma client!
    echo   [ERROR] Failed to generate Prisma client! >> %LOGFILE%
    pause
    exit /b 1
)
echo   [OK] Database ready
echo   [OK] Database ready >> %LOGFILE%

REM ============================================================
REM [6] Build Next.js (standalone)
REM ============================================================
echo.
echo [6/9] Building Next.js (standalone)...
echo. >> %LOGFILE%
echo [6/9] Building Next.js (standalone)... >> %LOGFILE%
echo   [INFO] This step takes 3-5 minutes...

REM Clean previous build
if exist ".next" rmdir /s /q ".next"
if exist "out" rmdir /s /q "out"

set NEXTAUTH_SECRET=build-secret-%RANDOM%
set NEXTAUTH_URL=http://localhost:3000
set DATABASE_URL=file:./db/custom.db

echo   [INFO] Running: npx next build --turbopack
echo   [INFO] Running: npx next build --turbopack >> %LOGFILE%
call npx next build --turbopack >> %LOGFILE% 2>&1
if errorlevel 1 (
    echo   [WARN] Turbopack build failed. Trying webpack mode...
    echo   [WARN] Turbopack failed, trying webpack >> %LOGFILE%
    call npx next build --webpack >> %LOGFILE% 2>&1
    if errorlevel 1 (
        echo   [ERROR] Next.js build failed!
        echo   [ERROR] Next.js build failed! >> %LOGFILE%
        echo.
        echo   See %LOGFILE% for details
        pause
        exit /b 1
    )
    echo   [INFO] Running post-build copy script...
    node scripts\post-build.js >> %LOGFILE% 2>&1
)

REM Always run post-build script to ensure static files are copied
echo   [INFO] Running post-build copy script...
node scripts\post-build.js >> %LOGFILE% 2>&1

REM Verify standalone was created
if not exist ".next\standalone\server.js" (
    echo   [ERROR] .next\standalone\server.js NOT found!
    echo   [ERROR] standalone build failed >> %LOGFILE%
    echo.
    echo   The build did not produce a standalone server.
    echo   Check %LOGFILE% for the actual error.
    pause
    exit /b 1
)
echo   [OK] Standalone server created
echo   [OK] Standalone server created >> %LOGFILE%

REM Copy static files if missing
if not exist ".next\standalone\.next\static" (
    echo   [INFO] Copying .next\static to standalone...
    xcopy /E /I /Y /Q ".next\static" ".next\standalone\.next\static" >nul
)
if not exist ".next\standalone\public" (
    echo   [INFO] Copying public folder to standalone...
    xcopy /E /I /Y /Q "public" ".next\standalone\public" >nul
)
echo   [OK] Static files ready
echo   [OK] Static files ready >> %LOGFILE%

REM ============================================================
REM [7] Setup Electron in standalone folder
REM ============================================================
echo.
echo [7/9] Setting up Electron...
echo. >> %LOGFILE%
echo [7/9] Setting up Electron... >> %LOGFILE%

cd .next\standalone

REM Create package.json if not exists
if not exist "package.json" (
    echo {"name":"feasibility-app","version":"1.0.0","main":"electron/main.js"} > package.json
    echo   [OK] Created package.json
    echo   [OK] Created package.json >> %LOGFILE%
) else (
    echo   [OK] package.json exists
    echo   [OK] package.json exists >> %LOGFILE%
)

REM Install electron and electron-builder
if not exist "node_modules\electron-builder" (
    echo   [INFO] Installing electron and electron-builder...
    echo   [INFO] Installing electron-builder... >> %LOGFILE%
    call npm install electron electron-builder --save-dev --legacy-peer-deps >> %LOGFILE% 2>&1
    if errorlevel 1 (
        echo   [ERROR] Failed to install Electron!
        echo   [ERROR] Failed to install Electron! >> %LOGFILE%
        pause
        exit /b 1
    )
) else (
    echo   [OK] electron-builder already installed
    echo   [OK] electron-builder already installed >> %LOGFILE%
)

REM Copy electron files
echo   [INFO] Copying Electron files...
if not exist "electron" mkdir "electron"
copy /Y "..\..\electron\main.js" "electron\main.js" >nul
copy /Y "..\..\electron\preload.js" "electron\preload.js" >nul
if exist "..\..\electron\README.md" copy /Y "..\..\electron\README.md" "electron\README.md" >nul

REM Copy electron-builder.yml
copy /Y "..\..\electron-builder.yml" "electron-builder.yml" >nul
echo   [OK] electron-builder.yml copied

REM Make sure public folder exists with icons
if not exist "public\icons" mkdir "public\icons"
if exist "..\..\public\icons\icon-192.png" copy /Y "..\..\public\icons\icon-192.png" "public\icons\" >nul
if exist "..\..\public\icons\icon-512.png" copy /Y "..\..\public\icons\icon-512.png" "public\icons\" >nul
if exist "..\..\public\icons\icon.ico" copy /Y "..\..\public\icons\icon.ico" "public\icons\" >nul

REM Ensure db directory exists
if not exist "db" mkdir "db"

REM Remove @parcel/watcher (native module, only needed for dev)
echo   [INFO] Removing dev-only native modules...
if exist "node_modules\@parcel\watcher" (
    rmdir /s /q "node_modules\@parcel\watcher"
    echo   [OK] Removed @parcel/watcher
    echo   [OK] Removed @parcel/watcher >> %LOGFILE%
)
if exist "node_modules\@parcel\watcher-win32-x64" (
    rmdir /s /q "node_modules\@parcel\watcher-win32-x64"
    echo   [OK] Removed @parcel/watcher-win32-x64
)

REM Verify icon exists
if not exist "public\icons\icon.ico" (
    echo   [WARN] icon.ico not found! Will use PNG.
    echo   [WARN] icon.ico not found >> %LOGFILE%
) else (
    echo   [OK] icon.ico ready
    echo   [OK] icon.ico ready >> %LOGFILE%
)

echo   [OK] Electron ready
echo   [OK] Electron ready >> %LOGFILE%

REM ============================================================
REM [8] Build .exe
REM ============================================================
echo.
echo [8/9] Building .exe installer...
echo. >> %LOGFILE%
echo [8/9] Building .exe installer... >> %LOGFILE%
echo   [INFO] This step takes 5-10 minutes...
echo.

REM Clean previous dist
if exist "dist" rmdir /s /q "dist"

REM Build for Windows - with full logging
echo   [INFO] Running: npx electron-builder --win
echo   [INFO] Command: npx electron-builder --win --config electron-builder.yml --config.npmRebuild=false >> %LOGFILE%
echo.

REM Run electron-builder with output to both console AND log file
call npx electron-builder --win --config electron-builder.yml --config.npmRebuild=false 2>&1 | tee -a %LOGFILE%

REM Check if dist folder was created
if not exist "dist" (
    echo.
    echo   [WARN] dist folder not created. Trying alternative...
    echo   [WARN] First attempt failed >> %LOGFILE%
    echo.
    call npx electron-builder --win --config electron-builder.yml --config.npmRebuild=false --config.buildDependenciesFromSource=false 2>&1 | tee -a %LOGFILE%
)

REM ============================================================
REM [9] Verify output
REM ============================================================
echo.
echo [9/9] Verifying output...
echo. >> %LOGFILE%
echo [9/9] Verifying output... >> %LOGFILE%

set EXE_FOUND=0
if exist "dist" (
    echo   [OK] dist folder exists: %CD%\dist
    echo   [OK] dist folder exists >> %LOGFILE%
    echo.
    echo   Contents of dist:
    dir /b "dist" 2>nul
    echo.
    for %%f in (dist\*.exe) do (
        set EXE_FOUND=1
        echo   [OK] .exe found: %%f
        echo   [OK] .exe found: %%f >> %LOGFILE%
        echo   [OK] Size: %%~zf bytes
    )
)

if !EXE_FOUND!==0 (
    echo.
    echo   ============================================================
    echo   [ERROR] No .exe file was created!
    echo   ============================================================
    echo.
    echo   The build failed. The most common causes are:
    echo.
    echo   1. Native module compilation failed
    echo      - Even with VS Build Tools, some modules may fail
    echo      - Check the log file: %LOGFILE%
    echo.
    echo   2. Missing dependencies
    echo      - Open %LOGFILE% and search for "error" or "Error"
    echo.
    echo   3. Antivirus blocking
    echo      - Temporarily disable Windows Defender / antivirus
    echo      - Add project folder to exclusions
    echo.
    echo   4. Disk space
    echo      - Ensure at least 3 GB free space
    echo.
    echo   ============================================
    echo   ALTERNATIVE SOLUTIONS:
    echo   ============================================
    echo.
    echo   A) Use GitHub Actions (RECOMMENDED):
    echo      - No local build needed
    echo      - See DEPLOY-GUIDE.md
    echo.
    echo   B) Use PWA (works immediately):
    echo      - Run: run-windows.bat
    echo      - Open Chrome/Edge
    echo      - Click "Install" in address bar
    echo.
    echo   C) Check the log file for details:
    echo      type %LOGFILE%
    echo.
    cd /d "%~dp0"
    echo   Log file location: %CD%\%LOGFILE%
    echo.
    pause
    exit /b 1
)

REM ============================================================
REM Done
REM ============================================================
echo.
echo ============================================================
echo   BUILD COMPLETED SUCCESSFULLY!
echo ============================================================
echo.

for %%f in (dist\*.exe) do (
    set EXE_SIZE=%%~zf
    set /a EXE_MB=!EXE_SIZE! / 1048576
    echo   .exe file: %%f
    echo   Size: !EXE_MB! MB
    echo   .exe: %%f >> %LOGFILE%
)

echo.
echo   Build info:
echo   Project:  %~dp0
echo   .exe:     %CD%\dist\
echo   Start:    %BUILD_START%
echo   End:      %DATE% %TIME%
echo   Log:      %~dp0%LOGFILE%
echo.
echo How to use:
echo   1. Right-click the .exe - Run as administrator
echo   2. Follow installation wizard
echo   3. Shortcut on Desktop + Start menu
echo.

REM Copy log to project root
copy /Y %LOGFILE% "%~dp0\build-log.txt" >nul 2>nul

REM Open dist folder
echo Opening dist folder...
explorer "dist"

echo.
echo Log file saved to: %~dp0build-log.txt
echo.
pause
exit /b 0

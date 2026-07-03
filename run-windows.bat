@echo off
cd /d "%~dp0"
title Feasibility App

echo ============================================================
echo   Feasibility Study Builder
echo ============================================================
echo.
echo   Step 0: Script started
echo   Path: %CD%
echo.
pause

echo ============================================================
echo   Step 1: Looking for Node.js
echo ============================================================
echo.

echo   Checking: C:\Program Files\nodejs\node.exe
if exist "C:\Program Files\nodejs\node.exe" (
    echo   FOUND!
    set "NODE_EXE=C:\Program Files\nodejs\node.exe"
    set "NPM_CMD=C:\Program Files\nodejs\npm.cmd"
    goto :found
)
echo   Not found here.

echo.
echo   Checking: C:\Program Files (x86)\nodejs\node.exe
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    echo   FOUND!
    set "NODE_EXE=C:\Program Files (x86)\nodejs\node.exe"
    set "NPM_CMD=C:\Program Files (x86)\nodejs\npm.cmd"
    goto :found
)
echo   Not found here.

echo.
echo   Checking: %LOCALAPPDATA%\Programs\nodejs\node.exe
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    echo   FOUND!
    set "NODE_EXE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
    set "NPM_CMD=%LOCALAPPDATA%\Programs\nodejs\npm.cmd"
    goto :found
)
echo   Not found here.

echo.
echo   Checking PATH...
node --version
if errorlevel 1 (
    echo.
    echo   ============================================================
    echo   ERROR: Node.js NOT FOUND!
    echo   ============================================================
    echo.
    echo   Install Node.js from: https://nodejs.org
    echo   Then restart computer and run again.
    echo.
    pause
    exit /b 1
)
set "NODE_EXE=node"
set "NPM_CMD=npm"
goto :found

:found
echo.
echo   Node.js found: %NODE_EXE%
echo   Version:
"%NODE_EXE%" --version
echo.
pause

echo ============================================================
echo   Step 2: Check npm
echo ============================================================
echo.
echo   npm version:
call "%NPM_CMD%" --version
if errorlevel 1 (
    echo   ERROR: npm not working!
    pause
    exit /b 1
)
echo.
echo   npm OK.
pause

echo ============================================================
echo   Step 3: Create .env
echo ============================================================
if not exist ".env" (
    echo DATABASE_URL="file:./db/custom.db" > .env
    echo   Created .env
) else (
    echo   .env exists
)
pause

echo ============================================================
echo   Step 4: Create db folder
echo ============================================================
if not exist "db" mkdir "db"
echo   Done.
pause

echo ============================================================
echo   Step 5: Install dependencies
echo ============================================================
echo.
if exist "node_modules\next" (
    echo   node_modules exists - skipping
    goto :deps_done
)

echo   Installing... this takes 5-10 minutes.
echo.
call "%NPM_CMD%" install --legacy-peer-deps
if errorlevel 1 (
    echo.
    echo   ERROR: install failed!
    pause
    exit /b 1
)

:deps_done
echo.
echo   Dependencies OK.
pause

echo ============================================================
echo   Step 6: Setup database
echo ============================================================
echo   Running prisma generate...
call "%NPM_CMD%" exec prisma generate
echo.
echo   Running prisma db push...
call "%NPM_CMD%" exec prisma db push --accept-data-loss
echo.
echo   Database OK.
pause

echo ============================================================
echo   Step 7: Start the app
echo ============================================================
echo.
echo   The app will start now.
echo   URL: http://localhost:3000
echo.
echo   Browser opens in 15 seconds.
echo   To stop: Ctrl+C
echo.
pause

start /b cmd /c "timeout /t 15 >nul && start http://localhost:3000"
call "%NPM_CMD%" exec next dev -p 3000 --turbopack

echo.
echo   App stopped.
pause

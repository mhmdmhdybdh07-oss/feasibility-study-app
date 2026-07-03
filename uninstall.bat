@echo off
REM ============================================================
REM  Uninstall previous version of Feasibility Study App
REM  Removes: node_modules, .next, db, .env, dist
REM  Keeps: source code (so you can rebuild)
REM ============================================================
setlocal enabledelayedexpansion

title Uninstall Previous Version

cd /d "%~dp0"

echo.
echo ============================================================
echo   Uninstall Previous Version
echo ============================================================
echo.
echo   This will remove:
echo   - node_modules (dependencies)
echo   - .next (build cache)
echo   - .next\standalone (standalone build)
echo   - dist (.exe files)
echo   - db (database - your projects will be lost!)
echo   - .env (environment file)
echo   - build-log.txt
echo.
echo   Your source code will NOT be touched.
echo.
set /p confirm="Continue? This cannot be undone! (y/N): "
if /i not "%confirm%"=="y" (
    echo   Cancelled.
    pause
    exit /b 0
)

echo.
echo   [1/7] Stopping any running processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im next-server.exe 2>nul
taskkill /f /im electron.exe 2>nul
timeout /t 2 >nul
echo   Done.

echo   [2/7] Removing node_modules...
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo   Removed node_modules
) else (
    echo   node_modules not found
)

echo   [3/7] Removing .next (build cache)...
if exist ".next" (
    rmdir /s /q ".next"
    echo   Removed .next
) else (
    echo   .next not found
)

echo   [4/7] Removing dist (.exe files)...
if exist "dist" (
    rmdir /s /q "dist"
    echo   Removed dist
) else (
    echo   dist not found
)

echo   [5/7] Removing db (database)...
if exist "db" (
    rmdir /s /q "db"
    echo   Removed db (your projects are deleted!)
) else (
    echo   db not found
)

echo   [6/7] Removing .env and logs...
if exist ".env" del /q ".env"
if exist "build-log.txt" del /q "build-log.txt"
if exist "dev.log" del /q "dev.log"
if exist "server.log" del /q "server.log"
echo   Done.

echo   [7/7] Removing package-lock.json (optional)...
if exist "package-lock.json" del /q "package-lock.json"
echo   Done.

echo.
echo ============================================================
echo   Uninstall Complete!
echo ============================================================
echo.
echo   To install fresh:
echo   1. Download the new ZIP package
echo   2. Extract to this folder (or a new folder)
echo   3. Run: run-windows.bat  (for PWA/dev mode)
echo      OR: build-all.bat      (to build .exe)
echo.
pause
exit /b 0

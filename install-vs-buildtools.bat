@echo off
REM ============================================================
REM  Install Visual Studio Build Tools (for native module compilation)
REM  Required by: @parcel/watcher, sharp, and other native modules
REM ============================================================
setlocal

title Install VS Build Tools

echo.
echo ============================================================
echo   Install Visual Studio Build Tools
echo ============================================================
echo.
echo This will install the C++ Build Tools needed to compile
echo native Node.js modules for Electron.
echo.
echo Size: ~3-5 GB download
echo Time: ~15-30 minutes
echo.
echo After installation, restart your computer and run build.bat again.
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" exit /b 0

echo.
echo [1/3] Downloading Visual Studio Build Tools installer...
echo.

REM Download the installer
set INSTALLER=vs_BuildTools.exe
set URL=https://aka.ms/vs/17/release/vs_BuildTools.exe

powershell -Command "& { try { Invoke-WebRequest -Uri '%URL%' -OutFile '%INSTALLER%' -UseBasicParsing } catch { Write-Host 'Download failed: ' $_.Exception.Message; exit 1 } }"

if not exist "%INSTALLER%" (
    echo.
    echo [ERROR] Failed to download installer.
    echo.
    echo Download manually from:
    echo https://visualstudio.microsoft.com/visual-cpp-build-tools/
    echo.
    echo Run the installer, select "Desktop development with C++",
    echo then restart your computer.
    pause
    exit /b 1
)

echo [OK] Installer downloaded: %INSTALLER%
echo.

echo [2/3] Running installer...
echo.
echo NOTE: In the installer, make sure to select:
echo   - "Desktop development with C++" workload
echo   - Click "Install" (default options are fine)
echo.

REM Run installer with C++ workload
"%INSTALLER%" --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended --passive --norestart

if errorlevel 1 (
    echo.
    echo [WARN] Installer returned an error.
    echo You may need to run it manually:
    echo   1. Run %INSTALLER%
    echo   2. Select "Desktop development with C++"
    echo   3. Click Install
    echo   4. Restart computer
) else (
    echo.
    echo [OK] Installation completed!
)

echo.
echo [3/3] Cleanup...
del /q "%INSTALLER%" 2>nul

echo.
echo ============================================================
echo   Done!
echo ============================================================
echo.
echo Next steps:
echo   1. Restart your computer (important!)
echo   2. Run build.bat again
echo.
pause
exit /b 0

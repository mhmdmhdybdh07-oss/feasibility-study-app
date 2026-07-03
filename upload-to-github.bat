@echo off
REM ============================================================
REM  Upload to GitHub - Enhanced version
REM  Handles authentication and common errors
REM ============================================================
setlocal enabledelayedexpansion

cd /d "%~dp0"
title Upload to GitHub

echo.
echo ============================================================
echo   Upload Project to GitHub
echo ============================================================
echo.

REM Check git
git --version >nul 2>&1
if errorlevel 1 (
    echo   ERROR: Git is NOT installed!
    echo.
    echo   SOLUTIONS (choose one):
    echo.
    echo   1. Install Git: https://git-scm.com/downloads
    echo.
    echo   2. Use GitHub Desktop (easier, no commands):
    echo      https://desktop.github.com/
    echo.
    echo   3. Read UPLOAD-GUIDE.md for 4 different methods
    echo.
    pause
    exit /b 1
)

echo   Git is installed:
git --version
echo.

REM Check git config
echo   Checking git configuration...
git config user.name >nul 2>&1
if errorlevel 1 (
    echo   Git user.name not set!
    echo.
    set /p GIT_NAME="Enter your GitHub username: "
    git config --global user.name "!GIT_NAME!"
    echo   Set user.name to: !GIT_NAME!
    echo.
)

git config user.email >nul 2>&1
if errorlevel 1 (
    echo   Git user.email not set!
    echo.
    set /p GIT_EMAIL="Enter your GitHub email: "
    git config --global user.email "!GIT_EMAIL!"
    echo   Set user.email to: !GIT_EMAIL!
    echo.
)

echo   Git is configured.
echo.

REM Ask for repository URL
echo ============================================================
echo   Enter your GitHub repository URL
echo ============================================================
echo.
echo   Format: https://github.com/USERNAME/feasibility-study-app.git
echo.
echo   IMPORTANT: Create an EMPTY repository first on GitHub!
echo   Go to: https://github.com/new
echo   - Do NOT add README, .gitignore, or license
echo.
set /p REPO_URL="GitHub URL: "

if "%REPO_URL%"=="" (
    echo   ERROR: No URL provided!
    pause
    exit /b 1
)

echo.
echo   Repository: %REPO_URL%
echo.
set /p confirm="Continue? (y/N): "
if /i not "%confirm%"=="y" (
    echo   Cancelled.
    pause
    exit /b 0
)

echo.
echo ============================================================
echo   Step 1/5: Initialize git
echo ============================================================
git init
git branch -M main
echo   Done.
echo.

echo ============================================================
echo   Step 2/5: Add all files
echo ============================================================
echo   Adding files (1-2 minutes)...
git add -A
echo   Done.
echo.

echo ============================================================
echo   Step 3/5: Commit
echo ============================================================
git commit -m "Initial commit - Feasibility Study App"
if errorlevel 1 (
    echo   WARNING: Commit had issues (may be OK)
)
echo   Done.
echo.

echo ============================================================
echo   Step 4/5: Add remote
echo ============================================================
git remote remove origin 2>nul
git remote add origin %REPO_URL%
echo   Done.
echo.

echo ============================================================
echo   Step 5/5: Upload to GitHub
echo ============================================================
echo   Uploading... this takes 5-15 minutes.
echo   DO NOT close this window!
echo.
echo   If asked for username: enter your GitHub username
echo   If asked for password: use Personal Access Token (NOT your password!)
echo   Get token: GitHub -^> Settings -^> Developer settings -^>
echo             Personal access tokens -^> Generate (select 'repo')
echo.
pause

git push -u origin main
if errorlevel 1 (
    echo.
    echo   ============================================================
    echo   Upload FAILED!
    echo   ============================================================
    echo.
    echo   Common fixes:
    echo.
    echo   1. Wrong URL - check the repository URL
    echo.
    echo   2. Authentication failed:
    echo      - Use Personal Access Token as password
    echo      - Get it from GitHub Settings
    echo.
    echo   3. Repository not empty:
    echo      - Delete repository and create new EMPTY one
    echo.
    echo   4. Try GitHub Desktop instead:
    echo      https://desktop.github.com/
    echo.
    echo   5. Read UPLOAD-GUIDE.md for step-by-step help
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   SUCCESS! Project uploaded!
echo ============================================================
echo.
echo   Your repo: %REPO_URL%
echo.
echo   Next steps:
echo   1. Go to Actions tab on GitHub
echo   2. Click "Build Desktop App"
echo   3. Click "Run workflow"
echo   4. Wait 15-20 minutes
echo   5. Download .exe from Artifacts
echo.
pause

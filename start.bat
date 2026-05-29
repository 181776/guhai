@echo off
if /i "%~1"=="_run_" goto run
start cmd /k "%~f0" _run_
exit /b

:run
cd /d "%~dp0"

echo.
echo ========================================
echo   Gu Hai Da Lu - Local Server
echo ========================================
echo.

where node >nul 2>&1
if not %errorlevel%==0 (
  echo [ERROR] Node not found.
  echo Install LTS from https://nodejs.org then run start.bat again.
  echo.
  goto end
)

node server.js
if not %errorlevel%==0 (
  echo.
  echo [ERROR] Server failed. Close apps using port 3000 and retry.
  echo.
  goto end
)

echo.
echo Server stopped.

:end
echo.
pause
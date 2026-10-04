@echo off
REM Fully detached startup for Karigor Decore
setlocal enabledelayedexpansion

set ROOT=C:\coding\learning\projects\karigor_Decoreweb
set LOGS=%ROOT%\.logs
if not exist "%LOGS%" mkdir "%LOGS%"

REM Kill stale processes on our ports
for %%P in (5000 5173) do (
  for /f "tokens=5" %%I in ('netstat -ano ^| findstr ":%%P " ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%I /F >nul 2>&1
  )
)
timeout /t 1 /nobreak >nul

REM Start API (shim; swap to real backend when MongoDB fixed)
cd /d "%ROOT%\backend"
start "Karigor API" /B node dev-api-shim.js >> "%LOGS%\api.log" 2>&1

REM Start Vite
cd /d "%ROOT%\frontend"
start "Karigor Web" /B node node_modules\vite\bin\vite.js --host --port 5173 --strictPort >> "%LOGS%\web.log" 2>&1

echo [%date% %time%] started >> "%LOGS%\launcher.log"
exit /b 0
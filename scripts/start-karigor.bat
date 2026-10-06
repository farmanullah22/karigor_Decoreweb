@echo off
set ROOT=C:\coding\learning\projects\karigor_Decoreweb
if not exist "%ROOT%\.logs" mkdir "%ROOT%\.logs"
for %%P in (5000 5173) do (
  for /f "tokens=5" %%I in ('netstat -ano ^| findstr ":%%P " ^| findstr LISTENING 2^>nul') do (
    taskkill /PID %%I /F >nul 2>&1
  )
)
timeout /t 1 /nobreak >nul
cd /d "%ROOT%\backend"
start "" /B node dev-api-shim.js >> "%ROOT%\.logs\api.log" 2>&1
cd /d "%ROOT%\frontend"
start "" /B node node_modules\vite\bin\vite.js --host --port 5173 --strictPort >> "%ROOT%\.logs\web.log" 2>&1
exit /b 0

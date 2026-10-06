@echo off
REM Stops the Karigor Decore development servers (ports 5000 and 5173).

for %%P in (5000 5173) do (
  for /f "tokens=5" %%I in ('netstat -ano ^| findstr ":%%P " ^| findstr LISTENING') do (
    echo stopping pid %%I on port %%P
    taskkill /PID %%I /F >nul 2>&1
  )
)
echo [%date% %time%] Karigor dev servers stopped.
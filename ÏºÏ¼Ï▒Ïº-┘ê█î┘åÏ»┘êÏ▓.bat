@echo off
chcp 65001 >nul
title Quran Noor - Local Server
cd /d "%~dp0public\app"

echo.
echo   در حال راه‌اندازی سرور محلی برای «قرآن نور»...
echo.

where python >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:8000/index.html
    python -m http.server 8000
    goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
    start "" http://localhost:8000/index.html
    py -m http.server 8000
    goto :eof
)

echo پایتون پیدا نشد. لطفاً Python را از python.org نصب کنید
echo یا این پوشه را با افزونه Live Server در VS Code باز کنید.
pause

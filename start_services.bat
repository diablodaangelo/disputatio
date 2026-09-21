@echo off
title Disputatio - AI Services Launcher
echo ============================================================
echo      DISPUTATIO - MENJALANKAN SERVICE AI & QUEUE WORKER
echo ============================================================
echo.

REM 1. Cek direktori
cd /d "c:\laragon\www\disputatio"

REM 2. Jalankan FastAPI di jendela terminal terpisah
echo [1/2] Menjalankan AI FastAPI Service (Port 8001)...
start "Disputatio FastAPI AI Service" cmd /k "cd ai_service && C:\laragon\bin\python\python-3.10\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload"

REM 3. Jalankan Laravel Queue Worker di jendela terminal terpisah
echo [2/2] Menjalankan Laravel Queue Worker...
start "Disputatio Queue Worker" cmd /k "C:\laragon\bin\php\php-8.4.23-nts-Win32-vs17-x64\php.exe artisan queue:work --tries=3 --timeout=300"

echo.
echo ============================================================
echo   SEMUA SERVICE AI SUDAH AKTIF!
echo   - FastAPI Service  : http://127.0.0.1:8001
echo   - Queue Worker     : Berjalan memproses antrean AI
echo.
echo   Pastikan Laragon (Apache & MySQL) juga dalam status START.
echo ============================================================
pause

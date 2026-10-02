@echo off
title LANDSAFE-NER Startup
echo =====================================================================
echo    LANDSAFE-NER: AI-Powered Landslide Early Warning & Risk System
echo =====================================================================
echo.
echo [1/2] Starting Django REST API Backend on http://127.0.0.1:8000/ ...
start "LANDSAFE-NER Backend (Django)" cmd /k "cd /d d:\Risk Monitrating System\backend && python manage.py runserver 127.0.0.1:8000"

echo [2/2] Starting React Frontend Dashboard on http://localhost:5173/ ...
start "LANDSAFE-NER Frontend (React+Vite)" cmd /k "cd /d d:\Risk Monitrating System\frontend && npx vite --port 5173 --host"

echo.
echo =====================================================================
echo Services Launching:
echo   - Web Dashboard:  http://localhost:5173/
echo   - Backend API:    http://127.0.0.1:8000/api/
echo =====================================================================
timeout /t 3 >nul
start http://localhost:5173/

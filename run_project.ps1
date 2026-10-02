Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "   LANDSAFE-NER: AI-Powered Landslide Early Warning & Risk System" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/2] Starting Django REST API Backend on http://127.0.0.1:8000/ ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Risk Monitrating System\backend'; python manage.py runserver 127.0.0.1:8000"

Write-Host "[2/2] Starting React Frontend Dashboard on http://localhost:5173/ ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Risk Monitrating System\frontend'; npx vite --port 5173 --host"

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " Services Active:" -ForegroundColor Green
Write-Host "   - Web Dashboard:  http://localhost:5173/" -ForegroundColor White
Write-Host "   - Backend API:    http://127.0.0.1:8000/api/" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:5173/"

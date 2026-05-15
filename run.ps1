Write-Host "Startar EchoDraft..." -ForegroundColor Green

if (-Not (Test-Path "venv")) {
    Write-Host "Venv saknas. Skapar virtuell miljö och installerar beroenden..." -ForegroundColor Yellow
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
} else {
    .\venv\Scripts\Activate.ps1
}

Write-Host "Öppnar webbläsaren..." -ForegroundColor Cyan
Start-Process "http://127.0.0.1:5000"

Write-Host "Startar server..." -ForegroundColor Green
python app.py

@echo off
echo Startar EchoDraft...
echo.

IF NOT EXIST "venv" (
    echo Venv saknas. Kor setup.bat forst...
    pause
    exit /b 1
)

call venv\Scripts\activate.bat

python -c "import flask" 2>nul
if errorlevel 1 (
    echo Flask saknas. Kor setup.bat igen.
    pause
    exit /b 1
)

IF NOT EXIST "app.py" (
    echo app.py saknas.
    pause
    exit /b 1
)

echo Oppnar webblasaren...
start http://127.0.0.1:5000

echo Startar server...
python app.py

pause

@echo off
echo EchoDraft Setup...
echo.

IF NOT EXIST "venv" (
    echo Skapar virtuell miljo...
    python -m venv venv
    if errorlevel 1 (
        echo INSTALLATION MISSLYCKADES: Kunde inte skapa virtuell miljo.
        pause
        exit /b 1
    )
) ELSE (
    echo Virtuell miljo finns redan.
)

echo.
echo Aktiverar venv och installerar beroenden...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo INSTALLATION MISSLYCKADES: Kunde inte aktivera virtuell miljo.
    pause
    exit /b 1
)

pip install -r requirements.txt
if errorlevel 1 (
    echo INSTALLATION MISSLYCKADES: pip install misslyckades.
    pause
    exit /b 1
)

echo.
echo Setup klar!
echo Klicka valfri tangent for att avsluta...
pause >nul

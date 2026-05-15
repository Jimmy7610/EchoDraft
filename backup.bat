@echo off
setlocal enabledelayedexpansion

:: Hämta aktuell tid för mappnamnet
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%-%datetime:~12,2%
set BACKUP_DIR=EchoDraft_Backup_%TIMESTAMP%

echo.
echo ===================================================
echo   Skapar säkerhetskopia av EchoDraft (v0.1.0)
echo ===================================================
echo.

echo [1/3] Skapar backup-mapp: %BACKUP_DIR%
mkdir "%BACKUP_DIR%"

echo [2/3] Kopierar källkod och resurser (exkluderar stora filer)...
:: Kopiera alla mappar men ignorera de som innehåller stora bibliotek eller temporära filer
robocopy . "%BACKUP_DIR%" /E /XD venv .venv __pycache__ .vscode .git "EchoDraft_Backup_*" /XF *.pyc .DS_Store Thumbs.db desktop.ini *.log backup.bat >nul

:: Nu behöver vi städa inuti backup-mappen för specifika mappar enligt kraven
echo [3/3] Rensar upp exkluderade data- och röstfiler...

:: Töm data/cache men behåll .gitkeep
if exist "%BACKUP_DIR%\data\cache" (
    del /Q /S "%BACKUP_DIR%\data\cache\*.*" >nul 2>&1
    echo. > "%BACKUP_DIR%\data\cache\.gitkeep"
)

:: Töm data/uploads men behåll .gitkeep
if exist "%BACKUP_DIR%\data\uploads" (
    del /Q /S "%BACKUP_DIR%\data\uploads\*.*" >nul 2>&1
    echo. > "%BACKUP_DIR%\data\uploads\.gitkeep"
)

:: Töm voices från onnx och json men behåll README och gitkeep
if exist "%BACKUP_DIR%\voices" (
    del /Q "%BACKUP_DIR%\voices\*.onnx" >nul 2>&1
    del /Q "%BACKUP_DIR%\voices\*.json" >nul 2>&1
)

:: Töm piper från exekverbara/runtime-filer men behåll README
if exist "%BACKUP_DIR%\tools\piper" (
    del /Q /S "%BACKUP_DIR%\tools\piper\*.*" >nul 2>&1
    echo # Piper TTS > "%BACKUP_DIR%\tools\piper\README.md"
)

echo.
echo ===================================================
echo   Säkerhetskopiering slutförd!
echo   Mapp: %BACKUP_DIR%
echo ===================================================
echo.
pause

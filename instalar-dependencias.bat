@echo off
echo ========================================
echo   PATATINHA - Instalando Dependencias
echo ========================================
echo.

echo [1/2] Instalando dependencias do BACKEND...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 (
    echo ERRO ao instalar dependencias do backend!
    pause
    exit /b 1
)
echo Backend: Dependencias instaladas!
echo.

echo [2/2] Instalando dependencias do FRONTEND...
cd /d "%~dp0web"
call npm install
if errorlevel 1 (
    echo ERRO ao instalar dependencias do frontend!
    pause
    exit /b 1
)
echo Frontend: Dependencias instaladas!
echo.

echo ========================================
echo   TODAS AS DEPENDENCIAS FORAM INSTALADAS!
echo ========================================
echo.
echo Agora voce pode executar:
echo   - iniciar-backend.bat
echo   - iniciar-frontend.bat
echo.
pause

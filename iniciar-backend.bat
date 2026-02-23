@echo off
echo ========================================
echo   PATATINHA - Iniciando Backend
echo ========================================
echo.

cd /d "%~dp0backend"

echo Verificando se node_modules existe...
if not exist "node_modules" (
    echo Instalando dependencias do backend...
    call npm install
    if errorlevel 1 (
        echo ERRO ao instalar dependencias!
        pause
        exit /b 1
    )
    echo Dependencias instaladas com sucesso!
    echo.
) else (
    echo Dependencias ja instaladas.
    echo.
)

echo Iniciando servidor backend na porta 3000...
echo.
call npm run dev

pause

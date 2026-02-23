@echo off
echo ========================================
echo   PATATINHA - Iniciando Frontend
echo ========================================
echo.

cd /d "%~dp0web"

echo Verificando se node_modules existe...
if not exist "node_modules" (
    echo Instalando dependencias do frontend...
    echo Isso pode levar alguns minutos...
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

echo Iniciando servidor frontend na porta 3005...
echo.
call npm run dev

pause

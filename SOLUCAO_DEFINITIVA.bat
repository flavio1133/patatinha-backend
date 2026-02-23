@echo off
cls
echo ========================================
echo   PATATINHA - SOLUCAO DEFINITIVA
echo ========================================
echo.

echo [PASSO 1] Parando servidores antigos...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo OK!
echo.

echo [PASSO 2] Verificando dependencias do BACKEND...
cd /d "%~dp0backend"
if not exist "node_modules" (
    echo Instalando dependencias do backend...
    call npm install
    if errorlevel 1 (
        echo ERRO ao instalar dependencias do backend!
        pause
        exit /b 1
    )
)
echo Backend: Dependencias OK!
echo.

echo [PASSO 3] Verificando dependencias do FRONTEND...
cd /d "%~dp0web"
if not exist "node_modules" (
    echo Instalando dependencias do frontend...
    call npm install
    if errorlevel 1 (
        echo ERRO ao instalar dependencias do frontend!
        pause
        exit /b 1
    )
)
echo Frontend: Dependencias OK!
echo.

echo [PASSO 4] Iniciando BACKEND em nova janela...
cd /d "%~dp0backend"
start "Patatinha Backend - Porta 3000" cmd /k "npm run dev"
echo Aguardando backend iniciar...
timeout /t 8 /nobreak >nul
echo.

echo [PASSO 5] Iniciando FRONTEND em nova janela...
cd /d "%~dp0web"
start "Patatinha Frontend - Porta 3005" cmd /k "npm run dev"
echo Aguardando frontend iniciar...
timeout /t 5 /nobreak >nul
echo.

echo ========================================
echo   SERVIDORES INICIADOS COM SUCESSO!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:3005
echo.
echo Duas janelas foram abertas:
echo - Uma para o Backend (porta 3000)
echo - Uma para o Frontend (porta 3005)
echo.
echo NÃO FECHE essas janelas!
echo.
echo Aguarde 10 segundos e abra no navegador:
echo http://localhost:3005
echo.
echo Credenciais de teste:
echo Admin: admin@patatinha.com / admin123
echo.
pause

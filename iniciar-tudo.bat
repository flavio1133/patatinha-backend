@echo off
echo ========================================
echo   PATATINHA - Iniciando TUDO
echo ========================================
echo.

echo [1/2] Iniciando BACKEND...
start "Patatinha Backend" cmd /k "cd /d %~dp0backend && npm run dev"

echo Aguardando backend iniciar...
timeout /t 5 /nobreak >nul

echo [2/2] Iniciando FRONTEND...
start "Patatinha Frontend" cmd /k "cd /d %~dp0web && npm run dev"

echo.
echo ========================================
echo   SERVIDORES INICIADOS!
echo ========================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:3005
echo.
echo Aguarde alguns segundos e abra:
echo http://localhost:3005
echo.
echo Credenciais:
echo Admin: admin@patatinha.com / admin123
echo.
pause

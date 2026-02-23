@echo off
echo ========================================
echo   PATATINHA - Iniciar Servidores
echo ========================================
echo.

echo Iniciando BACKEND...
start "Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 5 /nobreak >nul

echo Iniciando FRONTEND...
start "Frontend" cmd /k "cd /d %~dp0web && npm run dev"

echo.
echo ========================================
echo   PRONTO!
echo ========================================
echo.
echo Duas janelas foram abertas.
echo Aguarde 10 segundos e acesse:
echo http://localhost:3005
echo.
echo Login: admin@patatinha.com / admin123
echo.
pause

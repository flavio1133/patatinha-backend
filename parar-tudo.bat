@echo off
echo ========================================
echo   PATATINHA - Parando Servidores
echo ========================================
echo.

echo Parando processos Node.js...
taskkill /F /IM node.exe 2>nul

if %errorlevel% == 0 (
    echo Servidores parados com sucesso!
) else (
    echo Nenhum servidor estava rodando.
)

echo.
pause

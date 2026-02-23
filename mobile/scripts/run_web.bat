@echo off
REM Script para rodar Flutter Web em desenvolvimento no Windows

echo 🐾 Iniciando Patatinha Web...

REM Obtém dependências
flutter pub get

REM Roda em modo desenvolvimento
flutter run -d chrome --web-port=8080

pause

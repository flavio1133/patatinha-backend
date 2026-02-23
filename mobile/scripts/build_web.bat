@echo off
REM Script para build do Flutter Web no Windows

echo 🐾 Construindo Patatinha para Web...

REM Limpa builds anteriores
flutter clean

REM Obtém dependências
flutter pub get

REM Build para web
flutter build web --release

echo ✅ Build concluído! Arquivos em: build\web\
echo 📦 Para servir localmente: cd build\web ^&^& python -m http.server 8080

pause

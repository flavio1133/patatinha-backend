#!/bin/bash
# Script para build do Flutter Web

echo "🐾 Construindo Patatinha para Web..."

# Limpa builds anteriores
flutter clean

# Obtém dependências
flutter pub get

# Build para web
flutter build web --release

echo "✅ Build concluído! Arquivos em: build/web/"
echo "📦 Para servir localmente: cd build/web && python -m http.server 8080"

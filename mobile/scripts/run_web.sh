#!/bin/bash
# Script para rodar Flutter Web em desenvolvimento

echo "🐾 Iniciando Patatinha Web..."

# Obtém dependências
flutter pub get

# Roda em modo desenvolvimento
flutter run -d chrome --web-port=8080

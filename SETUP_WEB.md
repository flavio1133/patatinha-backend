# 🌐 Configuração Web - Guia Completo

## ✅ O Que Foi Configurado

### 1. Porta da Interface de Gestores
- **Antes:** Porta 3001
- **Agora:** Porta 3005 ✅

### 2. Flutter Web Habilitado
- O mesmo código Flutter agora compila para Web também!
- Android, iOS e Web com **uma única base de código**

### 3. Detecção Automática de Plataforma
- O app detecta automaticamente se está na web ou mobile
- Ajusta a URL da API automaticamente

## 🚀 Como Usar

### Opção 1: App Cliente na Web (Flutter Web)

```bash
cd mobile
flutter pub get
flutter run -d chrome
```

Ou use o script:
```bash
# Windows
mobile\scripts\run_web.bat

# Linux/Mac
chmod +x mobile/scripts/run_web.sh
./mobile/scripts/run_web.sh
```

**Resultado:** App abre em `http://localhost:8080`

### Opção 2: Interface de Gestores (React)

```bash
cd web
npm install
npm run dev
```

**Resultado:** Interface abre em `http://localhost:3005`

### Opção 3: App Cliente Mobile (Android/iOS)

```bash
cd mobile
flutter pub get
flutter run
# Escolha o dispositivo
```

## 📊 Resumo das Portas

| Serviço | Porta | URL |
|:--------|:------|:----|
| Backend API | 3000 | http://localhost:3000 |
| Web Gestores (React) | 3005 | http://localhost:3005 |
| App Cliente Web (Flutter) | 8080 | http://localhost:8080 |
| App Cliente Mobile | - | Android/iOS nativo |

## 🎯 Vantagens

✅ **Código Único para Cliente**
- Desenvolve uma vez
- Funciona em Android, iOS e Web
- Atualiza tudo de uma vez

✅ **Mesma Experiência**
- Cliente vê a mesma interface
- Seja no app ou no navegador
- Funciona em qualquer dispositivo

✅ **Economia**
- Menos tempo de desenvolvimento
- Menos custos de manutenção
- Uma equipe para todas as plataformas

## 🔧 Configuração da API

O código detecta automaticamente a plataforma:

**Na Web (Flutter Web):**
```dart
baseUrl = '/api'  // Mesma origem
```

**No Mobile:**
```dart
baseUrl = 'http://localhost:3000/api'
```

Para produção, configure um proxy no servidor web ou ajuste a URL.

## 📦 Build para Produção

### App Web (Flutter)
```bash
cd mobile
flutter build web --release
# Arquivos em: build/web/
```

### Web Gestores (React)
```bash
cd web
npm run build
# Arquivos em: dist/
```

## 🎉 Pronto!

Agora você tem:
- ✅ App mobile (Android + iOS)
- ✅ App web (mesmo código!)
- ✅ Interface de gestores (React)
- ✅ Tudo usando a mesma API

**Tudo funcionando juntos!** 🚀

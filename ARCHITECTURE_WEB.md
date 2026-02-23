# 🌐 Arquitetura Web - Patatinha

## 📐 Visão Geral

O sistema Patatinha foi projetado para funcionar em **múltiplas plataformas** usando **código compartilhado** sempre que possível.

## 🏗️ Estrutura Completa

```
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js)                       │
│              API REST Única - Porta 3000                  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  • Autenticação (JWT)                              │  │
│  │  • CRM (Clientes, Pets, Prontuário)                │  │
│  │  • Agenda e Serviços                               │  │
│  │  • Estoque e PDV                                   │  │
│  │  • Gestão Financeira                                │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  WEB GESTORES │ │ APP CLIENTE  │ │ APP CLIENTE  │
│   (React)    │ │  (Flutter)   │ │  (Flutter)   │
│              │ │              │ │              │
│ Porta: 3005  │ │   Android    │ │     iOS      │
│              │ │              │ │              │
│ Desktop/     │ │   Mobile     │ │   Mobile     │
│ Tablet       │ │   Nativo     │ │   Nativo     │
└──────────────┘ └──────────────┘ └──────────────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ APP CLIENTE  │
                 │  (Flutter)   │
                 │              │
                 │     Web      │
                 │              │
                 │   Navegador  │
                 │ Porta: 8080  │
                 └──────────────┘
```

## 🎯 Três Interfaces, Uma API

### 1. Web Gestores (React) - Porta 3005
**Para quem:** Gestores, funcionários, administradores  
**Plataforma:** Navegador (Desktop/Tablet)  
**Tecnologia:** React + Vite  
**Características:**
- Interface densa e informativa
- Foco em eficiência operacional
- Dashboard administrativo completo
- Gestão de estoque, agenda, financeiro

### 2. App Cliente Mobile (Flutter) - Android/iOS
**Para quem:** Clientes finais  
**Plataforma:** Android e iOS nativos  
**Tecnologia:** Flutter  
**Características:**
- App instalado no celular
- Notificações push nativas
- Acesso offline (quando implementado)
- Experiência mobile otimizada

### 3. App Cliente Web (Flutter Web) - Porta 8080
**Para quem:** Clientes finais  
**Plataforma:** Navegador (qualquer dispositivo)  
**Tecnologia:** Flutter Web (mesmo código do mobile!)  
**Características:**
- **Mesmo código** do app mobile
- Funciona em qualquer navegador
- PWA (Progressive Web App)
- Pode ser instalado como app
- Responsivo (desktop/tablet/mobile)

## 💡 Por Que Flutter Web?

### Vantagens

✅ **Código Único**
- Desenvolve uma vez
- Funciona em Android, iOS e Web
- Atualiza tudo de uma vez

✅ **Economia**
- Menos tempo de desenvolvimento
- Menos custos de manutenção
- Uma equipe para todas as plataformas

✅ **Consistência**
- Mesma experiência em todas as plataformas
- Mesmas funcionalidades
- Mesmo design

✅ **PWA Nativo**
- Funciona como app instalado
- Notificações push (quando implementado)
- Funciona offline (quando implementado)

## 🔄 Fluxo de Dados

```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTP Request
       │
       ▼
┌─────────────┐      ┌─────────────┐
│ Flutter Web │      │  React Web  │
│  (Cliente)  │      │  (Gestores)  │
└──────┬──────┘      └──────┬───────┘
       │                    │
       │                    │
       └────────┬───────────┘
                │
                │ API REST
                │
                ▼
       ┌─────────────────┐
       │  Backend Node.js │
       │   (Porta 3000)   │
       └─────────────────┘
```

## 📱 Detecção Automática de Plataforma

O código Flutter detecta automaticamente a plataforma:

```dart
import 'package:flutter/foundation.dart' show kIsWeb;

if (kIsWeb) {
  // Está rodando na web
  baseUrl = '/api';  // Mesma origem
} else {
  // Está rodando no mobile
  baseUrl = 'http://localhost:3000/api';
}
```

## 🚀 Como Executar Tudo

### 1. Backend (Obrigatório)
```bash
cd backend
npm install
npm run dev
# http://localhost:3000
```

### 2. Web Gestores
```bash
cd web
npm install
npm run dev
# http://localhost:3005
```

### 3. App Cliente - Web
```bash
cd mobile
flutter pub get
flutter run -d chrome
# http://localhost:8080
```

### 4. App Cliente - Mobile
```bash
cd mobile
flutter pub get
flutter run
# Escolha Android ou iOS
```

## 🎨 Experiência do Usuário

### Cliente no Navegador (Flutter Web)
- Abre o site no navegador
- Mesma interface do app mobile
- Pode "instalar" como PWA
- Funciona em qualquer dispositivo

### Cliente no App Mobile
- Baixa do Play Store / App Store
- Instala no celular
- Notificações push
- Funciona offline

**Ambos têm a mesma experiência!**

## 📦 Deploy

### App Web (Flutter)
```bash
cd mobile
flutter build web --release
# Deploy build/web/ em qualquer servidor
```

### Web Gestores (React)
```bash
cd web
npm run build
# Deploy dist/ em qualquer servidor
```

### App Mobile
```bash
cd mobile
flutter build apk        # Android
flutter build ios       # iOS
# Upload nas stores
```

## ✅ Resumo

| Interface | Tecnologia | Plataforma | Porta | Usuário |
|:----------|:-----------|:-----------|:------|:--------|
| Web Gestores | React | Navegador | 3005 | Gestores |
| App Cliente Web | Flutter Web | Navegador | 8080 | Clientes |
| App Cliente Mobile | Flutter | Android/iOS | - | Clientes |
| Backend | Node.js | Servidor | 3000 | API |

**Tudo compartilha a mesma API e dados!** 🎉

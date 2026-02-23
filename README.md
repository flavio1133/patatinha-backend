# 🐾 Patatinha - App de Pet Shop

Sistema completo de gerenciamento e atendimento para pet shops, desenvolvido com tecnologias cross-platform.

## 📋 Estrutura do Projeto

```
mypet/
├── mobile/          # App Flutter (Android + iOS) - Para Clientes
├── web/             # Interface Web React - Para Gestores
├── backend/         # API Node.js + Express (Backend Único)
└── README.md        # Este arquivo
```

## 🚀 Tecnologias

### Mobile (Cross-Platform) - Para Clientes
- **Flutter** - Framework para Android e iOS
- **Dart** - Linguagem de programação

### Web - Para Gestores
- **React** - Biblioteca JavaScript
- **Vite** - Build tool moderna
- **React Router** - Roteamento
- **React Query** - Gerenciamento de estado servidor

### Backend (Único para Web + Mobile)
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização

## 📱 Funcionalidades do App Mobile

### Para Clientes
- ✅ Perfil do usuário e cadastro de pets
- ✅ Agendamento online de serviços
- ✅ Loja virtual com carrinho
- ✅ Chat in-app
- ✅ Sistema de fidelidade
- ✅ Lembretes de vacinas e vermífugos
- ✅ Histórico médico dos pets

### Para Administração (Futuro)
- ✅ Gerenciamento de estoque
- ✅ Calendário de agendamentos
- ✅ Gestão financeira
- ✅ Relatórios e analytics
- ✅ Gerenciamento de equipe

## 🛠️ Como Executar

### Backend (Obrigatório - roda primeiro)
```bash
cd backend
npm install
npm run dev
# Servidor rodará em http://localhost:3000
```

### Web Gestores (Interface para Gestores)
```bash
cd web
npm install
npm run dev
# Interface rodará em http://localhost:3005
```

### App Cliente - Mobile (Android/iOS)
```bash
cd mobile
flutter pub get
flutter run
# Escolha o dispositivo (Android/iOS)
```

### App Cliente - Web (Navegador)
```bash
cd mobile
flutter pub get
flutter run -d chrome
# App abrirá em http://localhost:8080
# Ou use: scripts\run_web.bat (Windows) / scripts/run_web.sh (Linux/Mac)
```

**Importante:** O mesmo código Flutter funciona em Android, iOS e Web!

## 🔄 Arquitetura: Uma API, Múltiplas Interfaces

O sistema foi projetado para funcionar com **uma única API** servindo múltiplas interfaces:

- **Backend (Node.js)** → API REST única
- **Web Gestores (React)** → Interface para gestores (desktop/tablet) - Porta 3005
- **App Cliente (Flutter)** → **Mesmo código** compila para:
  - 📱 Android (APK)
  - 📱 iOS (IPA)
  - 🌐 Web (HTML/CSS/JS) - Porta 8080

**Todos compartilham os mesmos dados e regras de negócio!**

### 🎯 Vantagem: Código Único

O app Flutter usa **o mesmo código** para todas as plataformas:
- ✅ Desenvolve uma vez
- ✅ Funciona em Android, iOS e Web
- ✅ Atualiza tudo de uma vez
- ✅ Economia de tempo e dinheiro
- ✅ Experiência consistente

## 📝 Status do Projeto

### ✅ Concluído
- ✅ Estrutura completa do projeto (Backend + Mobile + Web)
- ✅ 43 Regras de Negócio documentadas
- ✅ 15 Regras de Negócio implementadas
- ✅ 11 Fluxos de Usuário documentados
- ✅ 58 Histórias de Usuário documentadas
- ✅ 18 Histórias implementadas (31%)
- ✅ API REST completa
- ✅ Autenticação e autorização
- ✅ Módulos: CRM, Agenda, Estoque/PDV, Financeiro

### ⏳ Em Desenvolvimento
- ⏳ Sub-telas de agendamento (fluxo completo)
- ⏳ Tela de acompanhamento em tempo real
- ⏳ Interface web completa para gestores
- ⏳ Sistema de notificações automáticas
- ⏳ Histórias MVP pendentes (7 histórias)

### 📚 Documentação Completa

**Fase 1 - Especificação Técnica:**
- ✅ `BUSINESS_RULES.md` - 43 Regras de negócio
- ✅ `BUSINESS_RULES_IMPLEMENTATION.md` - Status de implementação
- ✅ `USER_FLOWS.md` - 11 Fluxos de usuário
- ✅ `USER_FLOWS_IMPLEMENTATION.md` - Mapeamento técnico
- ✅ `USER_STORIES.md` - 58 Histórias de usuário
- ✅ `USER_STORIES_IMPLEMENTATION.md` - Status de implementação
- ✅ `MVP_PRIORITIZATION.md` - Priorização MVP vs Futuro
- ✅ `ROADMAP.md` - Roadmap completo de desenvolvimento
- ✅ `PHASE1_COMPLETE.md` - Resumo da Fase 1

**Fase 2 - Prototipação:**
- ✅ `WIREFRAMES.md` - Wireframes de baixa fidelidade
- ✅ `WIREFRAMES_SPECIFICATIONS.md` - Especificações técnicas
- ✅ `WIREFRAMES_HIGH_FIDELITY.md` - Wireframes de alta fidelidade
- ✅ `PROTOTYPE_FLOWS.md` - Fluxos navegáveis completos
- ✅ `PROTOTYPE_INTERACTIONS.md` - Especificações de interação
- ✅ `DESIGN_SYSTEM.md` - Sistema de design completo
- ✅ `VISUAL_IDENTITY.md` - Identidade visual completa

**Fase 3 - Arquitetura Técnica:**
- ✅ `ARCHITECTURE_TECHNICAL.md` - Arquitetura técnica completa
- ✅ `PHASE3_COMPLETE.md` - Resumo da Fase 3

**Fase 4 - Implementação:**
- ✅ `IMPLEMENTATION.md` - Plano completo de implementação
- ✅ `IMPLEMENTATION_DETAILED.md` - Guia prático detalhado passo a passo
- ✅ `PHASE4_COMPLETE.md` - Resumo da Fase 4

**Fase 5 - Testes (QA):**
- ✅ `TESTING_QA.md` - Estratégia completa de testes
- ✅ `INTEGRATION_TESTS.md` - Guia prático de testes de integração
- ✅ `PHASE5_COMPLETE.md` - Resumo da Fase 5

**Arquitetura (Legado):**
- ✅ `ARCHITECTURE_WEB.md` - Arquitetura web
- ✅ `ARCHITECTURE.md` - Arquitetura geral

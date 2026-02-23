# 🏗️ Arquitetura do Sistema Patatinha

## 📐 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     PATATINHA ECOSYSTEM                      │
│                                                               │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │   PAINEL GESTOR      │◄────►│   APP CLIENTE        │    │
│  │   (Web/Tablet)       │  API │   (iOS/Android)      │    │
│  │                       │      │                       │    │
│  │ • Dashboard Admin    │      │ • Meus Pets          │    │
│  │ • Agenda Completa    │      │ • Agendamentos       │    │
│  │ • CRM Completo       │      │ • Loja Virtual       │    │
│  │ • Financeiro         │      │ • Meu Plano          │    │
│  │ • Estoque            │      │ • Histórico          │    │
│  │ • Relatórios         │      │ • Notificações       │    │
│  └──────────────────────┘      └──────────────────────┘    │
│           ▲                              ▲                   │
│           │                              │                   │
│           │      ┌──────────────┐       │                   │
│           └──────│  BACKEND API │───────┘                   │
│                  │  (Node.js)   │                            │
│                  │              │                            │
│                  │ • Autenticação│                            │
│                  │ • Autorização │                            │
│                  │ • Negócio     │                            │
│                  │ • Notificações│                            │
│                  └──────────────┘                            │
│                          │                                    │
│                          ▼                                    │
│                  ┌──────────────┐                             │
│                  │   DATABASE   │                             │
│                  │ (PostgreSQL) │                             │
│                  └──────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Sistema de Roles e Permissões

### Níveis de Acesso

#### 1. **Master (Proprietário)**
- Acesso total ao sistema
- Configurações gerais
- Dados financeiros sensíveis
- Gerenciamento de usuários

#### 2. **Gerente**
- Agenda completa
- CRM completo
- Relatórios (exceto financeiros sensíveis)
- Gerenciamento de equipe

#### 3. **Financeiro**
- Módulo financeiro completo
- Relatórios financeiros
- Notas fiscais
- Sem acesso a operações

#### 4. **Funcionário**
- Agenda própria
- Check-in/check-out
- Prontuário (leitura/escrita)
- Sem acesso a financeiro

#### 5. **Cliente**
- Apenas seus dados
- Agendamentos próprios
- Histórico próprio
- Loja virtual

## 📱 Diferenças entre Interfaces

### Painel do Gestor
- **Foco:** Eficiência operacional
- **Design:** Denso, informativo, profissional
- **Plataforma:** Web responsiva + Tablet
- **Ações:** Em lote, rápidas, atalhos

### App do Cliente
- **Foco:** Experiência e emoção
- **Design:** Clean, visual, intuitivo
- **Plataforma:** iOS + Android nativo
- **Ações:** Simples, poucos cliques

## 🔄 Sincronização em Tempo Real

Todas as ações são sincronizadas automaticamente:

- Agendamento do cliente → Bloqueia na agenda do gestor
- Check-in do gestor → Notificação ao cliente
- Venda no PDV → Atualiza estoque e financeiro
- Cadastro de vacina → Atualiza carteirinha do cliente

## 📊 Mapeamento de Funcionalidades

| Funcionalidade | Gestor | Cliente |
|:---------------|:-------|:--------|
| **CRM** | Completo (todos clientes) | Apenas próprio perfil |
| **Agenda** | Visão completa | Apenas horários livres |
| **Estoque** | Completo com custos | Apenas disponibilidade |
| **Financeiro** | Completo | Histórico próprio |
| **Prontuário** | Leitura/escrita | Apenas leitura |
| **Fotos** | Todas as fotos | Apenas do próprio pet |
| **Assinaturas** | Gestão completa | Apenas próprio plano |

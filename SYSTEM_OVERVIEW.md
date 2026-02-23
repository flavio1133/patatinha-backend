# 🎯 Visão Geral do Sistema Patatinha

## 📱 Arquitetura Dual: Gestor vs Cliente

O sistema Patatinha foi projetado com **duas interfaces distintas** que compartilham o mesmo backend:

### 🔷 **Painel do Gestor** (Web/Tablet)
- **Usuários:** Proprietários, gerentes, funcionários
- **Foco:** Eficiência operacional e controle total
- **Funcionalidades:** Todas as operações administrativas

### 🔷 **App do Cliente** (iOS/Android)
- **Usuários:** Donos de pets
- **Foco:** Experiência do usuário e fidelização
- **Funcionalidades:** Apenas dados próprios e ações do cliente

---

## 🔐 Sistema de Roles Implementado

| Role | Descrição | Acesso |
|:-----|:----------|:-------|
| **master** | Proprietário | Acesso total |
| **manager** | Gerente | Operacional completo (exceto finanças sensíveis) |
| **financial** | Financeiro | Apenas módulo financeiro |
| **employee** | Funcionário | Agenda própria, check-in, prontuário |
| **customer** | Cliente | Apenas dados próprios |

---

## 📊 Mapeamento de Funcionalidades por Interface

### 1. CRM - Gestão de Clientes e Pets

| Funcionalidade | Gestor | Cliente |
|:---------------|:-------|:--------|
| Listar clientes | ✅ Todos | ❌ Apenas próprio |
| Cadastrar pet | ✅ Qualquer cliente | ✅ Apenas próprio |
| Prontuário | ✅ Leitura/escrita | ✅ Apenas leitura |
| Vacinas | ✅ Todas | ✅ Apenas do próprio pet |
| Fotos | ✅ Todas | ✅ Apenas do próprio pet |

### 2. Agenda Inteligente

| Funcionalidade | Gestor | Cliente |
|:---------------|:-------|:--------|
| Visualizar agenda | ✅ Completa (todos profissionais) | ✅ Apenas horários livres |
| Agendar | ✅ Para qualquer cliente | ✅ Apenas para si |
| Check-in/out | ✅ Pode fazer | ❌ Recebe notificação |
| Bloquear horários | ✅ Pode fazer | ❌ Não vê bloqueados |

### 3. Estoque e PDV

| Funcionalidade | Gestor | Cliente |
|:---------------|:-------|:--------|
| Ver estoque | ✅ Completo (custos, alertas) | ✅ Apenas disponibilidade |
| Vender | ✅ PDV completo | ✅ Loja virtual (se habilitado) |
| Venda fracionada | ✅ Configura e vende | ✅ Compra quantidade desejada |
| Alertas | ✅ Recebe todos | ❌ Não recebe |

### 4. Gestão Financeira

| Funcionalidade | Gestor | Cliente |
|:---------------|:-------|:--------|
| Fluxo de caixa | ✅ Completo | ❌ Não acessa |
| Comissões | ✅ Calcula e paga | ❌ Não vê |
| Assinaturas | ✅ Gerencia planos | ✅ Gerencia próprio plano |
| Relatórios | ✅ Todos | ❌ Apenas histórico próprio |

---

## 🔄 Fluxo de Sincronização

### Exemplo 1: Agendamento
1. **Cliente** agenda banho para quarta 14h via app
2. **Backend** bloqueia horário automaticamente
3. **Gestor** vê agendamento na agenda completa
4. **Cliente** recebe confirmação por push

### Exemplo 2: Check-in
1. **Funcionário** faz check-in do pet
2. **Backend** atualiza status do agendamento
3. **Cliente** recebe notificação: "Rex chegou!"
4. **Sistema** calcula comissão automaticamente

### Exemplo 3: Venda
1. **Funcionário** vende ração no PDV
2. **Backend** baixa estoque automaticamente
3. **Sistema** cria transação financeira
4. **Cliente** recebe comprovante (se vinculado)

---

## 🎨 Diferenças de UX

### Painel do Gestor
- **Cores:** Profissionais, sóbrias
- **Layout:** Denso, muitas informações
- **Ações:** Rápidas, atalhos, ações em lote
- **Gráficos:** Analíticos, comparativos

### App do Cliente
- **Cores:** Aconchegantes, tons pastel
- **Layout:** Limpo, espaçado, foco em fotos
- **Ações:** Simples, poucos cliques
- **Visual:** Fotos grandes, memórias do pet

---

## 🚀 Rotas da API por Tipo de Usuário

### Rotas Públicas (sem autenticação)
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login

### Rotas de Cliente
- `GET /api/pets` - Apenas pets do usuário
- `GET /api/appointments` - Apenas agendamentos do usuário
- `GET /api/subscriptions` - Apenas assinatura do usuário

### Rotas de Gestor
- `GET /api/customers` - Todos os clientes
- `GET /api/admin/dashboard` - Dashboard administrativo
- `GET /api/admin/reports/consolidated` - Relatórios consolidados
- `GET /api/inventory` - Estoque completo
- `GET /api/finance` - Financeiro completo

---

## 📋 Checklist de Implementação

### ✅ Implementado
- [x] Sistema de autenticação com roles
- [x] Middleware de autorização
- [x] Rotas separadas por tipo de usuário
- [x] Dashboard diferenciado por role
- [x] Navegação adaptativa

### 🔄 Em Desenvolvimento
- [ ] Interface web para gestores
- [ ] Notificações push em tempo real
- [ ] Sincronização offline
- [ ] Gráficos interativos

### 📝 Planejado
- [ ] Autenticação 2 fatores para gestores
- [ ] Compartilhamento de pet entre tutores
- [ ] Marketplace no app do cliente
- [ ] Integração com gateways de pagamento

---

## 💡 Próximos Passos Recomendados

1. **Implementar interface web** para gestores (React/Vue)
2. **Adicionar notificações push** em tempo real
3. **Criar sistema de permissões granular** (ex: funcionário só vê própria agenda)
4. **Implementar sincronização offline** para operações críticas
5. **Adicionar gráficos e visualizações** no dashboard

---

## 📞 Suporte e Documentação

- **Backend API:** Documentação em `/backend/README.md`
- **Mobile App:** Documentação em `/mobile/README.md`
- **Arquitetura:** Este arquivo
- **Funcionalidades:** Ver arquivos `*_IMPLEMENTATION.md`

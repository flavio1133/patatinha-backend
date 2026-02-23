# 🎯 MVP vs Futuro - Priorização Final

Este documento define claramente o que é **ESSENCIAL** para o lançamento (MVP) e o que pode vir **DEPOIS** em atualizações.

## 📊 Critérios de Priorização

- 🔴 **MVP (Versão 1.0):** Sem isso o sistema não funciona ou não entrega valor mínimo
- 🟡 **Versão 1.1 - 2.0:** Importante, mas não impede o lançamento
- 🟢 **Versão 2.0+:** Diferenciais, pode esperar

---

## 🔴 MVP - VERSÃO 1.0 (O MÍNIMO VIÁVEL)

### MÓDULO 1: GESTÃO DE CLIENTES E PETS (MVP)

| ID | Funcionalidade | Motivo | Status |
|:---|:---|:---|:---|
| F001 | Cadastro de Cliente (nome, telefone) | Sem cliente, não há negócio | ✅ |
| F002 | Cadastro de Pet (nome, espécie, raça) | Pet é o centro do sistema | ✅ |
| F003 | Observações/Alertas (comportamento, alergias) | Segurança no atendimento | ✅ |
| F004 | Histórico básico de serviços | Saber o que já foi feito | ✅ |

**Total MVP CRM:** 4 funcionalidades  
**Status:** ✅ 100% Implementado

**Fica para depois:**
- 🟡 Galeria de fotos organizada (1.1)
- 🟡 Carteira de vacinação completa (1.2)
- 🟢 Aniversários com promoção automática (2.0)

---

### MÓDULO 2: AGENDA E SERVIÇOS (MVP)

| ID | Funcionalidade | Motivo | Status |
|:---|:---|:---|:---|
| F005 | Cadastro de serviços (nome, duração, preço) | Base para agendar | ⏳ Parcial |
| F006 | Cadastro de profissionais | Quem vai executar | ✅ |
| F007 | Agenda manual (gestor marca para o cliente) | Atender por telefone ainda é necessário | ✅ |
| F008 | Check-in manual (funcionário marca) | Saber quem está na loja | ✅ |
| F009 | Check-out manual (funcionário marca) | Saber quem terminou | ✅ |
| F010 | Visualização da agenda do dia | Operação diária | ✅ |

**Total MVP Agenda:** 6 funcionalidades  
**Status:** ⏳ 83% Implementado (F005 precisa CRUD completo)

**Fica para depois:**
- 🟡 Agendamento online pelo cliente (1.1)
- 🟡 Notificações automáticas (1.1)
- 🟡 Lista de espera (2.0)
- 🟢 Escolha de profissional preferido (1.1)

---

### MÓDULO 3: ESTOQUE E PDV (MVP)

| ID | Funcionalidade | Motivo | Status |
|:---|:---|:---|:---|
| F011 | Cadastro de produtos (nome, preço, estoque) | Saber o que tem na loja | ✅ |
| F012 | Controle de estoque simples (entrada/saída manual) | Não vender o que não tem | ✅ |
| F013 | PDV básico (registrar venda de produtos) | Faturar | ✅ |
| F014 | Registro de serviço no PDV (cobrar banho) | Faturar serviços | ✅ |

**Total MVP Estoque/PDV:** 4 funcionalidades  
**Status:** ✅ 100% Implementado

**Fica para depois:**
- 🟡 Controle de insumos por banho (custo) (1.2)
- 🟡 Alerta automático de estoque mínimo (1.1)
- 🟡 Venda fracionada (1.2)
- 🟢 Integração com nota fiscal (2.0)

---

### MÓDULO 4: FINANCEIRO (MVP)

| ID | Funcionalidade | Motivo | Status |
|:---|:---|:---|:---|
| F015 | Registro de vendas (já vem do PDV) | Saber quanto entrou | ✅ |
| F016 | Fluxo de caixa básico (entradas vs saídas) | Saber se tem dinheiro | ✅ |
| F017 | Comissão SIMPLES (percentual fixo para todos) | Pagar funcionários | ⏳ Parcial |

**Total MVP Financeiro:** 3 funcionalidades  
**Status:** ⏳ 67% Implementado (F017 precisa simplificar)

**Fica para depois:**
- 🟡 Comissões configuráveis por profissional (1.1)
- 🟡 Planos de assinatura (1.2)
- 🟡 DRE e relatórios gerenciais (1.2)
- 🟢 Conciliação bancária (2.0)

---

### MÓDULO 5: APP DO CLIENTE (MVP - MÍNIMO)

| ID | Funcionalidade | Motivo | Status |
|:---|:---|:---|:---|
| F018 | Visualizar agendamentos futuros | Saber quando voltar | ✅ |
| F019 | Ver histórico de serviços | Lembrar o que foi feito | ✅ |
| F020 | Ver dados do pet (nome, raça, observações) | Transparência | ✅ |

**Total MVP App Cliente:** 3 funcionalidades  
**Status:** ✅ 100% Implementado

**Fica para depois:**
- 🟡 Agendamento pelo app (1.1)
- 🟡 Fotos antes/depois (1.1)
- 🟡 Notificações push (1.1)
- 🟢 Assinatura e fidelidade (1.2)

---

## 📊 RESUMO DO MVP

| Módulo | Funcionalidades MVP | Implementadas | Status |
|:-------|:-------------------|:--------------|:-------|
| CRM | 4 | 4 | ✅ 100% |
| Agenda | 6 | 5 | ⏳ 83% |
| Estoque/PDV | 4 | 4 | ✅ 100% |
| Financeiro | 3 | 2 | ⏳ 67% |
| App Cliente | 3 | 3 | ✅ 100% |
| **TOTAL** | **20** | **18** | **⏳ 90%** |

**MVP Quase Pronto!** 🎉

---

## 🟡 VERSÃO 1.1 - EXPERIÊNCIA DO USUÁRIO

**Foco:** Melhorar a experiência e automatizar processos

### Funcionalidades 1.1

| Módulo | Funcionalidade | Prioridade |
|:-------|:---------------|:-----------|
| **CRM** | Galeria de fotos organizada | 🟡 |
| **Agenda** | Agendamento online pelo cliente | 🟡 |
| **Agenda** | Notificações automáticas (push/WhatsApp) | 🟡 |
| **Agenda** | Escolha de profissional preferido | 🟡 |
| **Estoque** | Alerta automático de estoque mínimo | 🟡 |
| **Financeiro** | Comissões configuráveis por profissional | 🟡 |
| **App Cliente** | Fotos antes/depois | 🟡 |
| **App Cliente** | Notificações push | 🟡 |

**Total 1.1:** 8 funcionalidades

---

## 🟡 VERSÃO 1.2 - RECEITA RECORRENTE

**Foco:** Aumentar receita e otimizar operações

### Funcionalidades 1.2

| Módulo | Funcionalidade | Prioridade |
|:-------|:---------------|:-----------|
| **CRM** | Carteira de vacinas completa | 🟡 |
| **Estoque** | Controle de insumos por banho (custo) | 🟡 |
| **Estoque** | Venda fracionada | 🟡 |
| **Financeiro** | Planos de assinatura | 🟡 |
| **Financeiro** | DRE e relatórios gerenciais | 🟡 |
| **App Cliente** | Assinaturas | 🟡 |

**Total 1.2:** 6 funcionalidades

---

## 🟢 VERSÃO 2.0+ - DIFERENCIAIS

**Foco:** Funcionalidades avançadas e diferenciais competitivos

### Funcionalidades 2.0+

| Módulo | Funcionalidade | Prioridade |
|:-------|:---------------|:-----------|
| **CRM** | Aniversários com promoção automática | 🟢 |
| **Agenda** | Lista de espera automática | 🟢 |
| **Estoque** | Integração com nota fiscal | 🟢 |
| **Financeiro** | Conciliação bancária | 🟢 |
| **App Cliente** | Programa de fidelidade | 🟢 |
| **Geral** | Marketing automático | 🟢 |

**Total 2.0+:** 6 funcionalidades

---

## 📅 ROTEIRO DE LANÇAMENTO (Roadmap)

```
┌─────────────────────────────────────────────────────────┐
│  VERSÃO 1.0 - MVP (Mês 3-4)                            │
│  ─────────────────────────────────────────────────────  │
│  ✅ Painel Gestor completo (funcionalidades 🔴)         │
│  ✅ App Cliente básico (consulta apenas)                │
│  ✅ Operação manual funcional                           │
│  ⏳ Pendente: CRUD de serviços (F005)                   │
│  ⏳ Pendente: Comissão simples (F017)                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  VERSÃO 1.1 - EXPERIÊNCIA (Mês 5-6)                    │
│  ─────────────────────────────────────────────────────  │
│  🟡 Agendamento online pelo app                         │
│  🟡 Notificações push e WhatsApp                        │
│  🟡 Fotos antes/depois                                 │
│  🟡 Comissões avançadas                                │
│  🟡 Alerta de estoque mínimo                           │
│  🟡 Galeria de fotos organizada                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  VERSÃO 1.2 - RECEITA (Mês 7-8)                        │
│  ─────────────────────────────────────────────────────  │
│  🟡 Planos de assinatura                                │
│  🟡 Carteira de vacinas                                 │
│  🟡 Controle de insumos                                 │
│  🟡 Venda fracionada                                    │
│  🟡 DRE e relatórios                                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  VERSÃO 2.0+ - DIFERENCIAIS (Mês 9+)                    │
│  ─────────────────────────────────────────────────────  │
│  🟢 Programa de fidelidade                             │
│  🟢 Lista de espera automática                          │
│  🟢 Conciliação bancária                                │
│  🟢 Nota fiscal integrada                                │
│  🟢 Marketing automático                                │
│  🟢 Aniversários automáticos                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 TABELA COMPLETA DE PRIORIZAÇÃO

| Módulo | Funcionalidade | Prioridade | Versão | Status |
|:-------|:---------------|:-----------|:-------|:-------|
| **CRM** | Cadastro de Cliente | 🔴 MVP | 1.0 | ✅ |
| **CRM** | Cadastro de Pet | 🔴 MVP | 1.0 | ✅ |
| **CRM** | Observações/Alertas | 🔴 MVP | 1.0 | ✅ |
| **CRM** | Histórico básico | 🔴 MVP | 1.0 | ✅ |
| **CRM** | Galeria de Fotos | 🟡 1.1 | 1.1 | ⏳ |
| **CRM** | Carteira de Vacinas | 🟡 1.2 | 1.2 | ⏳ |
| **CRM** | Aniversários automáticos | 🟢 2.0 | 2.0 | 📝 |
| | | | | |
| **Agenda** | Cadastro de Serviços | 🔴 MVP | 1.0 | ⏳ |
| **Agenda** | Cadastro de Profissionais | 🔴 MVP | 1.0 | ✅ |
| **Agenda** | Agenda Manual | 🔴 MVP | 1.0 | ✅ |
| **Agenda** | Check-in/Check-out | 🔴 MVP | 1.0 | ✅ |
| **Agenda** | Visualização diária | 🔴 MVP | 1.0 | ✅ |
| **Agenda** | Agendamento Online | 🟡 1.1 | 1.1 | ⏳ |
| **Agenda** | Notificações automáticas | 🟡 1.1 | 1.1 | ⏳ |
| **Agenda** | Escolha profissional preferido | 🟡 1.1 | 1.1 | ⏳ |
| **Agenda** | Lista de Espera | 🟢 2.0 | 2.0 | 📝 |
| | | | | |
| **Estoque** | Cadastro de Produtos | 🔴 MVP | 1.0 | ✅ |
| **Estoque** | Controle simples | 🔴 MVP | 1.0 | ✅ |
| **Estoque** | PDV básico | 🔴 MVP | 1.0 | ✅ |
| **Estoque** | Alerta estoque mínimo | 🟡 1.1 | 1.1 | ✅ |
| **Estoque** | Insumos por serviço | 🟡 1.2 | 1.2 | ⏳ |
| **Estoque** | Venda fracionada | 🟡 1.2 | 1.2 | ✅ |
| **Estoque** | Nota fiscal | 🟢 2.0 | 2.0 | 📝 |
| | | | | |
| **Financeiro** | Registro de vendas | 🔴 MVP | 1.0 | ✅ |
| **Financeiro** | Fluxo de caixa básico | 🔴 MVP | 1.0 | ✅ |
| **Financeiro** | Comissão simples | 🔴 MVP | 1.0 | ⏳ |
| **Financeiro** | Comissões avançadas | 🟡 1.1 | 1.1 | ✅ |
| **Financeiro** | Planos de Assinatura | 🟡 1.2 | 1.2 | ⏳ |
| **Financeiro** | DRE e relatórios | 🟡 1.2 | 1.2 | 📝 |
| **Financeiro** | Conciliação bancária | 🟢 2.0 | 2.0 | 📝 |
| | | | | |
| **App Cliente** | Visualizar agendamentos | 🔴 MVP | 1.0 | ✅ |
| **App Cliente** | Ver histórico | 🔴 MVP | 1.0 | ✅ |
| **App Cliente** | Ver dados do pet | 🔴 MVP | 1.0 | ✅ |
| **App Cliente** | Agendamento pelo app | 🟡 1.1 | 1.1 | ⏳ |
| **App Cliente** | Fotos antes/depois | 🟡 1.1 | 1.1 | ✅ |
| **App Cliente** | Notificações push | 🟡 1.1 | 1.1 | ⏳ |
| **App Cliente** | Assinaturas | 🟡 1.2 | 1.2 | ⏳ |

**Legenda:**
- ✅ Implementado
- ⏳ Parcialmente implementado
- 📝 Documentado, não implementado

---

## 🎯 CHECKLIST PARA LANÇAMENTO MVP

### Backend
- [x] API REST completa
- [x] Autenticação e autorização
- [x] Rotas de CRM
- [x] Rotas de Agenda
- [x] Rotas de Estoque/PDV
- [x] Rotas de Financeiro básico
- [ ] CRUD completo de serviços (F005)
- [ ] Comissão simples configurável (F017)

### Frontend Gestor (Web)
- [x] Dashboard básico
- [x] Gestão de clientes
- [x] Gestão de pets
- [x] Agenda do dia
- [x] Estoque básico
- [x] PDV básico
- [ ] CRUD de serviços
- [ ] Configuração de comissão simples

### Frontend Cliente (App)
- [x] Login/Registro
- [x] Lista de pets
- [x] Detalhes do pet
- [x] Histórico de serviços
- [x] Visualizar agendamentos
- [x] Dados do pet

### Testes
- [ ] Testes de integração básicos
- [ ] Testes de regras de negócio críticas
- [ ] Testes de fluxos principais

### Deploy
- [ ] Configuração de produção
- [ ] Banco de dados em produção
- [ ] Deploy do backend
- [ ] Deploy do app mobile
- [ ] Deploy da interface web

---

## 📈 MÉTRICAS DE SUCESSO DO MVP

### Operacionais
- ✅ Sistema permite operar o pet shop diariamente
- ✅ Gestor consegue gerenciar clientes, agenda e estoque
- ✅ Cliente consegue ver seus dados e agendamentos
- ✅ Vendas são registradas e faturadas corretamente

### Técnicas
- ✅ Sistema estável e sem erros críticos
- ✅ Performance aceitável (< 2s resposta)
- ✅ Dados seguros e protegidos
- ✅ Interface intuitiva

### Negócio
- ✅ Reduz tempo de gestão em 50%
- ✅ Elimina anotações em papel
- ✅ Cliente tem acesso aos dados do pet
- ✅ Base para crescimento

---

## 🚀 PRÓXIMOS PASSOS PARA MVP

### Crítico (Antes do Lançamento)
1. **F005 - CRUD de Serviços**
   - Criar interface para cadastrar serviços
   - Permitir editar duração e preço
   - Ativar/desativar serviços

2. **F017 - Comissão Simples**
   - Simplificar sistema de comissões
   - Percentual fixo configurável
   - Cálculo automático básico

### Importante (Melhorias)
3. Testes básicos de integração
4. Documentação de uso para gestores
5. Treinamento básico

### Desejável (Mas não bloqueia)
6. Melhorias visuais
7. Otimizações de performance
8. Logs de erro

---

**Última atualização:** 2026-02-20

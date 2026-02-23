# ✅ Mapeamento de Histórias de Usuário para Implementação

Este documento mapeia cada história de usuário para as funcionalidades implementadas ou pendentes.

## 📊 Status Geral

| Status | Quantidade | Percentual |
|:-------|:-----------|:-----------|
| ✅ Implementada | 18 | 31% |
| ⏳ Parcialmente | 12 | 21% |
| 📝 Documentada | 58 | 100% |

---

## 👤 CLIENTE - Status de Implementação

### MÓDULO 1: GESTÃO DE CLIENTES E PETS

| ID | História | Status | Implementação |
|:---|:---------|:-------|:--------------|
| HC001 | Cadastro com WhatsApp | ⏳ Parcial | Backend pronto, falta UI |
| HC002 | Adicionar foto do pet | ✅ | `pet_form_page.dart` |
| HC003 | Ver histórico completo | ✅ | `pet_detail_page.dart` (aba histórico) |
| HC004 | Lembretes de vacinas | ⏳ Parcial | Backend pronto, falta job agendado |
| HC005 | Fotos antes/depois | ✅ | `before_after_viewer_page.dart` |
| HC006 | Registrar alergias | ✅ | Campos `importantInfo` e `behaviorAlerts` |
| HC007 | Múltiplos pets | ✅ | Lista de pets, limite RN001 |

### MÓDULO 2: AGENDA E SERVIÇOS

| ID | História | Status | Implementação |
|:---|:---------|:-------|:--------------|
| HC008 | Horários em tempo real | ✅ | `appointment_booking_page.dart` + API |
| HC009 | Agendar 24/7 | ✅ | App disponível sempre |
| HC010 | Escolher tosador | ⏳ Parcial | Backend pronto, falta UI completa |
| HC011 | Cancelar/remarcar | ✅ | RN007/RN008 implementadas |
| HC012 | Notificação check-in | ⏳ Parcial | Backend pronto, falta push notification |
| HC013 | Foto do pet pronto | ⏳ Parcial | Backend pronto, falta envio automático |
| HC014 | Previsão de término | ✅ | Calculado no check-in |
| HC015 | Confirmar presença | 📝 | Documentado, não implementado |

### MÓDULO 3: COMPRAS E PRODUTOS

| ID | História | Status | Implementação |
|:---|:---------|:-------|:--------------|
| HC016 | Ração fracionada | ✅ | RN021/RN022 implementadas |
| HC017 | Ver disponibilidade | ✅ | RN024 implementada |
| HC018 | Pagar pelo app | 📝 | Documentado, não implementado |
| HC019 | Promoções exclusivas | 📝 | Documentado, não implementado |

### MÓDULO 4: ASSINATURAS

| ID | História | Status | Implementação |
|:---|:---------|:-------|:--------------|
| HC020 | Assinar plano | ⏳ Parcial | Backend pronto, falta UI completa |
| HC021 | Ver saldo | ⏳ Parcial | Backend pronto, falta UI |
| HC022 | Benefícios exclusivos | ⏳ Parcial | RN031 implementada, falta UI |
| HC023 | Acumular pontos | 📝 | Documentado, não implementado |

---

## 👩‍💼 GESTOR - Status de Implementação

### MÓDULO 1: GESTÃO DE CLIENTES E PETS

| ID | História | Status | Implementação |
|:---|:---------|:-------|:--------------|
| HG001 | Cadastrar clientes rápido | ✅ | `customer_form_page.dart` |
| HG002 | Buscar clientes | ✅ | Busca implementada em `customers_list_page.dart` |
| HG003 | Ver alertas em destaque | ✅ | RN003 implementada |
| HG004 | Registrar vacinas | ✅ | Backend + UI básica |
| HG005 | Aniversariantes | 📝 | Documentado, não implementado |
| HG006 | Exportar lista | 📝 | Documentado, não implementado |

### MÓDULO 2: AGENDA E OPERAÇÃO

| ID | História | Status | Implementação |
|:---|:---------|:-------|:--------------|
| HG007 | Ver agenda de todos | ⏳ Parcial | `schedule_dashboard_page.dart` existe, melhorar |
| HG008 | Arrastar e soltar | 📝 | Documentado, não implementado |
| HG009 | Bloquear horários | 📝 | Documentado, não implementado |
| HG010 | Relatório no-show | ⏳ Parcial | RN009 implementada, falta relatório |
| HG011 | Ver histórico antes | ✅ | Link no agendamento |
| HG012 | Check-in/check-out | ✅ | Rotas implementadas |
| HG013 | Ver instruções especiais | ✅ | RN003 implementada |

### MÓDULO 3: ESTOQUE E INSUMOS

| ID | História | Status | Implementação |
|:---|:---------|:-------|:--------------|
| HG014 | Custo real do banho | ⏳ Parcial | RN017/RN018 implementadas, falta UI |
| HG015 | Alerta estoque baixo | ✅ | RN019 implementada |
| HG016 | Controlar validade | ⏳ Parcial | RN020 implementada, falta campo no modelo |
| HG017 | Registrar entrada NF | ⏳ Parcial | Rota existe, falta UI completa |
| HG018 | Configurar consumo médio | ⏳ Parcial | RN017 implementada, falta UI |
| HG019 | Inventário periódico | 📝 | Documentado, não implementado |

### MÓDULO 4: FINANCEIRO

| ID | História | Status | Implementação |
|:---|:---------|:-------|:--------------|
| HG020 | Dashboard financeiro | ⏳ Parcial | `finance_dashboard_page.dart` básico |
| HG021 | Calcular comissões | ✅ | RN025 implementada |
| HG022 | Configurar regras | ⏳ Parcial | RN026 implementada, falta UI |
| HG023 | Gerenciar assinaturas | ⏳ Parcial | Backend pronto, falta UI gestor |
| HG024 | Lista inadimplentes | ⏳ Parcial | RN029/RN030 implementadas, falta UI |
| HG025 | Contas a pagar/receber | ✅ | `cashflow.routes.js` |
| HG026 | Relatório DRE | 📝 | Documentado, não implementado |

### MÓDULO 5: RELATÓRIOS

| ID | História | Status | Implementação |
|:---|:---------|:-------|:--------------|
| HG027 | Serviços mais lucrativos | 📝 | Documentado, não implementado |
| HG028 | Clientes inativos | 📝 | Documentado, não implementado |
| HG029 | Horários de pico | 📝 | Documentado, não implementado |
| HG030 | Comparar desempenho | ⏳ Parcial | Dashboard básico existe |

### MÓDULO 6: ADMINISTRAÇÃO

| ID | História | Status | Implementação |
|:---|:---------|:-------|:--------------|
| HG031 | Cadastrar serviços | ⏳ Parcial | Backend usa constantes, falta CRUD |
| HG032 | Cadastrar profissionais | ✅ | `professionals.routes.js` |
| HG033 | Níveis de acesso | ✅ | RN034 implementada |
| HG034 | Personalizar mensagens | 📝 | Documentado, não implementado |
| HG035 | Ver logs | 📝 | RN038 documentada, não implementada |

---

## 🎯 Histórias MVP (Prioridade Alta)

### Cliente - MVP (8 histórias)

| ID | História | Status |
|:---|:---------|:-------|
| HC001 | Cadastro WhatsApp | ⏳ Parcial |
| HC003 | Ver histórico | ✅ |
| HC006 | Registrar alergias | ✅ |
| HC007 | Múltiplos pets | ✅ |
| HC008 | Horários tempo real | ✅ |
| HC009 | Agendar 24/7 | ✅ |
| HC011 | Cancelar/remarcar | ✅ |
| HC012 | Notificação check-in | ⏳ Parcial |

**Progresso MVP Cliente:** 6/8 (75%)

### Gestor - MVP (14 histórias)

| ID | História | Status |
|:---|:---------|:-------|
| HG001 | Cadastrar clientes | ✅ |
| HG002 | Buscar clientes | ✅ |
| HG003 | Ver alertas | ✅ |
| HG007 | Ver agenda todos | ⏳ Parcial |
| HG009 | Bloquear horários | 📝 |
| HG011 | Ver histórico antes | ✅ |
| HG012 | Check-in/out | ✅ |
| HG013 | Ver instruções | ✅ |
| HG014 | Custo real banho | ⏳ Parcial |
| HG015 | Alerta estoque | ✅ |
| HG017 | Registrar entrada NF | ⏳ Parcial |
| HG020 | Dashboard financeiro | ⏳ Parcial |
| HG021 | Calcular comissões | ✅ |
| HG025 | Contas pagar/receber | ✅ |
| HG031 | Cadastrar serviços | ⏳ Parcial |
| HG032 | Cadastrar profissionais | ✅ |

**Progresso MVP Gestor:** 9/14 (64%)

**Progresso MVP Total:** 15/22 (68%)

---

## 📋 Próximas Implementações Prioritárias

### Alta Prioridade (MVP)

1. **HC001 - Cadastro WhatsApp** ⏳
   - Implementar UI de login WhatsApp
   - Integrar com serviço de SMS/WhatsApp

2. **HC012 - Notificação Check-in** ⏳
   - Implementar push notifications
   - Integrar com Firebase Cloud Messaging

3. **HG009 - Bloquear Horários** 📝
   - Criar rota de bloqueio
   - UI para gestor bloquear horários

4. **HG014 - Custo Real Banho** ⏳
   - Criar tela de visualização de custos
   - Mostrar margem de lucro

5. **HG020 - Dashboard Financeiro** ⏳
   - Melhorar dashboard com gráficos
   - Adicionar comparações

### Média Prioridade

6. **HC010 - Escolher Tosador** ⏳
   - Melhorar UI de seleção
   - Mostrar especialidades

7. **HC020/HC021 - Assinaturas Cliente** ⏳
   - Criar telas completas de assinatura
   - Mostrar saldo e histórico

8. **HG023 - Gerenciar Assinaturas** ⏳
   - Criar interface completa para gestor
   - Relatórios de MRR

---

## 🔗 Mapeamento para Código

### Backend

| História | Rota | Arquivo |
|:---------|:-----|:--------|
| HC001 | `POST /api/auth/register` | `auth.routes.js` |
| HC003 | `GET /api/medical-records/pet/:id` | `medical-records.routes.js` |
| HC006 | `POST /api/pets` | `pets.routes.js` |
| HC008 | `GET /api/appointments/availability` | `appointments.routes.js` |
| HC011 | `DELETE /api/appointments/:id` | `appointments.routes.js` |
| HC016 | `POST /api/sales` | `sales.routes.js` |
| HG001 | `POST /api/customers` | `customers.routes.js` |
| HG012 | `POST /api/appointments/:id/check-in` | `appointments.routes.js` |
| HG021 | Cálculo automático | `business-rules.service.js` |

### Frontend Mobile

| História | Tela | Arquivo |
|:---------|:-----|:--------|
| HC002 | Formulário pet | `pet_form_page.dart` |
| HC003 | Detalhes pet | `pet_detail_page.dart` |
| HC005 | Visualizador | `before_after_viewer_page.dart` |
| HC008 | Agendamento | `appointment_booking_page.dart` |
| HG001 | Formulário cliente | `customer_form_page.dart` |

### Frontend Web

| História | Tela | Arquivo |
|:---------|:-----|:--------|
| HG007 | Dashboard agenda | `ScheduleDashboardPage.jsx` |
| HG020 | Dashboard financeiro | `DashboardPage.jsx` |
| HG015 | Lista estoque | `InventoryPage.jsx` |

---

**Última atualização:** 2026-02-20

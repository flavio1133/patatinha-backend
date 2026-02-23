# 🗺️ Mapeamento de Fluxos para Implementação

Este documento mapeia os fluxos de usuário para as rotas e telas específicas do sistema.

## 📱 Cliente (App Mobile/Web)

### F1: Primeiro Acesso e Cadastro

**Rotas Backend:**
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `POST /api/pets` - Cadastrar primeiro pet

**Telas Flutter:**
- `lib/features/auth/presentation/pages/onboarding_page.dart` ⚠️ Criar
- `lib/features/auth/presentation/pages/login_page.dart` ✅ Existe
- `lib/features/auth/presentation/pages/register_page.dart` ✅ Existe
- `lib/features/pets/presentation/pages/pet_form_page.dart` ✅ Existe
- `lib/features/home/presentation/pages/home_page.dart` ✅ Existe

**Validações:**
- RN001: Limite de 5 pets
- RN002: Campos obrigatórios

---

### F2: Agendamento de Serviço

**Rotas Backend:**
- `GET /api/pets` - Listar pets do cliente
- `GET /api/professionals` - Listar profissionais
- `GET /api/appointments/availability` - Verificar disponibilidade
- `POST /api/appointments` - Criar agendamento

**Telas Flutter:**
- `lib/features/appointments/presentation/pages/appointment_booking_page.dart` ✅ Existe
- Criar sub-telas:
  - `pet_selection_page.dart` ⚠️ Criar
  - `service_selection_page.dart` ⚠️ Criar
  - `professional_selection_page.dart` ⚠️ Criar
  - `date_selection_page.dart` ⚠️ Criar
  - `time_selection_page.dart` ⚠️ Criar
  - `appointment_confirm_page.dart` ⚠️ Criar
  - `appointment_success_page.dart` ⚠️ Criar

**Validações:**
- RN010: Duração padrão
- RN011/RN012: Conflitos e intervalo
- RN031: Prioridade assinantes

---

### F3: Acompanhamento em Tempo Real

**Rotas Backend:**
- `GET /api/appointments/:id` - Detalhes do agendamento
- `GET /api/appointments` - Listar agendamentos do cliente

**Telas Flutter:**
- `lib/features/appointments/presentation/pages/appointment_detail_page.dart` ✅ Existe
- `lib/features/appointments/presentation/pages/appointment_tracking_page.dart` ⚠️ Criar
- `lib/features/appointments/presentation/pages/appointment_ready_page.dart` ⚠️ Criar

**Notificações:**
- RN041: Check-in
- RN042: Check-out
- RN015: Lembrete de busca

---

### F4: Visualização do Histórico do Pet

**Rotas Backend:**
- `GET /api/pets/:id` - Detalhes do pet
- `GET /api/medical-records/pet/:id` - Histórico médico
- `GET /api/vaccinations/pet/:id` - Vacinas
- `GET /api/photos/pet/:id` - Fotos

**Telas Flutter:**
- `lib/features/pets/presentation/pages/pet_detail_page.dart` ✅ Existe (com abas)
- Abas já implementadas:
  - Histórico ✅
  - Vacinas ✅
  - Fotos ✅
  - Info ✅

---

### F5: Gerenciamento de Assinatura

**Rotas Backend:**
- `GET /api/subscriptions` - Assinatura do cliente
- `GET /api/subscriptions/:id/history` - Histórico de cobranças
- `POST /api/subscriptions/:id/cancel` - Cancelar assinatura

**Telas Flutter:**
- `lib/features/finance/presentation/pages/subscriptions_page.dart` ✅ Existe
- Criar:
  - `my_subscription_page.dart` ⚠️ Criar
  - `subscription_history_page.dart` ⚠️ Criar
  - `cancel_subscription_page.dart` ⚠️ Criar

---

## 💼 Gestor (Painel Web/Tablet)

### F6: Dashboard e Visão Geral

**Rotas Backend:**
- `GET /api/admin/dashboard` - Dashboard consolidado

**Telas React:**
- `web/src/pages/DashboardPage.jsx` ✅ Existe

**Dados necessários:**
- Agendamentos do dia
- Faturamento diário/mensal
- Alertas críticos
- Gráficos

---

### F7: Gestão de Agenda

**Rotas Backend:**
- `GET /api/appointments` - Listar agendamentos
- `GET /api/appointments/schedule/week` - Grade semanal
- `PUT /api/appointments/:id` - Atualizar agendamento
- `DELETE /api/appointments/:id` - Cancelar

**Telas React:**
- `web/src/pages/AppointmentsPage.jsx` ✅ Existe
- Criar:
  - `ScheduleDashboardPage.jsx` ⚠️ Criar (já existe em Flutter)
  - `AppointmentDetailPage.jsx` ⚠️ Criar

---

### F8: Fluxo de Atendimento

**Rotas Backend:**
- `POST /api/appointments/:id/check-in` - Check-in
- `POST /api/appointments/:id/start` - Iniciar serviço
- `POST /api/appointments/:id/check-out` - Finalizar

**Telas React:**
- Criar:
  - `EmployeeAppointmentsPage.jsx` ⚠️ Criar
  - `AppointmentCheckInPage.jsx` ⚠️ Criar
  - `AppointmentServicePage.jsx` ⚠️ Criar
  - `AppointmentCheckOutPage.jsx` ⚠️ Criar

**Validações:**
- RN013: Tolerância check-in
- RN014: Check-out após check-in
- RN017/RN018: Baixa de insumos
- RN025: Cálculo de comissão

---

### F9: Gestão de Estoque

**Rotas Backend:**
- `GET /api/inventory` - Listar produtos
- `GET /api/inventory/:id` - Detalhes
- `POST /api/inventory/:id/stock-in` - Entrada
- `GET /api/inventory/alerts/low-stock` - Alertas

**Telas React:**
- `web/src/pages/InventoryPage.jsx` ✅ Existe
- Criar:
  - `ProductDetailPage.jsx` ⚠️ Criar
  - `StockInPage.jsx` ⚠️ Criar

---

### F10: Gestão Financeira - Comissões

**Rotas Backend:**
- `GET /api/commissions` - Listar comissões
- `GET /api/commissions/report/monthly` - Relatório mensal
- `POST /api/commissions/:id/pay` - Marcar como pago

**Telas React:**
- `web/src/pages/FinancePage.jsx` ✅ Existe (básico)
- Criar:
  - `CommissionsPage.jsx` ⚠️ Criar
  - `CommissionDetailPage.jsx` ⚠️ Criar

---

### F11: Gestão de Assinaturas

**Rotas Backend:**
- `GET /api/subscriptions` - Listar assinaturas
- `GET /api/subscriptions/plans` - Listar planos
- `POST /api/subscriptions/plans` - Criar plano
- `GET /api/subscriptions/reports/mrr` - Relatório MRR

**Telas React:**
- Criar:
  - `SubscriptionsPage.jsx` ⚠️ Criar
  - `SubscriptionPlansPage.jsx` ⚠️ Criar
  - `CreatePlanPage.jsx` ⚠️ Criar

---

## 📋 Checklist de Implementação

### Backend ✅
- [x] Rotas de autenticação
- [x] Rotas de pets
- [x] Rotas de agendamentos
- [x] Rotas de estoque
- [x] Rotas de vendas
- [x] Rotas de financeiro
- [x] Rotas de assinaturas
- [x] Rotas de comissões

### Frontend Mobile (Flutter) ⚠️
- [x] Telas de autenticação
- [x] Telas de pets
- [x] Tela de agendamento (básica)
- [ ] Sub-telas de agendamento (F2)
- [ ] Tela de acompanhamento (F3)
- [x] Tela de histórico do pet (F4)
- [ ] Telas de assinatura (F5)

### Frontend Web (React) ⚠️
- [x] Dashboard básico
- [x] Lista de agendamentos
- [x] Lista de clientes
- [x] Lista de estoque
- [ ] Grade de agenda (F7)
- [ ] Telas de atendimento (F8)
- [ ] Telas de comissões (F10)
- [ ] Telas de assinaturas (F11)

---

## 🎯 Prioridades de Implementação

### Alta Prioridade
1. **F2 - Agendamento completo** (Cliente)
   - Sub-telas de seleção
   - Validações de disponibilidade
   - Confirmação

2. **F8 - Fluxo de atendimento** (Gestor)
   - Check-in/Check-out
   - Baixa de insumos
   - Cálculo de comissão

3. **F3 - Acompanhamento** (Cliente)
   - Tela de tracking
   - Notificações push

### Média Prioridade
4. **F7 - Agenda gestor** (Gestor)
   - Grade semanal
   - Drag-and-drop

5. **F10 - Comissões** (Gestor)
   - Relatórios
   - Marcar como pago

### Baixa Prioridade
6. **F5 - Assinatura cliente** (Cliente)
7. **F11 - Assinaturas gestor** (Gestor)

---

**Última atualização:** 2026-02-20

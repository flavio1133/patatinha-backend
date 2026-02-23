# Levantamento completo das funcionalidades – Sistema Pet Shop (MyPet)

*Gerado com base no código-fonte atual.*

---

## Módulo 1: Autenticação e Usuários

| # | Funcionalidade | Painel Web (Admin) | Painel Web (Cliente) | App Mobile | API (Backend) | Status | Endpoint(s) | Arquivo(s) | Observações |
|---|----------------|:------------------:|:---------------------:|:----------:|:-------------:|--------|-------------|------------|-------------|
| 1.1 | Login (e-mail/senha) | ✅ | ✅ | ✅ | ✅ | Funcionando 100% | `POST /api/auth/login` | `auth.routes.js`, `GestaoLoginPage.jsx`, `ClienteLoginPage.jsx`, `useAuth.js`, `api_service.dart`, `login_page.dart` | Dois fluxos: gestão e cliente; redirecionamento por role. |
| 1.2 | Registro de usuário (cliente) | ❌ | ✅ | ✅ | ✅ | Funcionando 100% | `POST /api/auth/register` | `auth.routes.js`, `ClienteCadastroPage.jsx`, `api_service.dart`, `register_page.dart` | Apenas role `customer`; gestão não tem tela de cadastro de usuário. |
| 1.3 | Perfil do usuário autenticado | ✅ | ✅ | ✅ | ✅ | Funcionando 100% | `GET /api/auth/me` | `auth.routes.js`, `useAuth.js`, `api_service.dart` | Usado para manter sessão e exibir nome/role. |
| 1.4 | Controle de acesso por role | ✅ | ✅ | ✅ | ✅ | Funcionando 100% | (middleware) | `auth.middleware.js`, `role.middleware.js`, `App.jsx` | Roles: master, manager, employee, financial, customer/client. |
| 1.5 | Seed de usuários de teste | ❌ | ❌ | ❌ | ✅ | Funcionando 100% | (inicialização) | `seed-users.js`, `auth.routes.js` | Usuários 1–6 criados de forma síncrona ao subir o backend. |

---

## Módulo 2: Clientes e Pets

| # | Funcionalidade | Painel Web (Admin) | Painel Web (Cliente) | App Mobile | API (Backend) | Status | Endpoint(s) | Arquivo(s) | Observações |
|---|----------------|:------------------:|:---------------------:|:----------:|:-------------:|--------|-------------|------------|-------------|
| 2.1 | Listar clientes (com busca) | ✅ | ❌ | ✅ | ✅ | Funcionando 100% | `GET /api/customers?search=` | `customers.routes.js`, `CustomersPage.jsx`, `api_service.dart` | Inclui contagem de pets por cliente. |
| 2.2 | Obter cliente por ID | ❌ | ❌ | ✅ | ✅ | Funcionando 100% | `GET /api/customers/:id` | `customers.routes.js`, `api_service.dart` | Web admin não abre detalhe do cliente. |
| 2.3 | Criar cliente | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/customers` | `customers.routes.js`, `api_service.dart` | Botão "+ Novo Cliente" na web não implementado. |
| 2.4 | Atualizar cliente | ❌ | ❌ | ✅ | ✅ | Parcialmente | `PUT /api/customers/:id` | `customers.routes.js`, `api_service.dart` | Web não tem tela de edição. |
| 2.5 | Excluir cliente | ❌ | ❌ | ✅ | ✅ | Parcialmente | `DELETE /api/customers/:id` | `customers.routes.js` | Web não expõe exclusão. |
| 2.6 | Listar pets (do usuário ou por cliente) | ✅ (por cliente) | ✅ (do usuário) | ✅ | ✅ | Funcionando 100% | `GET /api/pets`, `GET /api/pets?customerId=` | `pets.routes.js`, `ClienteDashboardPage.jsx`, `api.js`, `api_service.dart` | Cliente vê só seus pets; admin pode filtrar por customerId. |
| 2.7 | Obter pet por ID | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/pets/:id` | `pets.routes.js`, `api_service.dart` | Web não tem tela de detalhe do pet. |
| 2.8 | Criar pet | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/pets` | `pets.routes.js`, `api_service.dart` | Cliente não tem tela de cadastro de pet na web. |
| 2.9 | Atualizar pet | ❌ | ❌ | ✅ | ✅ | Parcialmente | `PUT /api/pets/:id` | `pets.routes.js`, `api_service.dart` | Web não tem edição. |
| 2.10 | Excluir pet | ❌ | ❌ | ✅ | ✅ | Parcialmente | `DELETE /api/pets/:id` | `pets.routes.js`, `api.js` | Web não expõe. |
| 2.11 | Regras de negócio (limite de pets, campos obrigatórios) | — | — | — | ✅ | Funcionando 100% | (validação) | `business-rules.service.js`, `pets.routes.js` | RN001 limite de pets; RN002 campos obrigatórios. |
| 2.12 | Seed de clientes e pets | ❌ | ❌ | ❌ | ✅ | Funcionando 100% | (inicialização) | `seed-data.js`, `customers.routes.js`, `pets.routes.js` | 3 clientes + pets para userId 4, 5, 6. |

---

## Módulo 3: Agenda e Agendamentos

| # | Funcionalidade | Painel Web (Admin) | Painel Web (Cliente) | App Mobile | API (Backend) | Status | Endpoint(s) | Arquivo(s) | Observações |
|---|----------------|:------------------:|:---------------------:|:----------:|:-------------:|--------|-------------|------------|-------------|
| 3.1 | Listar agendamentos (filtros: data, profissional, status, cliente) | ✅ | ✅ | ✅ | ✅ | Funcionando 100% | `GET /api/appointments?date=&professionalId=&status=&customerId=` | `appointments.routes.js`, `AppointmentsPage.jsx`, `ClienteDashboardPage.jsx`, `api_service.dart` | Cliente vê só os seus; admin vê todos com filtros. |
| 3.2 | Obter agendamento por ID | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/appointments/:id` | `appointments.routes.js`, `api_service.dart` | Web não usa. |
| 3.3 | Verificar disponibilidade (data + serviço) | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/appointments/availability?date=&service=` | `appointments.routes.js` | Backend implementado; web cliente não usa (escolhe horário livre). |
| 3.4 | Criar agendamento | ❌ | ✅ | ✅ | ✅ | Funcionando 100% | `POST /api/appointments` | `appointments.routes.js`, `ClienteAgendarPage.jsx`, `api_service.dart` | Alocação automática de profissional quando não informado. |
| 3.5 | Atualizar agendamento | ❌ | ❌ | ✅ | ✅ | Parcialmente | `PUT /api/appointments/:id` | `appointments.routes.js`, `api.js` | API pronta; web cliente não tem "reagendar". |
| 3.6 | Cancelar agendamento | ❌ | ✅ | ✅ | ✅ | Funcionando 100% | `DELETE /api/appointments/:id` | `appointments.routes.js`, `ClienteDashboardPage.jsx`, `api.js` | Cliente cancela na lista "Meus agendamentos"; regras de cancelamento (horas, taxa) no backend. |
| 3.7 | Check-in | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/appointments/:id/check-in` | `appointments.routes.js`, `api_service.dart` | Web admin não tem botão check-in. |
| 3.8 | Iniciar serviço | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/appointments/:id/start` | `appointments.routes.js` | Apenas backend. |
| 3.9 | Check-out (com foto) | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/appointments/:id/check-out` | `appointments.routes.js`, `api_service.dart` | Web não implementado. |
| 3.10 | Grade semanal (dashboard) | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/appointments/schedule/week?startDate=` | `appointments.routes.js`, `api.js` | Usado no mobile; web não consome. |
| 3.11 | Listar profissionais | ✅ | ✅ | ✅ | ✅ | Funcionando 100% | `GET /api/professionals`, `GET /api/professionals/:id` | `professionals.routes.js`, `ClienteAgendarPage.jsx`, `api.js`, `api_service.dart` | Cliente usa na tela de agendar (opcional). |
| 3.12 | CRUD profissionais (admin) | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST/PUT/DELETE /api/professionals` | `professionals.routes.js`, `api_service.dart` | Web admin não tem tela de profissionais. |
| 3.13 | Disponibilidade do profissional | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/professionals/:id/availability` | `professionals.routes.js` | Backend implementado. |
| 3.14 | Seed de agendamentos | ❌ | ❌ | ❌ | ✅ | Funcionando 100% | (inicialização) | `seed-data.js`, `appointments.routes.js` | Agendamentos para clientes 4, 5, 6. |

---

## Módulo 4: PDV e Estoque

| # | Funcionalidade | Painel Web (Admin) | Painel Web (Cliente) | App Mobile | API (Backend) | Status | Endpoint(s) | Arquivo(s) | Observações |
|---|----------------|:------------------:|:---------------------:|:----------:|:-------------:|--------|-------------|------------|-------------|
| 4.1 | Listar itens de estoque (inventory) | ✅ | ❌ | ✅ | ✅ | Funcionando 100% | `GET /api/inventory?search=&category=&lowStock=` | `inventory.routes.js`, `InventoryPage.jsx`, `api.js` | Web admin usa para lista e busca. |
| 4.2 | Obter item por ID | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/inventory/:id` | `inventory.routes.js` | Web não abre detalhe. |
| 4.3 | Criar item de estoque | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/inventory` | `inventory.routes.js`, `api.js` | Botão "+ Novo Produto" na web não implementado. |
| 4.4 | Atualizar item | ❌ | ❌ | ✅ | ✅ | Parcialmente | `PUT /api/inventory/:id` | `inventory.routes.js`, `api.js` | Web não tem edição. |
| 4.5 | Excluir item | ❌ | ❌ | ✅ | ✅ | Parcialmente | `DELETE /api/inventory/:id` | `inventory.routes.js` | Web não expõe. |
| 4.6 | Entrada de estoque (stock-in) | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/inventory/:id/stock-in` | `inventory.routes.js`, `api.js` | Web não tem tela. |
| 4.7 | Saída de estoque (stock-out) | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/inventory/:id/stock-out` | `inventory.routes.js`, `api.js` | Web não tem tela. |
| 4.8 | Alertas de estoque baixo | ✅ | ❌ | ✅ | ✅ | Funcionando 100% | `GET /api/inventory/alerts/low-stock` | `inventory.routes.js`, `InventoryPage.jsx`, `api.js` | Banner na tela de estoque. |
| 4.9 | Listar produtos (catálogo/loja) | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/products`, `GET /api/products/:id` | `products.routes.js`, `api_service.dart` | Catálogo fixo em memória; separado de inventory. |
| 4.10 | Vendas (PDV) – listar | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/sales`, `GET /api/sales/:id` | `sales.routes.js`, `api_service.dart` | Web não tem tela de vendas. |
| 4.11 | Vendas (PDV) – criar | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/sales` | `sales.routes.js`, `api_service.dart` | Mobile tem POS. |
| 4.12 | Relatório resumo de vendas | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/sales/reports/summary` | `sales.routes.js`, `api.js` | financeAPI.getReport. |
| 4.13 | Fechamento de caixa | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/sales/cash-closing` | `sales.routes.js`, `api.js` | Web não tem tela. |
| 4.14 | Custos de serviço (receitas, cálculo, uso) | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET/POST /api/service-costs/recipes`, `POST /api/service-costs/calculate`, `POST /api/service-costs/register-usage` | `service-costs.routes.js` | Apenas backend; sem UI. |

---

## Módulo 5: Financeiro (Comissões, Assinaturas)

| # | Funcionalidade | Painel Web (Admin) | Painel Web (Cliente) | App Mobile | API (Backend) | Status | Endpoint(s) | Arquivo(s) | Observações |
|---|----------------|:------------------:|:---------------------:|:----------:|:-------------:|--------|-------------|------------|-------------|
| 5.1 | Fluxo de caixa – listar transações | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/cashflow`, `GET /api/cashflow/:id` | `cashflow.routes.js`, `api.js`, `api_service.dart` | Web Finance usa apenas dashboard e previsão. |
| 5.2 | Fluxo de caixa – criar/editar/excluir | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/cashflow`, `PUT /api/cashflow/:id`, `DELETE /api/cashflow/:id` | `cashflow.routes.js`, `api.js`, `api_service.dart` | Web não tem tela de lançamentos. |
| 5.3 | Dashboard diário (entradas/saídas/saldo) | ✅ | ❌ | ✅ | ✅ | Funcionando 100% | `GET /api/cashflow/dashboard/daily?date=` | `cashflow.routes.js`, `FinancePage.jsx`, `api.js` | Tela Financeiro do admin. |
| 5.4 | Dashboard mensal | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/cashflow/dashboard/monthly?year=&month=` | `cashflow.routes.js`, `api.js` | Web não usa. |
| 5.5 | Previsão de fluxo de caixa | ✅ | ❌ | ✅ | ✅ | Funcionando 100% | `GET /api/cashflow/forecast?days=` | `cashflow.routes.js`, `FinancePage.jsx`, `api.js` | Alertas de saldo negativo projetado. |
| 5.6 | Conciliação | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/cashflow/reconcile` | `cashflow.routes.js` | Apenas backend. |
| 5.7 | Regras de comissão | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/commissions/rules`, `POST /api/commissions/rules` | `commissions.routes.js`, `api_service.dart` | Mobile tem tela; web não. |
| 5.8 | Calcular comissão | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/commissions/calculate` | `commissions.routes.js` | Backend. |
| 5.9 | Listar comissões / relatório mensal | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/commissions`, `GET /api/commissions/report/monthly` | `commissions.routes.js`, `api_service.dart` | Mobile. |
| 5.10 | Marcar comissão como paga | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/commissions/:id/pay` | `commissions.routes.js` | Backend. |
| 5.11 | Planos de assinatura – listar/criar | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/subscriptions/plans`, `POST /api/subscriptions/plans` | `subscriptions.routes.js`, `api_service.dart` | Mobile; web não. |
| 5.12 | Assinaturas – listar/criar | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/subscriptions`, `POST /api/subscriptions` | `subscriptions.routes.js`, `api_service.dart` | Mobile. |
| 5.13 | Usar serviço da assinatura | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/subscriptions/:id/use-service` | `subscriptions.routes.js` | Backend. |
| 5.14 | Processar cobrança (billing) | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/subscriptions/process-billing` | `subscriptions.routes.js` | Backend. |
| 5.15 | Relatório MRR | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/subscriptions/reports/mrr` | `subscriptions.routes.js` | Backend. |
| 5.16 | Cancelar assinatura | ❌ | ❌ | ✅ | ✅ | Parcialmente | `POST /api/subscriptions/:id/cancel` | `subscriptions.routes.js` | Backend. |

---

## Módulo 6: Comunicação (Notificações)

| # | Funcionalidade | Painel Web (Admin) | Painel Web (Cliente) | App Mobile | API (Backend) | Status | Endpoint(s) | Arquivo(s) | Observações |
|---|----------------|:------------------:|:---------------------:|:----------:|:-------------:|--------|-------------|------------|-------------|
| 6.1 | Serviço de notificações (SMS/WhatsApp/Push) | ❌ | ❌ | ❌ | Parcialmente | Parcialmente | (nenhum endpoint) | `notification.service.js` | Serviço interno; apenas simulação em console; não integrado a provedores reais. |
| 6.2 | Notificação de confirmação de agendamento | ❌ | ❌ | ❌ | Não implementado | Não implementado | — | `appointments.routes.js` (TODO) | Comentário TODO no código. |
| 6.3 | Notificação de check-in / previsão de término | ❌ | ❌ | ❌ | Não implementado | Não implementado | — | `appointments.routes.js` (TODO) | Idem. |
| 6.4 | Notificação de check-out (foto) | ❌ | ❌ | ❌ | Não implementado | Não implementado | — | `appointments.routes.js` (TODO) | Idem. |
| 6.5 | Notificação de cancelamento | ❌ | ❌ | ❌ | Não implementado | Não implementado | — | `appointments.routes.js` (TODO) | Idem. |

---

## Módulo 7: Relatórios

| # | Funcionalidade | Painel Web (Admin) | Painel Web (Cliente) | App Mobile | API (Backend) | Status | Endpoint(s) | Arquivo(s) | Observações |
|---|----------------|:------------------:|:---------------------:|:----------:|:-------------:|--------|-------------|------------|-------------|
| 7.1 | Dashboard administrativo (resumo do dia) | ✅ | ❌ | ✅ | ✅ | Funcionando 100% | `GET /api/admin/dashboard` | `admin.routes.js`, `DashboardPage.jsx`, `api.js` | Agendamentos hoje, receita, vendas, assinaturas ativas, alertas. |
| 7.2 | Relatório consolidado (período) | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/admin/reports/consolidated?startDate=&endDate=` | `admin.routes.js`, `api.js` | Web não tem tela de relatório por período. |
| 7.3 | Resumo de vendas | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/sales/reports/summary` | `sales.routes.js`, `api.js` | financeAPI; sem tela dedicada na web. |

---

## Módulo 8: Configurações

| # | Funcionalidade | Painel Web (Admin) | Painel Web (Cliente) | App Mobile | API (Backend) | Status | Endpoint(s) | Arquivo(s) | Observações |
|---|----------------|:------------------:|:---------------------:|:----------:|:-------------:|--------|-------------|------------|-------------|
| 8.1 | Página de perfil / configurações do usuário | ❌ | ❌ | ✅ | ✅ | Parcialmente | (usa `GET /api/auth/me`) | `profile_page.dart`, `api_service.dart` | Web não tem tela de perfil. |
| 8.2 | Configurações gerais do sistema | ❌ | ❌ | ❌ | ❌ | Não implementado | — | — | Nenhuma rota ou tela de config. |
| 8.3 | Prontuário médico do pet | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/medical-records/pet/:petId`, `POST /api/medical-records`, `PUT/DELETE /api/medical-records/:id` | `medical-records.routes.js`, `api_service.dart` | Apenas mobile e API. |
| 8.4 | Vacinas do pet | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/vaccinations/pet/:petId`, `GET /api/vaccinations/expiring`, `GET /api/vaccinations/common`, `POST/PUT/DELETE /api/vaccinations` | `vaccinations.routes.js`, `api_service.dart` | Idem. |
| 8.5 | Fotos do pet / antes e depois | ❌ | ❌ | ✅ | ✅ | Parcialmente | `GET /api/photos/pet/:petId`, `GET /api/photos/before-after/:id`, `POST /api/photos`, `POST /api/photos/before-after`, `DELETE /api/photos/:id` | `photos.routes.js`, `api_service.dart` | Idem. |

---

## Resumo por canal

| Canal | Funcionando 100% | Parcialmente | Não implementado / Só backend |
|-------|------------------|--------------|-------------------------------|
| **Painel Web (Admin)** | Login, Dashboard, Clientes (lista+busca), Agenda (lista do dia), Estoque (lista+alertas), Financeiro (dashboard diário + previsão) | Criar/editar clientes, pets, estoque, vendas, relatório consolidado, fluxo de caixa (CRUD) | Check-in/out, comissões, assinaturas, notificações, configurações |
| **Painel Web (Cliente)** | Login, Cadastro, Dashboard (próximo agendamento, pets, histórico), Agendar, Cancelar agendamento | — | Ver disponibilidade, reagendar, cadastro de pet |
| **App Mobile** | Login, Registro, Perfil, Clientes, Pets, Agendamentos, Fotos, Vacinas, Prontuário, Estoque, PDV, Finance (dashboard, transações, previsão), Comissões, Assinaturas (telas) | Integração com backend pode variar por tela | Notificações push reais |
| **API (Backend)** | Auth, Customers, Pets, Appointments, Professionals, Inventory, Sales, Cashflow, Admin dashboard, Subscriptions, Commissions, Service-costs, Photos, Vaccinations, Medical-records, Products (leitura) | Notificação (serviço simulado) | Endpoints de configuração global |

---

## Legenda

- **Funcionando 100%**: Implementado e em uso de ponta a ponta (API + pelo menos um cliente).
- **Parcialmente**: API e/ou cliente existem, mas falta parte da funcionalidade (ex.: botão sem ação, tela só em um canal).
- **Não implementado**: Não existe no código ou existe apenas como TODO/stub.

---

*Documento gerado a partir do repositório mypet (backend Node/Express, web React/Vite, mobile Flutter).*

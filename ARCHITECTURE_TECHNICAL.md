# 🏗️ FASE 3 - ARQUITETURA TÉCNICA

Este documento define a arquitetura técnica completa do sistema Patatinha, incluindo escolha de tecnologias, modelagem de banco de dados, estrutura de APIs, segurança e serviços externos.

---

## 📊 VISÃO GERAL DA ARQUITETURA

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENTES (Front-end)                     │
│  ┌────────────────┐          ┌────────────────┐            │
│  │  APP CLIENTE   │          │ PAINEL GESTOR  │            │
│  │  (iOS/Android) │          │  (Web/Tablet)  │            │
│  └───────┬────────┘          └───────┬────────┘            │
│          │                           │                      │
│          ▼                           ▼                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    API GATEWAY                       │   │
│  │  (REST/GraphQL - Autenticação, Rate Limiting)       │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    BACKEND                            │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │  │ Módulo CRM  │ │Módulo Agenda│ │Módulo PDV   │    │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘    │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │   │
│  │  │Módulo Estq. │ │Módulo Fin.  │ │Módulo Users │    │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘    │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    BANCO DE DADOS                     │   │
│  │            (PostgreSQL / MongoDB / Firebase)         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 SERVIÇOS EXTERNOS                     │   │
│  │  • AWS S3 (imagens)    • WhatsApp API                │   │
│  │  • Gateway Pagamento   • OneSignal (push)            │   │
│  │  • Redis (cache)       • Sentry (erros)              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 1. ESCOLHA DAS TECNOLOGIAS

### **Opção 1: Stack Universal (Recomendada) ✅**

Esta é a opção escolhida para o projeto Patatinha.

| Camada | Tecnologia | Por quê? |
|:---|:---|:---|
| **App Cliente** | Flutter | Código único para iOS, Android e Web |
| **Painel Gestor** | React.js + Vite | Performance, desenvolvimento rápido |
| **Backend** | Node.js + Express | JavaScript em toda stack, produtividade |
| **API** | REST | Simplicidade, ampla compatibilidade |
| **Banco de Dados** | PostgreSQL | Relacional, confiável, ótimo para finanças |
| **Cache** | Redis | Sessões, filas, dados temporários |
| **Armazenamento** | AWS S3 | Fotos, documentos, escalável |
| **Autenticação** | JWT | Seguro e prático |
| **Pagamentos** | Stripe / PagSeguro / Mercado Pago | APIs maduras |
| **Push Notifications** | OneSignal / Firebase | Multiplataforma |
| **Monitoramento** | Sentry | Erros e sessões de usuário |
| **Hospedagem** | AWS / Google Cloud / Digital Ocean | Escalabilidade |

**Vantagens:**
- ✅ Código compartilhado entre plataformas
- ✅ Desenvolvimento rápido
- ✅ Equipe pode trabalhar em JavaScript/Dart
- ✅ Escalável e manutenível

---

### **Opção 2: Stack Nativa (Alta Performance)**

| Camada | Tecnologia |
|:---|:---|
| **App Cliente (iOS)** | Swift + SwiftUI |
| **App Cliente (Android)** | Kotlin + Jetpack Compose |
| **Painel Gestor** | React.js |
| **Backend** | Python (Django) ou Java (Spring) |
| **Banco de Dados** | PostgreSQL |
| **Demais** | Mesmo da Opção 1 |

**Vantagem:** Performance máxima, acesso total a APIs nativas  
**Desvantagem:** Duplica esforço de desenvolvimento (2 apps separados)

**Status:** Não escolhida (mantida como referência futura)

---

### **Opção 3: Firebase (Mais Rápido para MVP)**

| Camada | Tecnologia |
|:---|:---|
| **App Cliente** | Flutter |
| **Painel Gestor** | Flutter Web |
| **Backend** | Firebase (Firestore, Functions, Auth) |
| **Banco de Dados** | Firestore (NoSQL) |
| **Armazenamento** | Firebase Storage |
| **Autenticação** | Firebase Auth |
| **Push** | Firebase Cloud Messaging |
| **Hospedagem** | Firebase Hosting |

**Vantagem:** Desenvolvimento super rápido, zero gerenciamento de servidor  
**Desvantagem:** Pode ficar caro com escala, menos controle

**Status:** Não escolhida (mantida como referência futura)

---

## 💾 2. MODELAGEM DO BANCO DE DADOS

### **Estrutura de Tabelas (PostgreSQL)**

```sql
-- ============================================
-- USUÁRIOS E ACESSOS
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  role VARCHAR(20) DEFAULT 'client', -- 'client', 'admin', 'manager', 'employee'
  firebase_uid VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- CLIENTES (estende users)
-- ============================================

CREATE TABLE clients (
  id UUID PRIMARY KEY REFERENCES users(id),
  address TEXT,
  birth_date DATE,
  how_found VARCHAR(50), -- como conheceu a loja
  notes TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_visit DATE
);

CREATE INDEX idx_clients_last_visit ON clients(last_visit);

-- ============================================
-- FUNCIONÁRIOS
-- ============================================

CREATE TABLE employees (
  id UUID PRIMARY KEY REFERENCES users(id),
  position VARCHAR(50), -- 'tosador', 'banhista', 'veterinario', 'atendente'
  specialties TEXT[], -- ['cães grandes', 'gatos', 'banho']
  commission_type VARCHAR(20), -- 'percentage', 'fixed', 'mixed'
  commission_value DECIMAL(5,2), -- 30 para 30% ou valor fixo
  hire_date DATE,
  salary DECIMAL(10,2),
  work_days TEXT[], -- ['monday', 'tuesday', ...]
  work_hours JSONB -- {start: '09:00', end: '18:00', lunch: '12:00-13:00'}
);

CREATE INDEX idx_employees_position ON employees(position);

-- ============================================
-- PETS
-- ============================================

CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  name VARCHAR(50) NOT NULL,
  species VARCHAR(20) NOT NULL, -- 'dog', 'cat', 'other'
  breed VARCHAR(50),
  color VARCHAR(30),
  birth_date DATE,
  weight DECIMAL(5,2),
  photo_url TEXT,
  allergies TEXT,
  behavior_notes TEXT, -- "medo de secador, agressivo com outros cães"
  preferences TEXT, -- "corte rente, perfume lavanda"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pets_client_id ON pets(client_id);
CREATE INDEX idx_pets_species ON pets(species);

-- ============================================
-- SERVIÇOS (ex: Banho, Tosa, Consulta)
-- ============================================

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL, -- 60, 90, 120
  base_price DECIMAL(10,2) NOT NULL,
  category VARCHAR(30), -- 'bath', 'grooming', 'veterinary', 'others'
  requires_vet BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true
);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(active);

-- ============================================
-- INSUMOS (produtos usados nos serviços)
-- ============================================

CREATE TABLE supplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(30), -- 'shampoo', 'conditioner', 'perfume', 'medicine'
  brand VARCHAR(50),
  unit VARCHAR(10), -- 'ml', 'g', 'un'
  current_stock DECIMAL(10,2),
  min_stock DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  supplier VARCHAR(100),
  expiration_date DATE,
  location VARCHAR(50) -- onde fica na loja
);

CREATE INDEX idx_supplies_category ON supplies(category);
CREATE INDEX idx_supplies_low_stock ON supplies(current_stock, min_stock);

-- ============================================
-- RECEITAS DE SERVIÇOS (quais insumos usa)
-- ============================================

CREATE TABLE service_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id),
  supply_id UUID REFERENCES supplies(id),
  quantity DECIMAL(10,2) NOT NULL -- 50 (ml/g)
);

CREATE INDEX idx_service_recipes_service ON service_recipes(service_id);
CREATE INDEX idx_service_recipes_supply ON service_recipes(supply_id);

-- ============================================
-- AGENDAMENTOS
-- ============================================

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  employee_id UUID REFERENCES employees(id),
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'noshow'
  notes TEXT,
  price DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
  checked_in_at TIMESTAMP,
  checked_out_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT
);

CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_employee ON appointments(employee_id);
CREATE INDEX idx_appointments_pet ON appointments(pet_id);

-- ============================================
-- PRODUTOS PARA VENDA
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(30), -- 'food', 'toy', 'accessory', 'medicine'
  brand VARCHAR(50),
  unit VARCHAR(10), -- 'kg', 'g', 'un'
  current_stock DECIMAL(10,2),
  min_stock DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  fractional_sale BOOLEAN DEFAULT false, -- vende por kg?
  supplier VARCHAR(100),
  barcode VARCHAR(50),
  image_url TEXT,
  active BOOLEAN DEFAULT true
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_active ON products(active);

-- ============================================
-- VENDAS (PDV)
-- ============================================

CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  employee_id UUID REFERENCES employees(id),
  sale_date TIMESTAMP DEFAULT NOW(),
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20), -- 'cash', 'credit', 'debit', 'pix', 'installment'
  installment_count INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'completed', -- 'completed', 'cancelled', 'refunded'
  notes TEXT
);

CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_client ON sales(client_id);
CREATE INDEX idx_sales_status ON sales(status);

-- ============================================
-- ITENS DA VENDA
-- ============================================

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id) NOT NULL,
  item_type VARCHAR(10), -- 'product' ou 'service'
  item_id UUID, -- product_id ou appointment_id
  quantity DECIMAL(10,2),
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2)
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);

-- ============================================
-- PLANOS DE ASSINATURA
-- ============================================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  description TEXT,
  monthly_price DECIMAL(10,2) NOT NULL,
  billing_cycle VARCHAR(10) DEFAULT 'monthly', -- 'monthly', 'yearly'
  services_included JSONB, -- [{service_id: 1, quantity: 4}]
  product_discount INTEGER, -- percentual de desconto em produtos
  active BOOLEAN DEFAULT true
);

CREATE INDEX idx_subscription_plans_active ON subscription_plans(active);

-- ============================================
-- ASSINATURAS DE CLIENTES
-- ============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  payment_method JSONB, -- dados do cartão tokenizados
  next_billing_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_client ON subscriptions(client_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_billing_date ON subscriptions(next_billing_date);

-- ============================================
-- USO DE SERVIÇOS DO PLANO
-- ============================================

CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id),
  appointment_id UUID REFERENCES appointments(id),
  service_id UUID REFERENCES services(id),
  used_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscription_usage_subscription ON subscription_usage(subscription_id);
CREATE INDEX idx_subscription_usage_appointment ON subscription_usage(appointment_id);

-- ============================================
-- COMISSÕES
-- ============================================

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  sale_id UUID REFERENCES sales(id),
  commission_type VARCHAR(20),
  base_value DECIMAL(10,2),
  commission_percentage DECIMAL(5,2),
  commission_value DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'calculated', -- 'calculated', 'paid'
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_commissions_employee ON commissions(employee_id);
CREATE INDEX idx_commissions_status ON commissions(status);

-- ============================================
-- NOTIFICAÇÕES
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(30), -- 'appointment_reminder', 'vaccine_alert', 'promotion'
  title VARCHAR(100),
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered BOOLEAN DEFAULT true
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================
-- FOTOS (antes/depois)
-- ============================================

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  photo_url TEXT NOT NULL,
  photo_type VARCHAR(10), -- 'before', 'after', 'gallery'
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  likes INTEGER DEFAULT 0
);

CREATE INDEX idx_photos_pet ON photos(pet_id);
CREATE INDEX idx_photos_appointment ON photos(appointment_id);
CREATE INDEX idx_photos_type ON photos(photo_type);

-- ============================================
-- VACINAS
-- ============================================

CREATE TABLE vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) NOT NULL,
  vaccine_name VARCHAR(100) NOT NULL,
  application_date DATE NOT NULL,
  next_dose_date DATE,
  batch_number VARCHAR(50),
  veterinarian_name VARCHAR(100),
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vaccinations_pet ON vaccinations(pet_id);
CREATE INDEX idx_vaccinations_next_dose ON vaccinations(next_dose_date);

-- ============================================
-- PRONTUÁRIO MÉDICO
-- ============================================

CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID REFERENCES pets(id) NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  record_type VARCHAR(30), -- 'consultation', 'procedure', 'observation'
  title VARCHAR(100),
  description TEXT,
  veterinarian_name VARCHAR(100),
  record_date DATE NOT NULL,
  attachments JSONB, -- URLs de documentos/fotos
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_medical_records_pet ON medical_records(pet_id);
CREATE INDEX idx_medical_records_date ON medical_records(record_date);
```

---

## 🔌 3. API - ENDPOINTS PRINCIPAIS

### **Autenticação**
```
POST   /api/auth/register          # Registrar novo usuário
POST   /api/auth/login             # Login
POST   /api/auth/logout            # Logout
POST   /api/auth/refresh           # Refresh token
POST   /api/auth/forgot-password   # Esqueci senha
POST   /api/auth/reset-password    # Redefinir senha
GET    /api/auth/me                # Dados do usuário logado
```

### **Clientes e Pets**
```
GET    /api/clients                # Listar clientes
GET    /api/clients/:id            # Detalhes do cliente
POST   /api/clients                # Criar cliente
PUT    /api/clients/:id            # Atualizar cliente
DELETE /api/clients/:id            # Excluir cliente

GET    /api/clients/:clientId/pets # Listar pets do cliente
GET    /api/pets                   # Listar todos os pets
GET    /api/pets/:id               # Detalhes do pet
POST   /api/pets                   # Criar pet
PUT    /api/pets/:id               # Atualizar pet
DELETE /api/pets/:id               # Excluir pet
GET    /api/pets/:id/history       # Histórico do pet
GET    /api/pets/:id/photos        # Fotos do pet
POST   /api/pets/:id/photos        # Upload de foto
```

### **Agenda**
```
GET    /api/appointments           # Listar agendamentos
GET    /api/appointments/:id       # Detalhes do agendamento
POST   /api/appointments           # Criar agendamento
PUT    /api/appointments/:id       # Atualizar agendamento
DELETE /api/appointments/:id       # Cancelar agendamento
POST   /api/appointments/:id/checkin    # Check-in
POST   /api/appointments/:id/checkout   # Check-out
POST   /api/appointments/:id/cancel     # Cancelar
GET    /api/availability           # Verificar disponibilidade
                                    # ?date=&employee=&service=
GET    /api/employees             # Listar funcionários
GET    /api/employees/:id/schedule # Agenda do funcionário
```

### **Serviços**
```
GET    /api/services               # Listar serviços
GET    /api/services/:id          # Detalhes do serviço
POST   /api/services               # Criar serviço
PUT    /api/services/:id          # Atualizar serviço
DELETE /api/services/:id          # Excluir serviço
GET    /api/services/:id/recipe   # Receita do serviço (insumos)
```

### **Estoque e Produtos**
```
GET    /api/products               # Listar produtos
GET    /api/products/:id          # Detalhes do produto
POST   /api/products               # Criar produto
PUT    /api/products/:id          # Atualizar produto
DELETE /api/products/:id          # Excluir produto
POST   /api/products/:id/stock    # Ajustar estoque
GET    /api/products/low-stock    # Produtos com estoque baixo

GET    /api/supplies               # Listar insumos
GET    /api/supplies/:id           # Detalhes do insumo
POST   /api/supplies               # Criar insumo
PUT    /api/supplies/:id           # Atualizar insumo
GET    /api/supplies/low-stock     # Insumos com estoque baixo
GET    /api/supplies/expiring      # Insumos próximos ao vencimento
```

### **PDV e Vendas**
```
GET    /api/sales                 # Listar vendas
GET    /api/sales/:id              # Detalhes da venda
POST   /api/sales                  # Criar venda
PUT    /api/sales/:id              # Atualizar venda
DELETE /api/sales/:id              # Cancelar venda
GET    /api/sales/daily-summary    # Resumo do dia
GET    /api/sales/monthly-summary  # Resumo do mês
```

### **Financeiro**
```
GET    /api/commissions           # Listar comissões
GET    /api/commissions/employees/:id  # Comissões do funcionário
POST   /api/commissions/:id/pay   # Marcar comissão como paga

GET    /api/subscriptions/plans   # Listar planos
POST   /api/subscriptions/plans  # Criar plano
GET    /api/subscriptions         # Listar assinaturas
POST   /api/subscriptions        # Criar assinatura
PUT    /api/subscriptions/:id/cancel  # Cancelar assinatura
GET    /api/subscriptions/:id/usage    # Uso da assinatura

GET    /api/cash-flow             # Fluxo de caixa
POST   /api/cash-flow/transactions # Criar transação
GET    /api/reports/dre           # Relatório DRE
GET    /api/reports/revenue        # Relatório de receita
```

### **Notificações**
```
GET    /api/notifications         # Listar notificações
GET    /api/notifications/:id     # Detalhes da notificação
PUT    /api/notifications/:id/read # Marcar como lida
DELETE /api/notifications/:id     # Excluir notificação
```

---

## 📱 4. APP CLIENTE - ESTRUTURA DE PASTAS

```
mobile/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   │
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_constants.dart
│   │   │   ├── colors.dart
│   │   │   └── strings.dart
│   │   ├── models/
│   │   │   ├── user_model.dart
│   │   │   ├── pet_model.dart
│   │   │   ├── appointment_model.dart
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── api_service.dart
│   │   │   ├── auth_service.dart
│   │   │   ├── notification_service.dart
│   │   │   └── storage_service.dart
│   │   ├── providers/
│   │   │   ├── auth_provider.dart
│   │   │   ├── pet_provider.dart
│   │   │   └── appointment_provider.dart
│   │   ├── router/
│   │   │   └── app_router.dart
│   │   └── widgets/
│   │       ├── role_guard.dart
│   │       ├── loading_widget.dart
│   │       └── error_widget.dart
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── presentation/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── login_page.dart
│   │   │   │   │   ├── register_page.dart
│   │   │   │   │   └── forgot_password_page.dart
│   │   │   │   └── widgets/
│   │   │   └── domain/
│   │   │       └── auth_repository.dart
│   │   │
│   │   ├── home/
│   │   │   └── presentation/
│   │   │       └── pages/
│   │   │           └── home_page.dart
│   │   │
│   │   ├── pets/
│   │   │   ├── presentation/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── pets_list_page.dart
│   │   │   │   │   ├── pet_detail_page.dart
│   │   │   │   │   └── add_pet_page.dart
│   │   │   │   └── widgets/
│   │   │   │       ├── pet_card.dart
│   │   │   │       └── pet_avatar.dart
│   │   │   └── domain/
│   │   │       └── pet_repository.dart
│   │   │
│   │   ├── appointments/
│   │   │   ├── presentation/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── appointments_list_page.dart
│   │   │   │   │   ├── booking_page.dart
│   │   │   │   │   ├── select_service_page.dart
│   │   │   │   │   ├── select_datetime_page.dart
│   │   │   │   │   └── confirmation_page.dart
│   │   │   │   └── widgets/
│   │   │   │       ├── appointment_card.dart
│   │   │   │       ├── time_slot.dart
│   │   │   │       └── status_badge.dart
│   │   │   └── domain/
│   │   │       └── appointment_repository.dart
│   │   │
│   │   ├── gallery/
│   │   │   └── presentation/
│   │   │       ├── pages/
│   │   │       │   ├── gallery_page.dart
│   │   │       │   └── photo_view_page.dart
│   │   │       └── widgets/
│   │   │
│   │   └── profile/
│   │       └── presentation/
│   │           ├── pages/
│   │           │   ├── profile_page.dart
│   │           │   ├── subscription_page.dart
│   │           │   └── settings_page.dart
│   │           └── widgets/
│   │
│   └── shared/
│       ├── widgets/
│       │   ├── button.dart
│       │   ├── card.dart
│       │   ├── input.dart
│       │   └── modal.dart
│       └── utils/
│           ├── date_formatter.dart
│           ├── currency_formatter.dart
│           └── validators.dart
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── test/
├── pubspec.yaml
└── README.md
```

---

## 💻 5. PAINEL GESTOR - ESTRUTURA DE PASTAS

```
web/
├── public/
│   ├── index.html
│   └── favicon.ico
│
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   │
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   │
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Alert.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   └── Badge.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatsCard.jsx
│   │   │   ├── RevenueChart.jsx
│   │   │   └── RecentAppointments.jsx
│   │   │
│   │   └── forms/
│   │       ├── ClientForm.jsx
│   │       ├── PetForm.jsx
│   │       ├── ProductForm.jsx
│   │       └── AppointmentForm.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.jsx
│   │   │
│   │   ├── Clients/
│   │   │   ├── ClientsPage.jsx
│   │   │   ├── ClientDetailPage.jsx
│   │   │   └── ClientFormPage.jsx
│   │   │
│   │   ├── Appointments/
│   │   │   ├── AppointmentsPage.jsx
│   │   │   ├── CalendarView.jsx
│   │   │   ├── AppointmentDetailPage.jsx
│   │   │   └── AppointmentFormPage.jsx
│   │   │
│   │   ├── Employees/
│   │   │   ├── EmployeesPage.jsx
│   │   │   └── EmployeeFormPage.jsx
│   │   │
│   │   ├── Stock/
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ProductFormPage.jsx
│   │   │   ├── SuppliesPage.jsx
│   │   │   └── StockEntryPage.jsx
│   │   │
│   │   ├── Sales/
│   │   │   ├── PDVPage.jsx
│   │   │   ├── SalesHistoryPage.jsx
│   │   │   └── SaleDetailPage.jsx
│   │   │
│   │   ├── Financial/
│   │   │   ├── CommissionsPage.jsx
│   │   │   ├── SubscriptionsPage.jsx
│   │   │   ├── CashFlowPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   │
│   │   └── Settings/
│   │       ├── ServicesPage.jsx
│   │       ├── UsersPage.jsx
│   │       └── GeneralSettingsPage.jsx
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── reports.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useClients.js
│   │   ├── useAppointments.js
│   │   └── useProducts.js
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── dateHelpers.js
│   │
│   ├── constants/
│   │   ├── colors.js
│   │   └── config.js
│   │
│   └── styles/
│       ├── index.css
│       └── theme.css
│
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔐 6. SEGURANÇA

### **Autenticação**
- ✅ JWT com refresh token
- ✅ Autenticação de dois fatores para admin (2FA)
- ✅ Biometria no app cliente (opcional)
- ✅ Tokens com expiração curta (15min access, 7 dias refresh)

### **Dados**
- ✅ HTTPS obrigatório em produção
- ✅ Criptografia de dados sensíveis no banco (bcrypt para senhas)
- ✅ Tokens de pagamento (nunca armazenar dados de cartão)
- ✅ GDPR/LGPD: usuário pode solicitar exclusão de dados

### **APIs**
- ✅ Rate limiting (100 req/min por IP)
- ✅ Validação de entrada (sanitização)
- ✅ CORS configurado adequadamente
- ✅ Logs de ações importantes (auditoria)

### **Backend**
- ✅ Validação de dados com express-validator
- ✅ Middleware de autenticação em rotas protegidas
- ✅ Controle de acesso baseado em roles (RBAC)
- ✅ Sanitização de inputs SQL (prevenção de SQL injection)

---

## 📦 7. SERVIÇOS EXTERNOS

| Serviço | Função | Custo estimado |
|:---|:---|:---|
| **AWS S3** | Armazenar fotos | R$ 0,023/GB |
| **CloudFront** | Entregar imagens rápido (CDN) | R$ 0,085/GB |
| **OneSignal** | Push notifications | Grátis até 10k usuários |
| **WhatsApp API** | Mensagens automáticas | Por conversa |
| **Mercado Pago** | Pagamentos | Taxa por transação |
| **Sentry** | Monitoramento de erros | Grátis até 5k erros/mês |
| **Redis** | Cache e filas | Incluso em alguns planos |

### **Integrações Planejadas**

#### **Push Notifications**
- OneSignal ou Firebase Cloud Messaging
- Notificações de agendamento, check-in/out, vacinas

#### **Pagamentos**
- Mercado Pago (Brasil)
- Stripe (internacional)
- PIX integrado

#### **Armazenamento**
- AWS S3 para fotos e documentos
- CloudFront para CDN

#### **Monitoramento**
- Sentry para erros
- LogRocket para sessões (opcional)

---

## 📊 8. ESTIMATIVA DE CUSTOS (Mensal)

| Item | Plano inicial | Escala média |
|:---|:---|:---|
| **Servidor (API)** | R$ 50 (Digital Ocean) | R$ 200 (AWS) |
| **Banco de Dados** | R$ 50 (PostgreSQL) | R$ 300 (RDS) |
| **Armazenamento (S3)** | R$ 10 | R$ 50 |
| **CDN (CloudFront)** | R$ 10 | R$ 100 |
| **Push Notifications** | Grátis | Grátis |
| **Monitoramento (Sentry)** | Grátis | R$ 50 |
| **Total** | **R$ 120/mês** | **R$ 700/mês** |

### **Observações**
- Custos podem variar conforme uso real
- Push notifications grátis até 10k usuários
- Monitoramento básico grátis
- Escala média considera ~1000 clientes ativos

---

## 🚀 9. DEPLOY E HOSPEDAGEM

### **Backend**
- **Desenvolvimento:** Local (localhost:3000)
- **Produção:** AWS EC2, Google Cloud Run, ou Digital Ocean
- **Banco de Dados:** AWS RDS (PostgreSQL) ou Digital Ocean Managed Database

### **App Cliente**
- **Android:** Google Play Store
- **iOS:** Apple App Store
- **Web:** Firebase Hosting ou Netlify

### **Painel Gestor**
- **Desenvolvimento:** Local (localhost:3005)
- **Produção:** Vercel, Netlify, ou AWS Amplify

---

## 📋 10. CHECKLIST DE IMPLEMENTAÇÃO

### **Backend**
- [ ] Configurar banco de dados PostgreSQL
- [ ] Criar migrations para todas as tabelas
- [ ] Implementar autenticação JWT
- [ ] Criar todos os endpoints da API
- [ ] Implementar validações e sanitização
- [ ] Configurar rate limiting
- [ ] Implementar logs de auditoria
- [ ] Configurar CORS adequadamente

### **App Cliente (Flutter)**
- [ ] Configurar estrutura de pastas
- [ ] Implementar tema baseado no Design System
- [ ] Criar componentes reutilizáveis
- [ ] Implementar navegação (go_router)
- [ ] Integrar com API
- [ ] Implementar autenticação
- [ ] Adicionar notificações push
- [ ] Testar em Android, iOS e Web

### **Painel Gestor (React)**
- [ ] Configurar estrutura de pastas
- [ ] Implementar tema baseado no Design System
- [ ] Criar componentes reutilizáveis
- [ ] Implementar roteamento (React Router)
- [ ] Integrar com API
- [ ] Implementar autenticação
- [ ] Adicionar gráficos e relatórios
- [ ] Testar responsividade

---

## 📚 11. REFERÊNCIAS

### **Documentos Relacionados**
- `DESIGN_SYSTEM.md` - Sistema de design completo
- `BUSINESS_RULES.md` - Regras de negócio
- `USER_FLOWS.md` - Fluxos de usuário
- `MVP_PRIORITIZATION.md` - Priorização MVP

### **Tecnologias**
- [Flutter Documentation](https://flutter.dev/docs)
- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---

**Última atualização:** 2026-02-20  
**Versão:** 3.0 (Arquitetura Técnica Completa)

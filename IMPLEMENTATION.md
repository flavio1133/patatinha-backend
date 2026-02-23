# 🚀 FASE 4 - IMPLEMENTAÇÃO (PROGRAMAÇÃO)

Este documento define o plano completo de implementação do sistema Patatinha, desde a configuração do ambiente até o deploy contínuo.

---

## 📋 VISÃO GERAL DA FASE 4

| Etapa | Descrição | Status |
|:---|:---|:---|
| **4.1** | Configuração do Ambiente de Desenvolvimento | ⏳ Pendente |
| **4.2** | Configuração do Banco de Dados | ⏳ Pendente |
| **4.3** | Desenvolvimento do Backend (API) | ⏳ Pendente |
| **4.4** | Desenvolvimento do Painel Web (Gestor) | ⏳ Pendente |
| **4.5** | Desenvolvimento do App Mobile (Cliente) | ⏳ Pendente |
| **4.6** | Integrações com Serviços Externos | ⏳ Pendente |
| **4.7** | Versionamento e Deploy Contínuo (CI/CD) | ⏳ Pendente |

---

## 4.1 CONFIGURAÇÃO DO AMBIENTE DE DESENVOLVIMENTO

### 4.1.1 Ferramentas Necessárias

| Ferramenta | Versão Recomendada | Função | Onde baixar |
|:---|:---|:---|:---|
| **Git** | 2.40+ | Versionamento de código | https://git-scm.com |
| **Node.js** | 18.x LTS | Runtime para backend | https://nodejs.org |
| **npm/yarn** | 9.x / 1.22+ | Gerenciador de pacotes | Incluído com Node.js |
| **Docker** | 24.x | Containerização | https://docker.com |
| **Docker Compose** | 2.x | Orquestração de containers | Incluído com Docker |
| **PostgreSQL** | 15.x | Banco de dados | https://postgresql.org |
| **Redis** | 7.x | Cache e filas | https://redis.io |
| **VS Code** | Latest | Editor de código | https://code.visualstudio.com |
| **Insomnia/Postman** | Latest | Testar APIs | https://insomnia.rest |
| **Flutter** | 3.16+ | Framework mobile | https://flutter.dev |
| **Android Studio** | Latest | Emulador Android | https://developer.android.com/studio |
| **Xcode** | 15+ | Emulador iOS (só Mac) | App Store |

### 4.1.2 Configuração Inicial

#### **Instalação e Configuração**

```bash
# 1. Verificar instalações
node --version    # Deve ser 18.x ou superior
npm --version     # Deve ser 9.x ou superior
git --version     # Deve ser 2.40 ou superior
docker --version  # Deve estar instalado
flutter --version # Deve ser 3.16 ou superior

# 2. Configurar Git
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# 3. Gerar SSH key para GitHub
ssh-keygen -t ed25519 -C "seu.email@exemplo.com"
# Copiar chave pública para GitHub Settings > SSH Keys
cat ~/.ssh/id_ed25519.pub
```

#### **Criação de Repositórios**

```
☐ Criar conta no GitHub/GitLab
☐ Criar repositórios:
   ├── petshop-backend (privado)
   ├── petshop-web (privado)
   └── petshop-mobile (privado)
☐ Clonar repositórios localmente
☐ Configurar SSH keys para acesso seguro
```

### 4.1.3 Estrutura de Pastas Inicial

```
projeto-petshop/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   ├── migrations/
│   ├── seeds/
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── jest.config.js
│   └── README.md
├── web/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   ├── public/
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── mobile/
│   ├── lib/
│   │   ├── core/
│   │   ├── features/
│   │   └── shared/
│   ├── assets/
│   ├── test/
│   ├── .env.example
│   ├── .env
│   ├── .gitignore
│   ├── pubspec.yaml
│   └── README.md
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 4.2 CONFIGURAÇÃO DO BANCO DE DADOS

### 4.2.1 Escolha do Banco

Baseado na Fase 3, usaremos:
- **PostgreSQL** (principal) - Versão 15.x
- **Redis** (cache e filas) - Versão 7.x

### 4.2.2 Configuração Local

#### **Opção 1: Docker (Recomendado)**

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: petshop_postgres
    environment:
      POSTGRES_USER: petshop_user
      POSTGRES_PASSWORD: petshop_pass
      POSTGRES_DB: petshop_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U petshop_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: petshop_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:
```

```bash
# Iniciar containers
docker-compose up -d

# Verificar status
docker-compose ps

# Conectar ao PostgreSQL
docker exec -it petshop_postgres psql -U petshop_user -d petshop_db
```

#### **Opção 2: Instalação Local**

```bash
# macOS (Homebrew)
brew install postgresql@15 redis

# Ubuntu/Debian
sudo apt-get install postgresql-15 redis-server

# Windows
# Baixar instaladores do site oficial
```

### 4.2.3 Criação das Tabelas

Vamos criar **TODAS as tabelas** que modelamos na Fase 3:

```
☐ users
☐ clients
☐ employees
☐ pets
☐ services
☐ supplies
☐ service_recipes
☐ appointments
☐ products
☐ sales
☐ sale_items
☐ subscription_plans
☐ subscriptions
☐ subscription_usage
☐ commissions
☐ notifications
☐ photos
☐ vaccinations
☐ medical_records
```

### 4.2.4 Script SQL Inicial

```sql
-- 4.2.4.1 Criar database
CREATE DATABASE petshop_db;

-- 4.2.4.2 Conectar ao database
\c petshop_db;

-- 4.2.4.3 Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 4.2.4.4 Criar tabela users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255),
  role VARCHAR(20) DEFAULT 'client',
  firebase_uid VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 4.2.4.5 Criar tabela clients
CREATE TABLE clients (
  id UUID PRIMARY KEY REFERENCES users(id),
  address TEXT,
  birth_date DATE,
  how_found VARCHAR(50),
  notes TEXT,
  total_spent DECIMAL(10,2) DEFAULT 0,
  last_visit DATE
);

CREATE INDEX idx_clients_last_visit ON clients(last_visit);

-- [Continuar com todas as outras tabelas conforme ARCHITECTURE_TECHNICAL.md]
```

**Nota:** O script completo está em `ARCHITECTURE_TECHNICAL.md` seção 2.

### 4.2.5 Migrations

Usar ferramenta de migrations (ex: `node-pg-migrate` ou `knex`):

```bash
# Instalar ferramenta de migrations
npm install -g node-pg-migrate

# Criar migration inicial
node-pg-migrate create initial-schema

# Executar migrations
node-pg-migrate up
```

---

## 4.3 DESENVOLVIMENTO DO BACKEND (API)

### 4.3.1 Configuração Inicial do Backend

```bash
# Criar projeto
mkdir backend && cd backend
npm init -y

# Instalar dependências principais
npm install express pg dotenv bcryptjs jsonwebtoken multer cors helmet express-validator

# Instalar dependências de desenvolvimento
npm install -D nodemon jest supertest @types/node

# Criar estrutura de pastas
mkdir -p src/{config,models,controllers,routes,middlewares,services,utils}
mkdir -p tests migrations seeds
```

#### **package.json**

```json
{
  "name": "petshop-backend",
  "version": "1.0.0",
  "description": "Backend API para Pet Shop",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "migrate": "node-pg-migrate"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

### 4.3.2 Estrutura do Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Conexão PostgreSQL
│   │   ├── redis.js             # Conexão Redis
│   │   └── auth.js              # Configuração JWT
│   ├── models/
│   │   ├── UserModel.js
│   │   ├── ClientModel.js
│   │   ├── PetModel.js
│   │   ├── AppointmentModel.js
│   │   └── ...
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── ClientController.js
│   │   ├── PetController.js
│   │   ├── AppointmentController.js
│   │   └── ...
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── petRoutes.js
│   │   ├── appointmentRoutes.js
│   │   └── index.js
│   ├── middlewares/
│   │   ├── authMiddleware.js    # Verificar JWT
│   │   ├── roleMiddleware.js    # Verificar roles
│   │   └── validationMiddleware.js
│   ├── services/
│   │   ├── EmailService.js
│   │   ├── NotificationService.js
│   │   ├── PaymentService.js
│   │   └── StorageService.js
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── errors.js
│   └── server.js                # Entry point
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── migrations/
├── seeds/
├── .env.example
├── .env
├── .gitignore
├── jest.config.js
└── package.json
```

### 4.3.3 Endpoints por Módulo

#### **4.3.3.1 Autenticação**

```
☐ POST /api/auth/register
   ├── Validar dados de entrada
   ├── Hash da senha
   ├── Criar usuário no banco
   └── Retornar token JWT

☐ POST /api/auth/login
   ├── Validar credenciais
   ├── Verificar senha
   └── Retornar token JWT

☐ POST /api/auth/logout
   └── Invalidar token (opcional, depende da estratégia)

☐ POST /api/auth/refresh
   └── Gerar novo token a partir do refresh token

☐ POST /api/auth/forgot-password
   ├── Gerar token de recuperação
   └── Enviar e-mail com link

☐ POST /api/auth/reset-password
   ├── Validar token
   ├── Hash nova senha
   └── Atualizar senha

☐ GET /api/auth/me
   └── Retornar dados do usuário logado
```

#### **4.3.3.2 Clientes e Pets**

```
☐ GET /api/clients
   ├── Listar clientes (com paginação)
   ├── Filtros: busca, ordenação
   └── Apenas gestores

☐ GET /api/clients/:id
   └── Detalhes do cliente

☐ POST /api/clients
   ├── Validar dados
   ├── Criar usuário + cliente
   └── Retornar cliente criado

☐ PUT /api/clients/:id
   ├── Validar dados
   └── Atualizar cliente

☐ DELETE /api/clients/:id
   └── Soft delete (marcar como inativo)

☐ GET /api/clients/:clientId/pets
   └── Listar pets do cliente

☐ GET /api/pets/:id
   └── Detalhes do pet

☐ POST /api/pets
   ├── Validar dados (RN002)
   ├── Verificar limite de pets (RN001)
   └── Criar pet

☐ PUT /api/pets/:id
   ├── Validar dados
   └── Atualizar pet

☐ DELETE /api/pets/:id
   └── Soft delete

☐ GET /api/pets/:id/history
   └── Histórico de serviços do pet

☐ POST /api/pets/:id/photos
   ├── Upload de imagem
   ├── Salvar no S3/Cloudinary
   └── Salvar URL no banco
```

#### **4.3.3.3 Agenda**

```
☐ GET /api/appointments
   ├── Listar agendamentos
   ├── Filtros: data, profissional, status
   └── Paginação

☐ GET /api/appointments/:id
   └── Detalhes do agendamento

☐ POST /api/appointments
   ├── Validar dados
   ├── Verificar disponibilidade (RN011, RN012)
   ├── Calcular duração (RN010)
   └── Criar agendamento

☐ PUT /api/appointments/:id
   ├── Validar dados
   └── Atualizar agendamento

☐ DELETE /api/appointments/:id
   ├── Verificar regras de cancelamento (RN007, RN008)
   └── Cancelar agendamento

☐ POST /api/appointments/:id/checkin
   ├── Verificar tolerância (RN013)
   ├── Atualizar status
   └── Enviar notificação

☐ POST /api/appointments/:id/checkout
   ├── Verificar se pode fazer checkout (RN014)
   ├── Calcular comissão
   ├── Baixar insumos
   └── Enviar notificação

☐ POST /api/appointments/:id/cancel
   └── Cancelar agendamento

☐ GET /api/availability
   ├── Parâmetros: date, employee, service
   ├── Calcular horários disponíveis
   └── Retornar slots livres

☐ GET /api/employees
   └── Listar funcionários disponíveis
```

#### **4.3.3.4 Estoque e PDV**

```
☐ GET /api/products
   ├── Listar produtos
   ├── Filtros: categoria, estoque baixo
   └── Paginação

☐ GET /api/products/:id
   └── Detalhes do produto

☐ POST /api/products
   ├── Validar dados
   └── Criar produto

☐ PUT /api/products/:id
   ├── Validar dados
   └── Atualizar produto

☐ DELETE /api/products/:id
   └── Soft delete

☐ POST /api/products/:id/stock
   ├── Registrar entrada/saída
   └── Atualizar estoque

☐ GET /api/supplies
   └── Listar insumos

☐ GET /api/supplies/low-stock
   └── Insumos com estoque baixo (RN019)

☐ GET /api/sales
   ├── Listar vendas
   └── Filtros: data, cliente

☐ POST /api/sales
   ├── Validar itens
   ├── Verificar estoque (RN024)
   ├── Calcular totais
   ├── Baixar estoque
   ├── Calcular comissões
   └── Criar venda
```

#### **4.3.3.5 Financeiro**

```
☐ GET /api/commissions
   ├── Listar comissões
   └── Filtros: funcionário, período

☐ POST /api/commissions/:id/pay
   ├── Marcar como paga
   └── Registrar no fluxo de caixa

☐ GET /api/subscriptions/plans
   └── Listar planos disponíveis

☐ POST /api/subscriptions/plans
   └── Criar novo plano

☐ GET /api/subscriptions
   └── Listar assinaturas

☐ POST /api/subscriptions
   ├── Criar assinatura
   └── Processar primeira cobrança

☐ GET /api/cash-flow
   ├── Fluxo de caixa
   └── Filtros: período

☐ GET /api/reports/dre
   └── Relatório DRE
```

### 4.3.4 Testes Unitários do Backend

```javascript
// Exemplo: tests/unit/AuthController.test.js
const request = require('supertest');
const app = require('../../src/server');

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });
  });
});
```

```
☐ Configurar Jest
☐ Testes para models
☐ Testes para controllers
☐ Testes para middlewares
☐ Testes para utils
☐ Testes de integração da API
☐ Cobertura mínima: 80%
```

---

## 4.4 DESENVOLVIMENTO DO PAINEL WEB (GESTOR)

### 4.4.1 Configuração Inicial

```bash
# Criar projeto React com Vite
npm create vite@latest web -- --template react
cd web
npm install

# Instalar dependências principais
npm install axios react-router-dom react-query react-hook-form recharts date-fns

# Instalar dependências de estilização (escolher uma)
npm install styled-components
# ou
npm install tailwindcss postcss autoprefixer

# Instalar dependências de desenvolvimento
npm install -D @types/react @types/react-dom
```

#### **package.json**

```json
{
  "name": "petshop-web",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-query": "^3.39.3",
    "axios": "^1.6.2",
    "react-hook-form": "^7.48.2",
    "recharts": "^2.10.3",
    "date-fns": "^2.30.0"
  }
}
```

### 4.4.2 Estrutura do Painel Web

```
web/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Table.jsx
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Layout.jsx
│   │   └── forms/
│   │       ├── ClientForm.jsx
│   │       ├── PetForm.jsx
│   │       └── ProductForm.jsx
│   ├── pages/
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── Clients/
│   │   │   ├── ClientsPage.jsx
│   │   │   ├── ClientDetailPage.jsx
│   │   │   └── ClientFormPage.jsx
│   │   ├── Appointments/
│   │   │   ├── AppointmentsPage.jsx
│   │   │   ├── CalendarView.jsx
│   │   │   └── AppointmentDetailPage.jsx
│   │   ├── Stock/
│   │   │   ├── ProductsPage.jsx
│   │   │   └── ProductFormPage.jsx
│   │   ├── Sales/
│   │   │   └── PDVPage.jsx
│   │   └── Financial/
│   │       ├── CommissionsPage.jsx
│   │       └── CashFlowPage.jsx
│   ├── services/
│   │   ├── api.js
│   │   └── auth.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useClients.js
│   │   └── useAppointments.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── utils/
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── styles/
│   │   ├── index.css
│   │   └── theme.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .env
├── vite.config.js
└── package.json
```

### 4.4.3 Telas a Desenvolver (MVP)

#### **4.4.3.1 Autenticação**

```
☐ Tela de Login
   ├── Campos: email, senha
   ├── Validação de formulário
   ├── Integração com API
   └── Redirecionamento após login

☐ Tela de Recuperar Senha
   ├── Campo: email
   ├── Enviar link de recuperação
   └── Mensagem de sucesso
```

#### **4.4.3.2 Dashboard**

```
☐ Cards de resumo
   ├── Agendamentos hoje
   ├── Faturamento do dia
   ├── Alertas (estoque baixo, vacinas)
   └── Dados em tempo real

☐ Gráfico de faturamento
   ├── Últimos 7 dias
   ├── Comparação com período anterior
   └── Usar Recharts

☐ Lista de próximos agendamentos
   ├── Próximos 5 agendamentos
   ├── Link para detalhes
   └── Status colorido
```

#### **4.4.3.3 Clientes**

```
☐ Lista de clientes
   ├── Busca por nome/telefone
   ├── Filtros
   ├── Paginação
   └── Link para detalhes

☐ Detalhes do cliente
   ├── Dados pessoais
   ├── Lista de pets
   ├── Histórico de serviços
   └── Botões de ação

☐ Formulário de cadastro/edição
   ├── Validação de campos
   ├── Integração com API
   └── Mensagens de erro/sucesso
```

#### **4.4.3.4 Agenda**

```
☐ Calendário/agenda
   ├── Visão dia/semana/mês
   ├── Filtro por profissional
   ├── Drag and drop (opcional)
   └── Cores por status

☐ Detalhes do agendamento
   ├── Dados completos
   ├── Botões: check-in, check-out, cancelar
   └── Histórico do pet

☐ Formulário de novo agendamento
   ├── Seleção de cliente/pet
   ├── Seleção de serviço
   ├── Seleção de data/hora
   └── Validação de disponibilidade
```

#### **4.4.3.5 Estoque**

```
☐ Lista de produtos
   ├── Busca e filtros
   ├── Status de estoque (cores)
   ├── Alertas visuais
   └── Ações rápidas

☐ Formulário de produto
   ├── Todos os campos
   ├── Upload de imagem
   └── Validação

☐ Controle de estoque
   ├── Entrada de estoque
   ├── Ajuste manual
   └── Histórico de movimentações
```

#### **4.4.3.6 PDV**

```
☐ Tela de venda
   ├── Busca de cliente
   ├── Busca de produtos
   ├── Carrinho de compras
   ├── Cálculo automático
   ├── Seleção de forma de pagamento
   └── Finalização

☐ Comprovante
   ├── Dados da venda
   ├── Opção de impressão
   └── Envio por WhatsApp
```

---

## 4.5 DESENVOLVIMENTO DO APP MOBILE (CLIENTE)

### 4.5.1 Configuração Inicial

```bash
# Criar projeto Flutter
flutter create mobile
cd mobile

# Adicionar dependências no pubspec.yaml
flutter pub get
```

#### **pubspec.yaml**

```yaml
name: petshop_mobile
description: App cliente para Pet Shop

dependencies:
  flutter:
    sdk: flutter
  
  # Navegação
  go_router: ^13.0.0
  
  # Estado
  provider: ^6.1.1
  
  # HTTP
  http: ^1.1.0
  
  # Storage
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  
  # Notificações
  flutter_local_notifications: ^16.3.0
  
  # Imagens
  cached_network_image: ^3.3.0
  image_picker: ^1.0.5
  
  # Utils
  intl: ^0.19.0
  mask_text_input_formatter: ^2.0.0
```

### 4.5.2 Estrutura do App Mobile

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
│   │   │   └── appointment_model.dart
│   │   ├── services/
│   │   │   ├── api_service.dart
│   │   │   ├── auth_service.dart
│   │   │   └── notification_service.dart
│   │   ├── providers/
│   │   │   ├── auth_provider.dart
│   │   │   └── pet_provider.dart
│   │   ├── router/
│   │   │   └── app_router.dart
│   │   └── widgets/
│   │       ├── role_guard.dart
│   │       └── loading_widget.dart
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   └── presentation/
│   │   │       └── pages/
│   │   │           ├── login_page.dart
│   │   │           └── register_page.dart
│   │   ├── home/
│   │   │   └── presentation/
│   │   │       └── pages/
│   │   │           └── home_page.dart
│   │   ├── pets/
│   │   │   └── presentation/
│   │   │       └── pages/
│   │   │           ├── pets_list_page.dart
│   │   │           └── pet_detail_page.dart
│   │   └── appointments/
│   │       └── presentation/
│   │           └── pages/
│   │               ├── appointments_list_page.dart
│   │               └── booking_page.dart
│   │
│   └── shared/
│       ├── widgets/
│       │   ├── button.dart
│       │   ├── card.dart
│       │   └── input.dart
│       └── utils/
│           ├── date_formatter.dart
│           └── currency_formatter.dart
│
├── assets/
│   ├── images/
│   └── icons/
│
├── test/
├── .env
├── pubspec.yaml
└── README.md
```

### 4.5.3 Telas a Desenvolver (MVP)

#### **4.5.3.1 Autenticação**

```
☐ Onboarding
   ├── 3 telas de apresentação
   ├── Navegação com indicadores
   └── Botão "Começar"

☐ Login
   ├── Opções: WhatsApp ou E-mail
   ├── Campos de login
   ├── Validação
   └── Redirecionamento

☐ Cadastro
   ├── Formulário completo
   ├── Validação de campos
   └── Integração com API

☐ Recuperar senha
   ├── Campo de e-mail
   └── Envio de link
```

#### **4.5.3.2 Home**

```
☐ Dashboard do cliente
   ├── Saudação personalizada
   ├── Card de próximo agendamento
   ├── Lista de pets (horizontal)
   ├── Últimos serviços
   └── Botão flutuante "Agendar"

☐ Navegação inferior
   ├── Home
   ├── Agendamentos
   ├── Fotos
   └── Perfil
```

#### **4.5.3.3 Pets**

```
☐ Lista de pets
   ├── Cards com foto
   ├── Nome e espécie
   └── Link para detalhes

☐ Perfil do pet
   ├── Foto grande
   ├── Dados do pet
   ├── Abas: Histórico, Fotos, Info
   └── Botão editar

☐ Histórico de serviços
   ├── Lista cronológica
   ├── Data, serviço, profissional
   └── Link para detalhes
```

#### **4.5.3.4 Agendamentos**

```
☐ Lista de agendamentos
   ├── Próximos agendamentos
   ├── Histórico
   └── Filtros

☐ Detalhes do agendamento
   ├── Dados completos
   ├── Status visual
   └── Botões de ação

☐ Fluxo de agendamento
   ├── Passo 1: Escolher pet
   ├── Passo 2: Escolher serviço
   ├── Passo 3: Escolher data/hora
   ├── Passo 4: Confirmar
   └── Tela de sucesso
```

#### **4.5.3.5 Acompanhamento**

```
☐ Tela de status em tempo real
   ├── Status atual (check-in, em andamento, pronto)
   ├── Barra de progresso
   ├── Previsão de término
   └── Fotos do atendimento

☐ Notificações
   ├── Push notifications
   ├── Check-in recebido
   ├── Pet pronto
   └── Foto disponível
```

---

## 4.6 INTEGRAÇÕES COM SERVIÇOS EXTERNOS

### 4.6.1 Lista de Integrações

```
☐ Upload de imagens (AWS S3 / Cloudinary)
☐ Gateway de pagamento (Mercado Pago / Stripe)
☐ Notificações push (OneSignal / Firebase)
☐ WhatsApp API (integração)
☐ Envio de e-mails (SendGrid / AWS SES)
☐ Monitoramento (Sentry)
```

### 4.6.2 Configuração de Cada Integração

#### **4.6.2.1 AWS S3 (Upload de Imagens)**

```javascript
// services/StorageService.js
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Configurar multer para upload direto ao S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, `pets/${Date.now()}-${file.originalname}`);
    }
  })
});
```

```
☐ Criar conta AWS
☐ Criar bucket S3
☐ Configurar CORS
☐ Obter chaves de acesso
☐ Configurar variáveis de ambiente
☐ Testar upload
```

#### **4.6.2.2 Mercado Pago (Pagamentos)**

```javascript
// services/PaymentService.js
const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
});

async function createPayment(amount, description) {
  const payment_data = {
    transaction_amount: amount,
    description: description,
    payment_method_id: 'pix',
    payer: {
      email: 'customer@example.com'
    }
  };
  
  return await mercadopago.payment.save(payment_data);
}
```

```
☐ Criar conta Mercado Pago
☐ Obter credenciais (Access Token)
☐ Configurar webhooks
☐ Testar pagamentos em sandbox
☐ Implementar tratamento de webhooks
```

#### **4.6.2.3 OneSignal (Push Notifications)**

```javascript
// services/NotificationService.js
const OneSignal = require('onesignal-node');

const client = new OneSignal.Client(
  process.env.ONESIGNAL_APP_ID,
  process.env.ONESIGNAL_REST_API_KEY
);

async function sendPushNotification(userIds, message) {
  const notification = {
    contents: { en: message },
    include_player_ids: userIds
  };
  
  return await client.createNotification(notification);
}
```

```
☐ Criar conta OneSignal
☐ Criar app
☐ Obter App ID e REST API Key
☐ Configurar no mobile (Flutter)
☐ Testar envio de notificações
```

#### **4.6.2.4 WhatsApp API**

```
☐ Escolher provedor (Twilio, Evolution API, etc.)
☐ Criar conta
☐ Obter credenciais
☐ Configurar webhook
☐ Implementar envio de mensagens
☐ Testar integração
```

#### **4.6.2.5 SendGrid (E-mails)**

```javascript
// services/EmailService.js
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, html) {
  const msg = {
    to: to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: subject,
    html: html
  };
  
  return await sgMail.send(msg);
}
```

```
☐ Criar conta SendGrid
☐ Verificar domínio
☐ Obter API Key
☐ Configurar templates
☐ Testar envio
```

#### **4.6.2.6 Sentry (Monitoramento)**

```javascript
// server.js
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

```
☐ Criar conta Sentry
☐ Criar projeto
☐ Obter DSN
☐ Configurar no backend e frontend
☐ Testar captura de erros
```

---

## 4.7 VERSIONAMENTO E DEPLOY CONTÍNUO (CI/CD)

### 4.7.1 Configuração do Git

#### **Estratégia de Branches (GitFlow)**

```
main          → Produção (protegida)
├── develop   → Desenvolvimento
│   ├── feature/auth          → Nova funcionalidade
│   ├── feature/appointments  → Nova funcionalidade
│   ├── bugfix/login-error    → Correção de bug
│   └── hotfix/critical-bug   → Correção urgente
```

```bash
# Criar branches
git checkout -b develop
git checkout -b feature/nome-da-feature

# Padrão de commits
git commit -m "feat: adicionar autenticação JWT"
git commit -m "fix: corrigir erro no login"
git commit -m "docs: atualizar README"
git commit -m "test: adicionar testes de integração"
```

#### **Conventional Commits**

```
feat:     Nova funcionalidade
fix:      Correção de bug
docs:     Documentação
style:    Formatação
refactor: Refatoração
test:     Testes
chore:    Tarefas de manutenção
```

### 4.7.2 CI/CD com GitHub Actions

#### **Workflow de Testes**

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ develop, main ]
  pull_request:
    branches: [ develop, main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

#### **Workflow de Deploy**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to production
        run: |
          # Comandos de deploy
          # Ex: rsync, scp, ou deploy para AWS/Heroku
```

### 4.7.3 Ambientes

```
☐ Ambiente de desenvolvimento (local)
   ├── Banco: PostgreSQL local ou Docker
   ├── Backend: localhost:3000
   └── Frontend: localhost:3005

☐ Ambiente de homologação (staging)
   ├── Banco: PostgreSQL em servidor de teste
   ├── Backend: api-staging.petshop.com
   └── Frontend: staging.petshop.com

☐ Ambiente de produção
   ├── Banco: PostgreSQL em servidor de produção
   ├── Backend: api.petshop.com
   └── Frontend: app.petshop.com
```

---

## 📊 CHECKLIST GERAL DA FASE 4

```
☐ 4.1 Configuração do Ambiente
   ☐ 4.1.1 Ferramentas instaladas
   ☐ 4.1.2 Repositórios criados
   ☐ 4.1.3 Estrutura de pastas criada
   ☐ 4.1.4 Git configurado

☐ 4.2 Banco de Dados
   ☐ 4.2.1 PostgreSQL instalado/configurado
   ☐ 4.2.2 Redis instalado/configurado
   ☐ 4.2.3 Database criado
   ☐ 4.2.4 Todas as tabelas criadas (migrations)
   ☐ 4.2.5 Seeds de dados iniciais
   ☐ 4.2.6 Conexão testada

☐ 4.3 Backend
   ☐ 4.3.1 Projeto Node.js configurado
   ☐ 4.3.2 Dependências instaladas
   ☐ 4.3.3 Estrutura de pastas criada
   ☐ 4.3.4 Conexão com banco configurada
   ☐ 4.3.5 Modelos criados
   ☐ 4.3.6 Controllers implementados
   ☐ 4.3.7 Rotas configuradas
   ☐ 4.3.8 Middlewares implementados
   ☐ 4.3.9 Autenticação JWT funcionando
   ☐ 4.3.10 Endpoints principais implementados
   ☐ 4.3.11 Validações implementadas
   ☐ 4.3.12 Testes unitários passando (>80% cobertura)

☐ 4.4 Painel Web
   ☐ 4.4.1 Projeto React configurado
   ☐ 4.4.2 Dependências instaladas
   ☐ 4.4.3 Tema aplicado (Design System)
   ☐ 4.4.4 Componentes reutilizáveis criados
   ☐ 4.4.5 Telas de autenticação
   ☐ 4.4.6 Dashboard implementado
   ☐ 4.4.7 CRUD de clientes/pets
   ☐ 4.4.8 Agenda funcional
   ☐ 4.4.9 PDV básico
   ☐ 4.4.10 Estoque implementado
   ☐ 4.4.11 Integração com API funcionando

☐ 4.5 App Mobile
   ☐ 4.5.1 Projeto Flutter configurado
   ☐ 4.5.2 Dependências instaladas
   ☐ 4.5.3 Tema aplicado (Design System)
   ☐ 4.5.4 Componentes reutilizáveis criados
   ☐ 4.5.5 Telas de autenticação
   ☐ 4.5.6 Home implementada
   ☐ 4.5.7 Perfil do pet
   ☐ 4.5.8 Fluxo de agendamento completo
   ☐ 4.5.9 Acompanhamento em tempo real
   ☐ 4.5.10 Integração com API funcionando
   ☐ 4.5.11 Testado em Android
   ☐ 4.5.12 Testado em iOS

☐ 4.6 Integrações
   ☐ 4.6.1 Upload de imagens (S3/Cloudinary)
   ☐ 4.6.2 Pagamentos (Mercado Pago)
   ☐ 4.6.3 Notificações push (OneSignal)
   ☐ 4.6.4 WhatsApp API
   ☐ 4.6.5 E-mails (SendGrid)
   ☐ 4.6.6 Monitoramento (Sentry)

☐ 4.7 CI/CD
   ☐ 4.7.1 Estratégia de branches definida
   ☐ 4.7.2 Workflows de testes configurados
   ☐ 4.7.3 Workflows de deploy configurados
   ☐ 4.7.4 Ambientes configurados
   ☐ 4.7.5 Deploy automático funcionando
```

---

## 📚 REFERÊNCIAS

### **Documentos Relacionados**
- `ARCHITECTURE_TECHNICAL.md` - Arquitetura técnica completa
- `DESIGN_SYSTEM.md` - Sistema de design
- `TESTING_QA.md` - Estratégia de testes
- `BUSINESS_RULES.md` - Regras de negócio

### **Tecnologias**
- [Node.js Documentation](https://nodejs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Documentation](https://react.dev)
- [Flutter Documentation](https://flutter.dev/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---

**Última atualização:** 2026-02-20  
**Versão:** 4.0 (Plano de Implementação Completo)

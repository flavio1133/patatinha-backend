# 🚀 FASE 4 - IMPLEMENTAÇÃO (GUIA PRÁTICO DETALHADO)

Este documento fornece instruções passo a passo detalhadas para implementar cada parte do sistema Patatinha.

---

## 📋 VISÃO GERAL

Este guia detalha **exatamente o que fazer**, **quem faz**, **quanto tempo leva** e **como saber se está pronto** para cada item do checklist da Fase 4.

---

## 4.1 CONFIGURAÇÃO DO AMBIENTE DE DESENVOLVIMENTO

### 4.1.1 Instalação das Ferramentas

| Ferramenta | Como Verificar se Está Pronto | Tempo |
|:---|:---|:---|
| **Git** | `git --version` no terminal mostra a versão | 15 min |
| **Node.js** | `node --version` e `npm --version` funcionam | 20 min |
| **Docker** | `docker --version` e `docker-compose --version` | 30 min |
| **PostgreSQL** | `psql --version` ou conseguir conectar via pgAdmin | 30 min |
| **VS Code** | Abrir o programa sem erros | 10 min |
| **Insomnia/Postman** | Conseguir fazer uma requisição de teste | 15 min |
| **Android Studio** | Criar um emulador e rodar | 2 horas |
| **Xcode** | Abrir e criar um simulador (só Mac) | 1 hora |

**Tempo total estimado:** 4-8 horas (depende da velocidade da internet e configurações)

**Quem faz:** Desenvolvedor (cada um configura sua máquina)

---

### 4.1.2 Configuração Git e Repositórios

#### **Passo a Passo Detalhado:**

```bash
# 1. Criar conta no GitHub (se não tiver)
# → Acessar github.com
# → Clicar em "Sign up"
# → Preencher dados
# → Confirmar e-mail

# 2. Configurar Git local
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
git config --global core.editor "code --wait"

# 3. Gerar SSH key (para não precisar senha)
ssh-keygen -t ed25519 -C "seu@email.com"
# Enter (aceitar local padrão)
# Enter (deixar sem senha - opcional)
cat ~/.ssh/id_ed25519.pub  # Mostra a chave
# Copiar a chave

# 4. Adicionar SSH key no GitHub
# → GitHub → Settings → SSH and GPG keys
# → New SSH key
# → Colar a chave
# → Salvar

# 5. Criar repositórios no GitHub
# → Clicar em "+" → New repository
# → Nome: petshop-backend
# → Público ou Privado? (sugiro privado)
# → Não iniciar com README
# → Criar
# → Repetir para: petshop-web, petshop-mobile

# 6. Clonar localmente
git clone git@github.com:seu-usuario/petshop-backend.git
git clone git@github.com:seu-usuario/petshop-web.git
git clone git@github.com:seu-usuario/petshop-mobile.git

# 7. Verificar conexão
ssh -T git@github.com
# Deve mostrar: "Hi seu-usuario! You've successfully authenticated"
```

**Entregável:** 3 repositórios criados e clonados localmente

**Tempo estimado:** 2 horas

**Como saber se está pronto:** 
- ✅ `git clone` funciona sem pedir senha
- ✅ `ssh -T git@github.com` retorna mensagem de sucesso

---

### 4.1.3 Estrutura de Pastas Inicial

#### **Backend (`petshop-backend`)**

```bash
cd petshop-backend
mkdir -p src/{config,models,controllers,routes,middlewares,services,utils}
mkdir -p tests/{unit,integration,e2e}
mkdir -p migrations seeds
touch src/config/.gitkeep
touch src/models/.gitkeep
touch src/controllers/.gitkeep
touch src/routes/.gitkeep
touch src/middlewares/.gitkeep
touch src/services/.gitkeep
touch src/utils/.gitkeep
touch tests/.gitkeep
```

**Arquivos a criar:**

**.gitignore**
```
node_modules/
.env
.DS_Store
dist/
build/
*.log
coverage/
.nyc_output/
```

**.env.example**
```
# Backend
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=petshop_db
DB_USER=petshop_user
DB_PASSWORD=petshop123

# JWT
JWT_SECRET=seu_segredo_super_secreto_aqui_mude_em_producao
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_BUCKET_NAME=

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=

# OneSignal
ONESIGNAL_APP_ID=
ONESIGNAL_API_KEY=

# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
```

**package.json**
```json
{
  "name": "petshop-backend",
  "version": "1.0.0",
  "description": "Backend API para Pet Shop",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "keywords": ["pet", "shop", "api"],
  "author": "",
  "license": "ISC"
}
```

**README.md**
```markdown
# PetShop Backend

API REST para sistema de gestão de pet shop.

## Instalação

\`\`\`bash
npm install
\`\`\`

## Configuração

Copie o arquivo \`.env.example\` para \`.env\` e configure as variáveis.

## Executar

\`\`\`bash
npm run dev
\`\`\`

## Testes

\`\`\`bash
npm test
\`\`\`
```

#### **Web (`petshop-web`)**

```bash
cd petshop-web
mkdir -p src/{assets/{images,icons},components/{common,layout,forms},pages/{Dashboard,Clients,Appointments,Stock,Sales,Financial},services,hooks,context,utils,styles}
mkdir -p public
touch src/assets/.gitkeep
touch src/components/.gitkeep
touch src/pages/.gitkeep
```

**.env.example**
```
REACT_APP_API_URL=http://localhost:3000/api
```

#### **Mobile (`petshop-mobile`)**

```bash
cd petshop-mobile
mkdir -p src/{assets/{images,icons},components/{common,pet},screens/{Auth,Home,Pets,Appointments,Profile},navigation,services,hooks,context,utils}
touch src/assets/.gitkeep
touch src/components/.gitkeep
touch src/screens/.gitkeep
```

**.env.example**
```
API_URL=http://localhost:3000/api
```

**Tempo estimado:** 2 horas

**Como saber se está pronto:**
- ✅ Estrutura de pastas criada em todos os projetos
- ✅ Arquivos .gitignore e .env.example criados
- ✅ README.md básico criado

---

## 4.2 CONFIGURAÇÃO DO BANCO DE DADOS

### 4.2.1 Instalar PostgreSQL

#### **Windows:**
1. Baixar de: https://www.postgresql.org/download/windows/
2. Executar instalador
3. Anotar a senha do usuário postgres
4. Manter porta padrão (5432)

#### **Mac:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### **Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
```

**Verificar instalação:**
```bash
psql --version
# Deve mostrar: psql (PostgreSQL) 15.x
```

---

### 4.2.2 Criar Database e Usuário

```sql
-- Acessar PostgreSQL
sudo -u postgres psql  # Linux
psql -U postgres        # Windows (no prompt do SQL)

-- Criar usuário (se não existir)
CREATE USER petshop_user WITH PASSWORD 'petshop123';

-- Criar database
CREATE DATABASE petshop_db OWNER petshop_user;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE petshop_db TO petshop_user;

-- Conectar ao database
\c petshop_db

-- Sair
\q
```

**Testar conexão:**
```bash
psql -U petshop_user -d petshop_db -h localhost
# Deve conectar sem erros
```

**Tempo estimado:** 30 minutos

**Como saber se está pronto:**
- ✅ `psql -U petshop_user -d petshop_db` conecta sem erros
- ✅ Pode executar `SELECT version();` e retorna versão do PostgreSQL

---

### 4.2.3 Criar Todas as Tabelas

**Arquivo: `backend/database/schema.sql`**

O script SQL completo está disponível em `ARCHITECTURE_TECHNICAL.md` seção 2.

**Como executar:**

```bash
# Opção 1: Via psql
psql -U petshop_user -d petshop_db -f database/schema.sql

# Opção 2: Via arquivo
psql -U petshop_user -d petshop_db < database/schema.sql

# Opção 3: Copiar e colar no pgAdmin
```

**Verificar se criou todas as tabelas:**
```sql
\dt
-- Deve listar todas as 20+ tabelas
```

**Tempo estimado:** 4 horas (criação e testes)

**Como saber se está pronto:**
- ✅ `\dt` lista todas as tabelas
- ✅ `SELECT COUNT(*) FROM users;` retorna 0 (tabela vazia mas existe)
- ✅ Índices criados (verificar com `\di`)

---

## 4.3 DESENVOLVIMENTO DO BACKEND

### 4.3.1 Configuração Inicial do Projeto

#### **Passo 1: Criar package.json**
```bash
cd petshop-backend
npm init -y
```

#### **Passo 2: Instalar dependências**
```bash
# Dependências de produção
npm install express pg dotenv bcryptjs jsonwebtoken multer cors helmet express-validator

# Dependências de desenvolvimento
npm install -D nodemon jest supertest
```

#### **Passo 3: Configurar scripts no package.json**
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### **Passo 4: Criar arquivo principal**

**`src/server.js`**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas (serão importadas depois)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota de erro 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
```

**Testar:**
```bash
npm run dev
# Abrir http://localhost:3000/api/health
# Deve retornar: {"status":"ok","timestamp":"...","environment":"development"}
```

#### **Passo 5: Configurar conexão com banco**

**`src/config/database.js`**
```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Testar conexão ao iniciar
pool.on('connect', () => {
  console.log('✅ Conectado ao PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro na conexão PostgreSQL:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
```

**Testar conexão:**
```javascript
// Criar arquivo temporário: test-db.js
const db = require('./src/config/database');

db.query('SELECT NOW()', [])
  .then(res => {
    console.log('✅ Conexão OK:', res.rows[0]);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erro:', err);
    process.exit(1);
  });
```

```bash
node test-db.js
# Deve mostrar: ✅ Conexão OK: { now: '2026-02-20T...' }
```

**Tempo estimado:** 8 horas

**Como saber se está pronto:**
- ✅ `npm run dev` inicia sem erros
- ✅ `http://localhost:3000/api/health` retorna JSON válido
- ✅ Conexão com banco funciona

---

### 4.3.2 Criação dos Models

**Exemplo completo: `src/models/UserModel.js`**

```javascript
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // Criar usuário
  static async create(userData) {
    const { name, email, phone, password, role = 'client' } = userData;
    
    // Hash da senha
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, email, phone, role, created_at
    `;
    
    const values = [name, email, phone, password_hash, role];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Buscar por email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  // Buscar por ID
  static async findById(id) {
    const query = `
      SELECT id, name, email, phone, role, is_active, last_login, created_at
      FROM users WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  // Validar senha
  static async validatePassword(user, password) {
    return bcrypt.compare(password, user.password_hash);
  }

  // Atualizar último login
  static async updateLastLogin(id) {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
    return db.query(query, [id]);
  }

  // Listar todos (com paginação)
  static async findAll(limit = 50, offset = 0) {
    const query = `
      SELECT id, name, email, phone, role, is_active, last_login, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
  }

  // Atualizar usuário
  static async update(id, userData) {
    const { name, phone, is_active } = userData;
    
    const query = `
      UPDATE users
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          is_active = COALESCE($3, is_active),
          updated_at = NOW()
      WHERE id = $4
      RETURNING id, name, email, phone, role, is_active, updated_at
    `;
    
    const values = [name, phone, is_active, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  // Deletar (ou inativar)
  static async delete(id) {
    const query = 'UPDATE users SET is_active = false WHERE id = $1';
    return db.query(query, [id]);
  }
}

module.exports = UserModel;
```

**Models a criar (seguindo o mesmo padrão):**
- [ ] ClientModel.js
- [ ] EmployeeModel.js
- [ ] PetModel.js
- [ ] ServiceModel.js
- [ ] SupplyModel.js
- [ ] AppointmentModel.js
- [ ] ProductModel.js
- [ ] SaleModel.js
- [ ] SaleItemModel.js
- [ ] SubscriptionPlanModel.js
- [ ] SubscriptionModel.js
- [ ] CommissionModel.js
- [ ] NotificationModel.js
- [ ] PhotoModel.js
- [ ] CashFlowModel.js

**Tempo estimado:** 40 horas (2-3 dias)

**Como saber se está pronto:**
- ✅ Todos os models criados
- ✅ Métodos CRUD básicos implementados
- ✅ Testes unitários passando para cada model

---

### 4.3.3 Criação dos Controllers e Rotas

**Exemplo completo: `src/controllers/AuthController.js`**

```javascript
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

class AuthController {
  // Registro de usuário
  async register(req, res) {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, phone, password } = req.body;

      // Verificar se usuário já existe
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'E-mail já cadastrado' });
      }

      // Criar usuário
      const user = await UserModel.create({
        name,
        email,
        phone,
        password,
        role: 'client'
      });

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user,
        token
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuário
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos' });
      }

      // Verificar senha
      const isValid = await UserModel.validatePassword(user, password);
      if (!isValid) {
        return res.status(401).json({ error: 'E-mail ou senha inválidos' });
      }

      // Atualizar último login
      await UserModel.updateLastLogin(user.id);

      // Gerar token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Remover hash da resposta
      delete user.password_hash;

      res.json({
        message: 'Login realizado com sucesso',
        user,
        token
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Perfil do usuário logado
  async profile(req, res) {
    try {
      const user = await UserModel.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = new AuthController();
```

**Rotas: `src/routes/authRoutes.js`**

```javascript
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');

// Validações
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('phone').notEmpty().withMessage('Telefone é obrigatório')
];

const loginValidation = [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

// Rotas públicas
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);

// Rotas protegidas
router.get('/profile', authMiddleware, AuthController.profile);

module.exports = router;
```

**Middleware: `src/middlewares/authMiddleware.js`**

```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  const token = parts[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    return next();
  });
};
```

**Integrar rotas no server.js:**
```javascript
// Adicionar após middlewares globais
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
```

**Tempo estimado:** 80 horas (2 semanas)

**Como saber se está pronto:**
- ✅ Todos os controllers criados
- ✅ Todas as rotas configuradas
- ✅ Middlewares funcionando
- ✅ Testes de integração passando

---

## 4.4 DESENVOLVIMENTO DO PAINEL WEB

### 4.4.1 Configuração Inicial

```bash
cd petshop-web
npx create-react-app . --template typescript
# ou JavaScript:
npx create-react-app .
```

**Instalar dependências:**
```bash
npm install axios react-router-dom styled-components react-query react-hook-form recharts date-fns
npm install -D @types/styled-components
```

**Configurar tema: `src/styles/theme.js`**

```javascript
export const theme = {
  colors: {
    primary: {
      50: '#FFF0EB',
      100: '#FFE0D5',
      200: '#FFC0B0',
      300: '#FFA08A',
      400: '#FF7F64',
      500: '#FF6B4A',
      600: '#E55A3D',
      700: '#CC4A36',
      800: '#B2392E',
      900: '#992927',
    },
    secondary: { 500: '#4A90E2' },
    success: { 500: '#2DCF8A', 100: '#E6F9F0' },
    warning: { 500: '#FFCC00', 100: '#FFF9E6' },
    error: { 500: '#FF3B30', 100: '#FFEBEA' },
    gray: {
      50: '#F9F9F9',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
    },
  },
  fonts: {
    sizes: { xs: '12px', sm: '14px', md: '16px', lg: '20px', xl: '24px', xxl: '32px' },
    weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  },
  spacing: { xxs: '4px', xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '32px', xxl: '48px' },
  borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px', round: '50%' },
};
```

**Tempo estimado:** 16 horas

**Como saber se está pronto:**
- ✅ Projeto React criado e rodando
- ✅ Tema configurado
- ✅ Estrutura de pastas criada

---

### 4.4.2 Componentes Base

**Exemplo: Button (`src/components/common/Button/Button.jsx`)**

```jsx
import React from 'react';
import styled, { css } from 'styled-components';

const variants = {
  primary: css`
    background: ${({ theme }) => theme.colors.primary[500]};
    color: ${({ theme }) => theme.colors.white};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primary[600]};
    }
  `,
  secondary: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.primary[500]};
    border: 1px solid ${({ theme }) => theme.colors.primary[500]};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.primary[50]};
    }
  `,
};

const sizes = {
  small: css`padding: 8px 12px; font-size: 14px;`,
  medium: css`padding: 12px 24px; font-size: 16px;`,
  large: css`padding: 16px 32px; font-size: 20px;`,
};

const StyledButton = styled.button`
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.fonts.weights.medium};
  transition: all 0.2s ease;
  ${({ variant }) => variants[variant] || variants.primary}
  ${({ size }) => sizes[size] || sizes.medium}
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
`;

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
```

**Componentes a criar:**
- [ ] Button
- [ ] Card
- [ ] Input
- [ ] Select
- [ ] Modal
- [ ] Table
- [ ] Pagination
- [ ] Alert
- [ ] Loading
- [ ] Sidebar
- [ ] Header

**Tempo estimado:** 24 horas

**Como saber se está pronto:**
- ✅ Componentes renderizam corretamente
- ✅ Estilos aplicados conforme Design System
- ✅ Props funcionando

---

## 4.5 DESENVOLVIMENTO DO APP MOBILE

### 4.5.1 Configuração Inicial

```bash
cd petshop-mobile
npx react-native init PetShopApp
# ou com Expo:
npx create-expo-app PetShopApp
```

**Instalar dependências:**
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install axios @react-native-async-storage/async-storage
npm install react-native-vector-icons
npm install react-native-image-picker
```

**Tempo estimado:** 4 horas

**Como saber se está pronto:**
- ✅ Projeto criado e roda no emulador
- ✅ Navegação básica funcionando
- ✅ Estrutura de pastas criada

---

## 4.6 INTEGRAÇÕES COM SERVIÇOS EXTERNOS

### 4.6.1 Upload de Imagens (AWS S3)

**Instalar:**
```bash
npm install aws-sdk multer multer-s3
```

**`src/services/uploadService.js`**
```javascript
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `petshop/${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  })
});

module.exports = upload;
```

**Tempo estimado:** 8 horas

**Como saber se está pronto:**
- ✅ Upload de imagem funciona
- ✅ URL retornada é válida
- ✅ Imagem acessível via URL

---

## 4.7 CI/CD

### 4.7.1 GitHub Actions

**`.github/workflows/backend.yml`**
```yaml
name: Backend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths: [ 'backend/**' ]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: petshop_test
        ports:
          - 5432:5432
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: |
        cd backend
        npm ci
        npm test
      env:
        DB_HOST: localhost
        DB_NAME: petshop_test
        DB_USER: test
        DB_PASSWORD: test
```

**Tempo estimado:** 16 horas

**Como saber se está pronto:**
- ✅ Workflow executa nos pushes
- ✅ Testes rodam automaticamente
- ✅ Deploy funciona (se configurado)

---

## 📊 RESUMO DE TEMPOS

| Etapa | Tempo Estimado | Total |
|:------|:---------------|:------|
| 4.1 Configuração Ambiente | 4-8 horas | 8h |
| 4.2 Banco de Dados | 4-6 horas | 6h |
| 4.3 Backend | 128 horas | 128h |
| 4.4 Painel Web | 80 horas | 80h |
| 4.5 App Mobile | 160 horas | 160h |
| 4.6 Integrações | 40 horas | 40h |
| 4.7 CI/CD | 16 horas | 16h |
| **TOTAL** | | **438 horas** |

**Em semanas (40h/semana):** ~11 semanas

---

## ✅ CHECKLIST DE CONCLUSÃO

Cada item deve ser marcado quando:
- ✅ Código escrito e funcionando
- ✅ Testes passando (se aplicável)
- ✅ Documentação atualizada
- ✅ Code review aprovado (se em equipe)

---

**Última atualização:** 2026-02-20  
**Versão:** 4.1 (Guia Prático Detalhado)

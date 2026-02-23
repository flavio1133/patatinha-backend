# 🧪 TESTES DE INTEGRAÇÃO - GUIA PRÁTICO

Este documento fornece testes práticos e detalhados para validar a integração entre diferentes partes do sistema Patatinha.

---

## 📋 VISÃO GERAL

Os testes de integração verificam se diferentes componentes do sistema funcionam corretamente juntos. Este guia fornece exemplos práticos de como testar cada integração.

---

## 1. TESTES: API ↔ BANCO DE DADOS

### 1.1 Conexão com Banco de Dados

#### **Teste Manual**

```bash
# Criar arquivo: tests/integration/database-connection.test.js
```

```javascript
const db = require('../../src/config/database');

describe('Conexão com Banco de Dados', () => {
  test('deve conectar ao PostgreSQL', async () => {
    const result = await db.query('SELECT NOW()');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].now).toBeInstanceOf(Date);
  });

  test('deve retornar erro se banco não existe', async () => {
    // Simular conexão com banco inexistente
    const invalidPool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'banco_inexistente',
      user: 'postgres',
      password: 'senha'
    });

    await expect(
      invalidPool.query('SELECT NOW()')
    ).rejects.toThrow();
  });

  test('deve fechar conexão corretamente', async () => {
    const result = await db.query('SELECT 1');
    expect(result.rows[0]).toEqual({ '?column?': 1 });
    
    // Verificar se pool ainda está ativo
    const pool = db.pool;
    expect(pool.totalCount).toBeGreaterThan(0);
  });
});
```

#### **Como Executar**

```bash
npm test -- tests/integration/database-connection.test.js
```

#### **Resultado Esperado**

```
✅ deve conectar ao PostgreSQL
✅ deve retornar erro se banco não existe
✅ deve fechar conexão corretamente
```

**Critério de Sucesso:** Todos os testes passam

---

### 1.2 Queries Retornam Dados Corretos

#### **Teste: CRUD de Usuário**

```javascript
// tests/integration/user-crud.test.js
const db = require('../../src/config/database');
const UserModel = require('../../src/models/UserModel');

describe('CRUD de Usuário', () => {
  let userId;

  // Limpar dados antes de cada teste
  beforeEach(async () => {
    await db.query('DELETE FROM users WHERE email = $1', ['teste@teste.com']);
  });

  afterEach(async () => {
    if (userId) {
      await db.query('DELETE FROM users WHERE id = $1', [userId]);
    }
  });

  test('deve criar usuário no banco', async () => {
    const userData = {
      name: 'Teste User',
      email: 'teste@teste.com',
      phone: '11999999999',
      password: '123456',
      role: 'client'
    };

    const user = await UserModel.create(userData);
    
    expect(user).toHaveProperty('id');
    expect(user.email).toBe('teste@teste.com');
    expect(user).not.toHaveProperty('password_hash'); // Não deve retornar hash
    
    userId = user.id;
  });

  test('deve buscar usuário por email', async () => {
    // Criar usuário primeiro
    const userData = {
      name: 'Teste User',
      email: 'teste@teste.com',
      phone: '11999999999',
      password: '123456'
    };
    const createdUser = await UserModel.create(userData);
    userId = createdUser.id;

    // Buscar por email
    const foundUser = await UserModel.findByEmail('teste@teste.com');
    
    expect(foundUser).toBeDefined();
    expect(foundUser.email).toBe('teste@teste.com');
    expect(foundUser).toHaveProperty('password_hash'); // Deve ter hash para validação
  });

  test('deve atualizar usuário', async () => {
    // Criar usuário
    const userData = {
      name: 'Teste User',
      email: 'teste@teste.com',
      phone: '11999999999',
      password: '123456'
    };
    const createdUser = await UserModel.create(userData);
    userId = createdUser.id;

    // Atualizar
    const updatedUser = await UserModel.update(userId, {
      name: 'Nome Atualizado',
      phone: '11888888888'
    });

    expect(updatedUser.name).toBe('Nome Atualizado');
    expect(updatedUser.phone).toBe('11888888888');
  });

  test('deve deletar (inativar) usuário', async () => {
    // Criar usuário
    const userData = {
      name: 'Teste User',
      email: 'teste@teste.com',
      phone: '11999999999',
      password: '123456'
    };
    const createdUser = await UserModel.create(userData);
    userId = createdUser.id;

    // Deletar (soft delete)
    await UserModel.delete(userId);

    // Verificar se está inativo
    const user = await UserModel.findById(userId);
    expect(user.is_active).toBe(false);
  });

  test('deve validar senha corretamente', async () => {
    // Criar usuário
    const userData = {
      name: 'Teste User',
      email: 'teste@teste.com',
      phone: '11999999999',
      password: '123456'
    };
    const createdUser = await UserModel.create(userData);
    userId = createdUser.id;

    // Buscar usuário completo (com hash)
    const user = await UserModel.findByEmail('teste@teste.com');

    // Validar senha correta
    const isValid = await UserModel.validatePassword(user, '123456');
    expect(isValid).toBe(true);

    // Validar senha incorreta
    const isInvalid = await UserModel.validatePassword(user, 'senha_errada');
    expect(isInvalid).toBe(false);
  });
});
```

#### **Como Executar**

```bash
npm test -- tests/integration/user-crud.test.js
```

**Critério de Sucesso:** Todos os testes CRUD passam

---

### 1.3 Tratamento de Erros de Banco

#### **Teste: Erros de Banco**

```javascript
// tests/integration/database-errors.test.js
const db = require('../../src/config/database');
const UserModel = require('../../src/models/UserModel');

describe('Tratamento de Erros de Banco', () => {
  test('deve tratar erro de email duplicado', async () => {
    const userData = {
      name: 'Teste User',
      email: 'duplicado@teste.com',
      phone: '11999999999',
      password: '123456'
    };

    // Criar primeiro usuário
    await UserModel.create(userData);

    // Tentar criar segundo com mesmo email
    await expect(
      UserModel.create(userData)
    ).rejects.toThrow();
  });

  test('deve tratar erro de foreign key', async () => {
    // Tentar criar pet com client_id inexistente
    const PetModel = require('../../src/models/PetModel');
    
    await expect(
      PetModel.create({
        client_id: '00000000-0000-0000-0000-000000000000', // UUID inválido
        name: 'Rex',
        species: 'dog'
      })
    ).rejects.toThrow();
  });

  test('deve tratar erro de campo obrigatório', async () => {
    await expect(
      db.query('INSERT INTO users (email) VALUES ($1)', ['teste@teste.com'])
    ).rejects.toThrow();
  });

  test('deve tratar erro de conexão perdida', async () => {
    // Simular perda de conexão
    await db.pool.end();
    
    await expect(
      db.query('SELECT NOW()')
    ).rejects.toThrow();
    
    // Reconectar
    // (implementar lógica de reconexão)
  });
});
```

**Critério de Sucesso:** Erros são capturados e tratados adequadamente

---

## 2. TESTES: BACKEND ↔ FRONTEND

### 2.1 Rotas Retornam Status Corretos

#### **Teste: Endpoints da API**

```javascript
// tests/integration/api-routes.test.js
const request = require('supertest');
const app = require('../../src/server');

describe('Rotas da API', () => {
  let authToken;
  let userId;

  // Criar usuário e fazer login antes dos testes
  beforeAll(async () => {
    // Registrar usuário
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Teste User',
        email: 'api@teste.com',
        phone: '11999999999',
        password: '123456'
      });

    userId = registerResponse.body.user.id;
    authToken = registerResponse.body.token;
  });

  // Limpar após testes
  afterAll(async () => {
    const db = require('../../src/config/database');
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
  });

  describe('GET /api/health', () => {
    test('deve retornar status 200', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/auth/register', () => {
    test('deve retornar 201 ao criar usuário válido', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Novo User',
          email: 'novo@teste.com',
          phone: '11888888888',
          password: '123456'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');

      // Limpar
      const db = require('../../src/config/database');
      await db.query('DELETE FROM users WHERE email = $1', ['novo@teste.com']);
    });

    test('deve retornar 400 com dados inválidos', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '', // Inválido
          email: 'email_invalido', // Inválido
          password: '123' // Muito curto
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('deve retornar 400 com email duplicado', async () => {
      // Primeiro registro
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User 1',
          email: 'duplicado@teste.com',
          phone: '11777777777',
          password: '123456'
        });

      // Segundo registro com mesmo email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User 2',
          email: 'duplicado@teste.com',
          phone: '11666666666',
          password: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');

      // Limpar
      const db = require('../../src/config/database');
      await db.query('DELETE FROM users WHERE email = $1', ['duplicado@teste.com']);
    });
  });

  describe('POST /api/auth/login', () => {
    test('deve retornar 200 com credenciais válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'api@teste.com',
          password: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('api@teste.com');
    });

    test('deve retornar 401 com credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'api@teste.com',
          password: 'senha_errada'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/profile', () => {
    test('deve retornar 200 com token válido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('api@teste.com');
    });

    test('deve retornar 401 sem token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    test('deve retornar 401 com token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer token_invalido');

      expect(response.status).toBe(401);
    });
  });
});
```

#### **Como Executar**

```bash
npm test -- tests/integration/api-routes.test.js
```

**Critério de Sucesso:** Todos os status codes estão corretos

---

### 2.2 Dados Chegam Formatados Corretamente

#### **Teste: Formato de Resposta**

```javascript
// tests/integration/api-response-format.test.js
const request = require('supertest');
const app = require('../../src/server');

describe('Formato de Resposta da API', () => {
  let authToken;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Format Test',
        email: 'format@teste.com',
        phone: '11555555555',
        password: '123456'
      });
    authToken = response.body.token;
  });

  test('resposta de sucesso deve ter formato correto', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.headers['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('name');
    expect(response.body).not.toHaveProperty('password_hash'); // Segurança
  });

  test('resposta de erro deve ter formato correto', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'inexistente@teste.com',
        password: '123456'
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error');
    expect(typeof response.body.error).toBe('string');
  });

  test('lista deve retornar array', async () => {
    const ClientController = require('../../src/controllers/ClientController');
    // Assumindo que existe rota GET /api/clients
    const response = await request(app)
      .get('/api/clients')
      .set('Authorization', `Bearer ${authToken}`);

    expect(Array.isArray(response.body)).toBe(true);
  });

  test('datas devem estar em formato ISO', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`);

    if (response.body.created_at) {
      // Verificar se é formato ISO válido
      const date = new Date(response.body.created_at);
      expect(date.toISOString()).toBe(response.body.created_at);
    }
  });
});
```

**Critério de Sucesso:** Todos os formatos de resposta estão corretos

---

### 2.3 Autenticação Funciona em Todas as Rotas

#### **Teste: Middleware de Autenticação**

```javascript
// tests/integration/auth-middleware.test.js
const request = require('supertest');
const app = require('../../src/server');

describe('Middleware de Autenticação', () => {
  let validToken;
  let invalidToken = 'token_invalido_12345';

  beforeAll(async () => {
    // Criar usuário e obter token válido
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Auth Test',
        email: 'auth@teste.com',
        phone: '11444444444',
        password: '123456'
      });
    validToken = response.body.token;
  });

  describe('Rotas Protegidas', () => {
    // Lista de rotas que precisam autenticação
    const protectedRoutes = [
      { method: 'get', path: '/api/auth/profile' },
      { method: 'get', path: '/api/clients' },
      { method: 'post', path: '/api/clients' },
      { method: 'get', path: '/api/pets' },
      { method: 'post', path: '/api/pets' },
      { method: 'get', path: '/api/appointments' },
      { method: 'post', path: '/api/appointments' },
    ];

    protectedRoutes.forEach(({ method, path }) => {
      test(`${method.toUpperCase()} ${path} deve requerer autenticação`, async () => {
        const response = await request(app)
          [method](path);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('error');
      });

      test(`${method.toUpperCase()} ${path} deve aceitar token válido`, async () => {
        const response = await request(app)
          [method](path)
          .set('Authorization', `Bearer ${validToken}`);

        // Pode retornar 200, 201, 400, 404, mas NÃO 401
        expect(response.status).not.toBe(401);
      });

      test(`${method.toUpperCase()} ${path} deve rejeitar token inválido`, async () => {
        const response = await request(app)
          [method](path)
          .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
      });
    });
  });

  describe('Rotas Públicas', () => {
    const publicRoutes = [
      { method: 'get', path: '/api/health' },
      { method: 'post', path: '/api/auth/register' },
      { method: 'post', path: '/api/auth/login' },
    ];

    publicRoutes.forEach(({ method, path }) => {
      test(`${method.toUpperCase()} ${path} não deve requerer autenticação`, async () => {
        const response = await request(app)
          [method](path)
          .send({}); // Dados vazios podem retornar erro, mas não 401

        expect(response.status).not.toBe(401);
      });
    });
  });
});
```

**Critério de Sucesso:** Todas as rotas protegidas requerem autenticação válida

---

## 3. TESTES: BACKEND ↔ SERVIÇOS EXTERNOS

### 3.1 Upload de Imagens (AWS S3)

#### **Teste: Upload para S3**

```javascript
// tests/integration/s3-upload.test.js
const request = require('supertest');
const app = require('../../src/server');
const fs = require('fs');
const path = require('path');

describe('Upload de Imagens - AWS S3', () => {
  let authToken;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Upload Test',
        email: 'upload@teste.com',
        phone: '11333333333',
        password: '123456'
      });
    authToken = response.body.token;
  });

  test('deve fazer upload de imagem válida', async () => {
    // Criar arquivo de teste
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    
    // Se não existir, criar um arquivo dummy
    if (!fs.existsSync(testImagePath)) {
      // Criar diretório se não existir
      const fixturesDir = path.join(__dirname, '../fixtures');
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }
      
      // Criar arquivo dummy (1x1 pixel JPEG)
      const dummyImage = Buffer.from(
        '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A',
        'base64'
      );
      fs.writeFileSync(testImagePath, dummyImage);
    }

    const response = await request(app)
      .post('/api/upload/photo')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('photo', testImagePath);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url');
    expect(response.body.url).toMatch(/^https?:\/\//); // Deve ser URL válida
    expect(response.body).toHaveProperty('key');
  });

  test('deve rejeitar arquivo muito grande', async () => {
    // Criar arquivo grande (6MB)
    const largeFilePath = path.join(__dirname, '../fixtures/large-file.jpg');
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB
    fs.writeFileSync(largeFilePath, largeBuffer);

    const response = await request(app)
      .post('/api/upload/photo')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('photo', largeFilePath);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');

    // Limpar
    fs.unlinkSync(largeFilePath);
  });

  test('deve rejeitar arquivo que não é imagem', async () => {
    const textFilePath = path.join(__dirname, '../fixtures/test.txt');
    fs.writeFileSync(textFilePath, 'Este não é uma imagem');

    const response = await request(app)
      .post('/api/upload/photo')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('photo', textFilePath);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');

    // Limpar
    fs.unlinkSync(textFilePath);
  });

  test('deve requerer autenticação para upload', async () => {
    const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');
    
    const response = await request(app)
      .post('/api/upload/photo')
      .attach('photo', testImagePath);

    expect(response.status).toBe(401);
  });
});
```

#### **Configuração para Testes**

**`tests/setup.js`**
```javascript
// Mock do AWS S3 para testes (opcional)
jest.mock('aws-sdk', () => {
  const mockS3 = {
    upload: jest.fn((params, callback) => {
      callback(null, {
        Location: `https://test-bucket.s3.amazonaws.com/${params.Key}`,
        Key: params.Key
      });
    })
  };

  return {
    S3: jest.fn(() => mockS3)
  };
});
```

**Critério de Sucesso:** Upload funciona, validações funcionam, URLs retornadas são válidas

---

### 3.2 Gateway de Pagamento (Mercado Pago)

#### **Teste: Integração Mercado Pago**

```javascript
// tests/integration/payment.test.js
const request = require('supertest');
const app = require('../../src/server');
const PaymentService = require('../../src/services/PaymentService');

describe('Integração Mercado Pago', () => {
  let authToken;

  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Payment Test',
        email: 'payment@teste.com',
        phone: '11222222222',
        password: '123456'
      });
    authToken = response.body.token;
  });

  test('deve criar preferência de pagamento', async () => {
    const paymentData = {
      items: [
        { name: 'Banho', quantity: 1, price: 70.00 }
      ],
      payer: {
        email: 'payment@teste.com',
        name: 'Payment Test'
      },
      paymentMethod: 'pix'
    };

    const preference = await PaymentService.createPayment(paymentData);

    expect(preference).toHaveProperty('id');
    expect(preference).toHaveProperty('init_point');
    expect(preference.init_point).toMatch(/^https?:\/\//);
  });

  test('deve processar webhook de pagamento', async () => {
    // Simular webhook do Mercado Pago
    const webhookData = {
      type: 'payment',
      data: {
        id: '123456789'
      }
    };

    const payment = await PaymentService.handleWebhook(webhookData.data.id);

    expect(payment).toHaveProperty('status');
    expect(['approved', 'pending', 'rejected']).toContain(payment.status);
  });

  test('deve criar venda após pagamento aprovado', async () => {
    // Simular pagamento aprovado
    const saleData = {
      client_id: 'client-uuid',
      items: [
        { product_id: 'product-uuid', quantity: 1, price: 70.00 }
      ],
      payment_method: 'pix',
      payment_id: 'mp-123456789'
    };

    const response = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${authToken}`)
      .send(saleData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('completed');
  });
});
```

**Critério de Sucesso:** Preferência criada, webhook processado, venda criada após pagamento

---

### 3.3 Notificações Push (OneSignal)

#### **Teste: Envio de Notificações**

```javascript
// tests/integration/notifications.test.js
const NotificationService = require('../../src/services/NotificationService');

describe('Notificações Push - OneSignal', () => {
  test('deve enviar notificação para usuário específico', async () => {
    const notification = {
      title: 'Teste de Notificação',
      body: 'Esta é uma notificação de teste',
      data: {
        type: 'test',
        appointmentId: '123'
      }
    };

    const result = await NotificationService.sendToUser('user-id-123', notification);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('recipients');
  });

  test('deve enviar lembrete de agendamento', async () => {
    const appointment = {
      id: 'apt-123',
      userId: 'user-123',
      petName: 'Rex',
      time: '14:00',
      date: '2026-03-15'
    };

    await NotificationService.sendAppointmentReminder(appointment);

    // Verificar se notificação foi criada no banco
    const db = require('../../src/config/database');
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [appointment.userId]
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].type).toBe('appointment_reminder');
  });

  test('deve enviar notificação de pet pronto', async () => {
    const appointment = {
      id: 'apt-123',
      userId: 'user-123',
      petName: 'Rex',
      photoUrl: 'https://s3.amazonaws.com/bucket/photo.jpg'
    };

    await NotificationService.sendPetReady(appointment);

    // Verificar no banco
    const db = require('../../src/config/database');
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 AND type = $2 ORDER BY created_at DESC LIMIT 1',
      [appointment.userId, 'pet_ready']
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].data).toHaveProperty('photo');
  });
});
```

**Critério de Sucesso:** Notificações enviadas, registradas no banco, dados corretos

---

### 3.4 WhatsApp/E-mail

#### **Teste: Envio de E-mail**

```javascript
// tests/integration/email.test.js
const EmailService = require('../../src/services/EmailService');

describe('Envio de E-mail', () => {
  test('deve enviar e-mail de recuperação de senha', async () => {
    const emailData = {
      to: 'teste@exemplo.com',
      subject: 'Recuperação de Senha',
      html: '<h1>Recupere sua senha</h1><p>Clique no link...</p>'
    };

    const result = await EmailService.sendEmail(
      emailData.to,
      emailData.subject,
      emailData.html
    );

    expect(result).toHaveProperty('statusCode');
    expect(result.statusCode).toBe(202); // SendGrid retorna 202
  });

  test('deve enviar e-mail de confirmação de agendamento', async () => {
    const appointment = {
      petName: 'Rex',
      service: 'Banho',
      date: '15/03/2026',
      time: '14:00',
      clientEmail: 'cliente@exemplo.com'
    };

    const html = `
      <h1>Agendamento Confirmado!</h1>
      <p>Olá! Seu agendamento foi confirmado:</p>
      <ul>
        <li>Pet: ${appointment.petName}</li>
        <li>Serviço: ${appointment.service}</li>
        <li>Data: ${appointment.date}</li>
        <li>Horário: ${appointment.time}</li>
      </ul>
    `;

    const result = await EmailService.sendEmail(
      appointment.clientEmail,
      'Agendamento Confirmado',
      html
    );

    expect(result.statusCode).toBe(202);
  });
});
```

#### **Teste: Integração WhatsApp**

```javascript
// tests/integration/whatsapp.test.js
const WhatsAppService = require('../../src/services/WhatsAppService');

describe('Integração WhatsApp', () => {
  test('deve enviar mensagem de texto', async () => {
    const message = {
      to: '5511999999999',
      body: 'Olá! Seu pet está pronto para busca.'
    };

    const result = await WhatsAppService.sendMessage(message);

    expect(result).toHaveProperty('status');
    expect(['sent', 'delivered']).toContain(result.status);
  });

  test('deve enviar mensagem com imagem', async () => {
    const message = {
      to: '5511999999999',
      body: 'Olha como ficou lindo!',
      mediaUrl: 'https://s3.amazonaws.com/bucket/photo.jpg'
    };

    const result = await WhatsAppService.sendMessageWithMedia(message);

    expect(result).toHaveProperty('status');
  });

  test('deve enviar lembrete de vacina', async () => {
    const vaccineAlert = {
      petName: 'Rex',
      vaccineName: 'V10',
      nextDoseDate: '15/03/2026',
      clientPhone: '5511999999999'
    };

    const message = `Olá! O reforço da vacina ${vaccineAlert.vaccineName} do ${vaccineAlert.petName} vence em ${vaccineAlert.nextDoseDate}. Agende já!`;

    const result = await WhatsAppService.sendMessage({
      to: vaccineAlert.clientPhone,
      body: message
    });

    expect(result).toHaveProperty('status');
  });
});
```

**Critério de Sucesso:** E-mails enviados, WhatsApp enviado, mensagens formatadas corretamente

---

## 📊 CHECKLIST DE TESTES DE INTEGRAÇÃO

```
☐ API ↔ Banco de Dados
   ☐ Conexão funciona?
   ☐ Queries retornam dados corretos?
   ☐ Erros de banco são tratados?
   ☐ Transações funcionam corretamente?
   ☐ Índices melhoram performance?

☐ Backend ↔ Frontend
   ☐ Rotas retornam status corretos?
   ☐ Dados chegam formatados corretamente?
   ☐ Autenticação funciona em todas as rotas?
   ☐ CORS está configurado corretamente?
   ☐ Validações funcionam?

☐ Backend ↔ Serviços Externos
   ☐ Upload de imagens (AWS S3)
      ☐ Upload funciona?
      ☐ Validação de tamanho funciona?
      ☐ Validação de tipo funciona?
      ☐ URLs retornadas são válidas?
   ☐ Gateway de pagamento
      ☐ Preferência criada?
      ☐ Webhook processado?
      ☐ Venda criada após pagamento?
   ☐ Notificações push
      ☐ Notificação enviada?
      ☐ Registrada no banco?
      ☐ Dados corretos?
   ☐ WhatsApp/E-mail
      ☐ E-mail enviado?
      ☐ WhatsApp enviado?
      ☐ Mensagens formatadas corretamente?
```

---

## 🛠️ CONFIGURAÇÃO DE AMBIENTE DE TESTES

### **package.json**

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/tests/**/*.test.js"],
    "coveragePathIgnorePatterns": ["/node_modules/"],
    "setupFilesAfterEnv": ["<rootDir>/tests/setup.js"]
  }
}
```

### **tests/setup.js**

```javascript
// Configurações globais para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';
process.env.DB_NAME = 'petshop_test';

// Limpar banco antes de cada suite de testes
beforeAll(async () => {
  // Conectar ao banco de testes
  // Limpar dados se necessário
});

afterAll(async () => {
  // Fechar conexões
});
```

---

## 📈 MÉTRICAS DE SUCESSO

| Integração | Métrica | Meta |
|:-----------|:--------|:-----|
| **API ↔ Banco** | Tempo de resposta | < 100ms |
| **API ↔ Banco** | Taxa de sucesso | > 99% |
| **Backend ↔ Frontend** | Status codes corretos | 100% |
| **Backend ↔ Frontend** | Formato de resposta | 100% |
| **Upload S3** | Taxa de sucesso | > 95% |
| **Pagamentos** | Webhook processado | < 5s |
| **Notificações** | Taxa de entrega | > 90% |

---

**Última atualização:** 2026-02-20  
**Versão:** 1.0 (Guia de Testes de Integração)

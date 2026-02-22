# 🔧 Patatinha Backend API

API REST desenvolvida em Node.js + Express para o app Patatinha Pet Shop.

## 🚀 Como executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- PostgreSQL (opcional para desenvolvimento inicial)

### Instalação

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. Executar em desenvolvimento:
```bash
npm run dev
```

4. Executar em produção:
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── routes/           # Rotas da API
│   ├── auth.routes.js
│   ├── pets.routes.js
│   ├── appointments.routes.js
│   └── products.routes.js
├── models/          # Modelos do banco de dados (a implementar)
├── controllers/     # Lógica de negócio (a implementar)
├── middleware/      # Middlewares customizados (a implementar)
└── server.js        # Arquivo principal
```

## 🔌 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Obter perfil do usuário autenticado

### Pets
- `GET /api/pets` - Listar pets do usuário
- `POST /api/pets` - Criar novo pet
- `GET /api/pets/:id` - Obter pet específico
- `PUT /api/pets/:id` - Atualizar pet
- `DELETE /api/pets/:id` - Deletar pet

### Agendamentos
- `GET /api/appointments` - Listar agendamentos
- `POST /api/appointments` - Criar agendamento
- `GET /api/appointments/:id` - Obter agendamento específico
- `PUT /api/appointments/:id` - Atualizar agendamento
- `DELETE /api/appointments/:id` - Cancelar agendamento

### Produtos
- `GET /api/products` - Listar produtos (com filtros)
- `GET /api/products/:id` - Obter produto específico

## 🔒 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:
```
Authorization: Bearer <seu-token>
```

## 📝 Notas

- Atualmente usando dados em memória para desenvolvimento
- Banco de dados PostgreSQL será implementado em breve
- Validações e tratamento de erros serão aprimorados

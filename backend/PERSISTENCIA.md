# Persistência de dados – Patatinha Backend

## Alterações realizadas (correção definitiva)

### 1. Conexão com o banco (`backend/src/db.js`)
- **DATABASE_URL**: quando definida (ex.: Render), o Sequelize usa a URL completa. Sem DATABASE_URL, usa DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD.
- **SSL**: sempre que `DATABASE_URL` existir, usa `dialectOptions.ssl: { require: true, rejectUnauthorized: false }` (obrigatório no Render).
- **Log seguro**: ao carregar o módulo, exibe no console a origem da conexão (host e database, sem senha).

### 1.1 Ordem de carregamento (`backend/src/server.js`)
- **`dotenv.config()`** é chamado na **primeira linha** do server.js, antes de `require('./db')`, para que variáveis do `.env` (em desenvolvimento) estejam disponíveis quando o db.js for carregado. No Render, as variáveis vêm do ambiente da plataforma.

### 2. Sincronização dos modelos (`backend/src/server.js`)
- `sequelize.sync({ alter: true })` já estava em uso (desenvolvimento e produção).
- Em falha de `authenticate()` ou `sync()`: log de erro completo e **process.exit(1)** para não subir o servidor sem banco.
- Logs: `✅ Conectado ao PostgreSQL: <nome_banco>` e `✅ Modelos sincronizados com o banco.`

### 3. Rotas que usam banco (resumo)
| Rota | Estado | Observação |
|------|--------|------------|
| **professionals** | ✅ Persistência em PostgreSQL | Cache em memória hidratado do banco; create/update/delete persistem no modelo `Professional`. |
| **appointments** | ✅ Já persistia | Hidratação + `Appointment.create/update`. |
| **customers** | ✅ Já persistia | Hidratação + `Customer.create/update` + filtro por `ClientCompany`. |
| **companies** | ✅ Já persistia | Company, CompanySettings, CompanyEmployee no banco. |
| **pets** | ✅ Já persistia | Hidratação + persistência. |
| **auth (users)** | ⚠️ Em memória | Array `users` + seed; migração para modelo `User` no banco pode ser feita depois. |
| **sales, inventory, products, cashflow, commissions** | Variável | Verificar cada arquivo em `backend/src/routes/` para hidratação e writes no banco. |

### 4. Profissionais (`backend/src/routes/professionals.routes.js`)
- **Antes**: arquivo duplicava modelos do `db.js` e exportava apenas objetos (não um router Express).
- **Agora**:
  - Usa `Professional` e `sequelize` de `require('../db')`.
  - Array `professionals` em memória é **hidratado** do banco ao iniciar e após listar.
  - **GET /** – lista profissionais (via cache hidratado).
  - **GET /:id** – busca por id (cache ou `Professional.findByPk`).
  - **POST /** – `Professional.create()` e atualização do cache; log opcional em dev.
  - **PUT /:id** – `Professional.update()` e atualização do cache.
  - **DELETE /:id** – soft delete (`isActive: false`).
  - **GET /:id/availability** – disponibilidade em uma data (usa `getAppointmentsByProfessionalAndDate`).
  - Exporta `router`, `getProfessionalById`, `professionals`, `professionalsState` para compatibilidade com `appointments.routes` e `companies.routes`.

### 5. Modelo Professional (`backend/src/db.js`)
- `email` e `password_hash` com `allowNull: true` para permitir cadastro sem login.

---

## Como testar persistência

1. **Criar um profissional** (POST /api/professionals com token).
2. **Conferir no banco**: `SELECT * FROM professionals;`
3. **Reiniciar o servidor** e listar novamente (GET /api/professionals) – o dado deve continuar.

---

## Diagnóstico: banco não sendo usado

### O que foi verificado e corrigido

| Problema | Correção |
|----------|----------|
| **dotenv depois do db** | `dotenv.config()` passou a ser a **primeira linha** do server.js, antes de `require('./db')`, para que `DATABASE_URL` exista ao carregar db.js (em dev com .env). |
| **SSL só em produção** | Quando existe `DATABASE_URL`, o SSL passou a ser **sempre** aplicado (não só com NODE_ENV=production), para o Render conectar ao Postgres. |
| **Sem log da conexão** | db.js agora faz log seguro ao carregar: `Conexão DB: DATABASE_URL → host=... database=...` (sem senha). |
| **Sem log de sucesso no create** | POST de profissional passa a logar sempre: `Salvando no banco (professional): id= X nome= Y`. |

### Como testar após o deploy no Render

1. **Logs ao subir o servidor**  
   - Deve aparecer: `Conexão DB: DATABASE_URL → host=... database=...`  
   - Em seguida: `Conectado ao PostgreSQL. dialect= postgres database= <nome_do_banco>`  
   - Se aparecer `fallback → host= localhost`, a `DATABASE_URL` não está sendo usada (verificar variável no Render).

2. **Criar um profissional**  
   - `curl -X POST .../api/professionals` (com Authorization).  
   - Nos logs do Render deve aparecer: `Salvando no banco (professional): id= 1 nome= ...`

3. **Conferir no PostgreSQL**  
   - No Render: Dashboard do Postgres → Connect → usar cliente ou `psql`.  
   - `SELECT * FROM professionals;` deve listar o registro.

4. **Permissões**  
   - O usuário do banco (ex.: `flavio_jose`) precisa de permissão de escrita nas tabelas.  
   - Se as tabelas não existirem, `sync({ alter: true })` cria/altera; em caso de erro de permissão, o servidor faz `process.exit(1)` e a mensagem aparece nos logs.

---

## Variáveis de ambiente (Render / produção)

- `DATABASE_URL` – URL completa do PostgreSQL (ex.: `postgres://user:pass@host:5432/dbname?sslmode=require`).
- Opcional: `DB_LOGGING=true` em desenvolvimento para ver queries SQL no console.

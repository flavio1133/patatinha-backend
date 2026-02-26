# Persistência de dados – Patatinha Backend

## Alterações realizadas (correção definitiva)

### 1. Conexão com o banco (`backend/src/db.js`)
- **DATABASE_URL**: quando definida (ex.: Render), o Sequelize usa a URL completa em vez de DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD.
- **SSL**: em produção com `DATABASE_URL`, é usado `dialectOptions.ssl: { require: true, rejectUnauthorized: false }` para conexão segura no Render.
- **Log**: o servidor exibe no console o nome do banco após conectar (ver `server.js`).

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

## Variáveis de ambiente (Render / produção)

- `DATABASE_URL` – URL completa do PostgreSQL (ex.: `postgres://user:pass@host:5432/dbname?sslmode=require`).
- Opcional: `DB_LOGGING=true` em desenvolvimento para ver queries SQL no console.

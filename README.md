# 🐾 Patatinha - App de Pet Shop

Sistema de gerenciamento e atendimento para pet shops: área de gestão (web) e área do cliente (web), com API única em Node.js.

## 📋 Estrutura

```
mypet/
├── web/             # Frontend React (Vite) – Gestão + Área do cliente
├── backend/         # API Node.js + Express + PostgreSQL
└── README.md
```

## 🚀 Desenvolvimento local

### Backend (rodar primeiro)
```bash
cd backend
cp .env.example .env   # edite .env com banco e JWT_SECRET
npm install
npm run dev
# http://localhost:3000
```

### Web
```bash
cd web
npm install
npm run dev
# http://localhost:3005 (proxy /api e /uploads para o backend)
```

## 📦 Build e deploy

### Frontend (web)
```bash
cd web
npm run build
```
Saída em `web/dist/`. Servir com Nginx, Apache, Vercel, Netlify, etc.

Configure a URL da API em produção:
- Crie `web/.env.production` com `VITE_API_URL=https://sua-api.com/api`
- Ou use proxy no servidor para `/api` e `/uploads` apontando para o backend.

### Backend
- Não há passo de build. Em produção: `NODE_ENV=production npm start`.
- Configure `.env` (ou variáveis no host): `PORT`, `JWT_SECRET`, `DB_*`, `UPLOAD_DIR`, e opcionais (SMTP, OneSignal, WhatsApp, Firebase). Ver `backend/.env.example`.

### Checklist rápido
- [ ] Backend: `.env` com `NODE_ENV=production`, `JWT_SECRET` forte, banco PostgreSQL.
- [ ] Frontend: build com `npm run build`; servir `web/dist/`; API acessível em produção (variável ou proxy).
- [ ] CORS: incluir a origem do frontend em produção no backend (ex.: `allowedOrigins` em `backend/src/server.js` ou via variável de ambiente).

Ver **DEPLOY.md** para passos detalhados.

## 📝 Documentação

Regras de negócio, fluxos e histórias: `BUSINESS_RULES.md`, `USER_FLOWS.md`, `USER_STORIES.md`, etc.

## 🔌 API

Autenticação JWT. Exemplos de endpoints: auth (`/api/auth/login`, `/api/auth/me`), empresas, clientes, pets, agendamentos, estoque, financeiro, relatórios, auditoria. Detalhes em `backend/src/routes/`.

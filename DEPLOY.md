# Deploy - Patatinha

Guia objetivo para build e deploy do frontend e do backend.

---

## Serviços em produção (referência)

| Serviço | URL | Dashboard |
|--------|-----|-----------|
| **Frontend (Vercel)** | https://patatinha-petshop.vercel.app | https://vercel.com/flavio1133s-projects/patatinha-petshop |
| **Backend (Render)** | https://patatinha-petshop.onrender.com | https://dashboard.render.com → patatinha-backend |
| **API Health** | https://patatinha-petshop.onrender.com/api/health | — |
| **Firebase Hosting** | https://patatinha-petshop.web.app | https://console.firebase.google.com → patatinha-petshop |

**Checklist Vercel (frontend):**
- Repositório conectado ao GitHub: `flavio1133/patatinha-backend`
- **Root Directory:** `web` (obrigatório: o app React está dentro da pasta `web`)
- Variável de ambiente (opcional se já tiver `web/.env.production`): `VITE_API_URL` = `https://patatinha-petshop.onrender.com/api`
- Deploy automático a cada `git push` em `main`

---

## 1. Backend (API Node.js)

### Variáveis de ambiente (produção)

Copie `backend/.env.example` para `backend/.env` e ajuste:

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `NODE_ENV` | Sim | `production` |
| `PORT` | Sim | Porta do servidor (ex.: 3000) |
| `JWT_SECRET` | Sim | Chave secreta forte (não use a do exemplo) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Sim | PostgreSQL |
| `UPLOAD_DIR` | Recomendado | Pasta de uploads (ex.: `uploads`) |
| `SMTP_*` | Não | E-mail (notificações) |
| `ONESIGNAL_*` | Não | Push (OneSignal) |
| `WHATSAPP_*` | Não | WhatsApp Business API |
| `FIREBASE_SERVICE_ACCOUNT` | Não | Firebase Admin (se usar App Check) |

### Comandos

```bash
cd backend
npm install --production
NODE_ENV=production node src/server.js
# ou: npm start (com NODE_ENV=production no ambiente)
```

### CORS

Se o frontend estiver em outro domínio, inclua a URL de produção na lista de origens permitidas em `backend/src/server.js` (array `allowedOrigins`) ou configure via variável de ambiente se o código suportar.

---

## 2. Frontend (Web React/Vite)

### Build

```bash
cd web
npm install
npm run build
```

Arquivos de saída: **`web/dist/`** (index.html + pasta `assets/`).

### URL da API em produção

O frontend chama a API usando a variável `VITE_API_URL` em tempo de build.

**Opção A – Arquivo de ambiente**

Crie `web/.env.production`:

```
VITE_API_URL=https://sua-api.com/api
```

Depois rode `npm run build` de dentro de `web/`.

**Opção B – Proxy no servidor**

Sirva o frontend e configure o servidor (Nginx/Apache) para fazer proxy de `/api` e `/uploads` para o backend. Assim não precisa de `VITE_API_URL` se a API estiver no mesmo domínio.

### Servir o build

- **Nginx:** root apontando para `web/dist`, `try_files` para SPA (fallback em `index.html`).
- **Vercel:** na pasta `web`, rode `npx vercel` (ou `vercel` se já tiver o CLI). O `vercel.json` já está configurado.
- **Netlify:** conecte o repositório ao Netlify com raiz em `web`; o `netlify.toml` já define build e redirects para SPA.
- **Apache:** DocumentRoot em `web/dist`, mod_rewrite para redirecionar para `index.html` em rotas do React Router.

Exemplo Nginx (SPA):

```nginx
root /var/www/patatinha/web/dist;
index index.html;
location / {
  try_files $uri $uri/ /index.html;
}
location /api {
  proxy_pass http://localhost:3000;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
location /uploads {
  proxy_pass http://localhost:3000;
}
```

---

## 3. Resumo

| Etapa | Onde | Comando / Ação |
|-------|------|-----------------|
| Backend | `backend/` | Configurar `.env`, depois `npm start` com `NODE_ENV=production` |
| Frontend | `web/` | `npm run build` → servir pasta `dist/` |
| API no frontend | `web/.env.production` ou proxy | Definir `VITE_API_URL` ou proxy `/api` e `/uploads` |
| CORS | Backend | Incluir domínio do frontend em produção |

Após isso, o sistema está pronto para uso em produção.

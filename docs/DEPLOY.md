# Deploy – GitHub, Render e Firebase

Para **tudo funcionar em produção**, as três partes precisam estar alinhadas:

```
[Seu código local] → GitHub → Render (backend)
[Seu código local] → build → Firebase (frontend)
```

Se o código só está na sua máquina e não foi para o GitHub, **o Render continua com a versão antiga** e nada do que mudamos no backend aparece em produção.

---

## 1. O que é cada um

| Onde | O que faz |
|------|-----------|
| **GitHub** | Guarda o código. O Render faz deploy **a partir do repositório** no GitHub. |
| **Render** | Roda o **backend** (API). URL: `https://patatinha-petshop.onrender.com` |
| **Firebase** | Hospeda o **frontend** (site). URL: `https://patatinha-petshop.web.app` |

O frontend (Firebase) chama a API do Render. Se o backend no Render não for atualizado (código novo no GitHub + deploy), as novas rotas e correções **não existem** em produção.

---

## 2. Fluxo correto para as mudanças aparecerem

### Passo A – Subir o código para o GitHub

1. **Inicializar Git** (se ainda não for um repositório):
   ```powershell
   cd c:\Users\livin\mypet
   git init
   ```

2. **Criar um repositório no GitHub** (se ainda não existir):
   - Acesse https://github.com/new
   - Nome sugerido: `mypet` ou `patatinha-petshop`
   - Não marque "Add README" se o projeto já tiver arquivos

3. **Conectar e enviar o código**:
   ```powershell
   git add .
   git commit -m "Código atual: backend disponibilidade, configurações, frontend"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
   git push -u origin main
   ```
   (Troque `SEU_USUARIO` e `NOME_DO_REPO` pelo seu usuário e nome do repositório.)

### Passo B – Render (backend) usar o GitHub

1. Acesse https://dashboard.render.com
2. Abra o **serviço** do backend (Web Service da API Patatinha)
3. Em **Settings** → **Build & Deploy**:
   - **Repository** deve ser o repositório do GitHub que você usou no Passo A
   - **Branch** normalmente é `main`
4. Depois do primeiro `git push`, o Render pode fazer o deploy sozinho. Se não fizer:
   - Clique em **Manual Deploy** → **Deploy latest commit**

Quando o deploy do Render terminar, o backend em produção estará com o código novo (rotas de disponibilidade, configurações, etc.).

### Passo C – Firebase (frontend)

O frontend é publicado a partir da **sua máquina** (não do GitHub):

1. **Build** (usa `web/.env.production` com a URL do Render):
   ```powershell
   cd c:\Users\livin\mypet\web
   npm run build
   ```

2. **Deploy**:
   ```powershell
   cd c:\Users\livin\mypet
   firebase deploy
   ```

Ou use o script (na raiz do projeto):

```powershell
.\deploy-frontend.ps1
```

Assim o site em https://patatinha-petshop.web.app usa o build novo e continua apontando para a API do Render.

---

## 3. Resumo rápido

| O que você quer | O que fazer |
|-----------------|-------------|
| **Backend atualizado no Render** | Código no GitHub + deploy no Render (automático ou Manual Deploy) |
| **Frontend atualizado no Firebase** | Na sua máquina: `cd web; npm run build` e depois `firebase deploy` (ou `.\deploy-frontend.ps1`) |
| **Tudo alinhado** | 1) Push no GitHub → 2) Deploy no Render → 3) Build + Firebase deploy |

---

## 4. Conferir se está certo

- **Frontend apontando para o Render**  
  O arquivo `web/.env.production` deve ter:
  ```env
  VITE_API_URL=https://patatinha-petshop.onrender.com/api
  ```
  O build de produção (`npm run build` em `web`) usa esse arquivo.

- **Render**  
  No painel do Render, em **Logs** ou **Events**, deve aparecer um deploy recente depois do push.

- **Firebase**  
  Depois de `firebase deploy`, o console do Firebase mostra a URL do Hosting (ex.: https://patatinha-petshop.web.app).

---

## 5. Se o projeto já estiver em outro repositório

Se o código que está no Render hoje veio de **outro** repositório ou outra pasta:

- Ou você passa a usar **este** projeto como fonte: inicializa Git aqui, cria um repo no GitHub, conecta esse repo ao serviço no Render e passa a fazer push só desse projeto.
- Ou você **copia** as alterações (arquivos que mudamos) para o repositório que o Render já usa e faz push lá.

Em ambos os casos, depois do push, é necessário um **deploy no Render** (automático ou manual) para o backend em produção mudar.

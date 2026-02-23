# 🚀 Como Iniciar os Servidores

## Servidores Iniciados em Background

Os servidores foram iniciados em background. Eles devem estar rodando nas seguintes portas:

- **Backend API:** http://localhost:3000
- **Frontend Web (Painel Gestor):** http://localhost:3005

---

## 📋 Verificação Manual

### 1. Verificar se o Backend está rodando:

Abra seu navegador e acesse:
```
http://localhost:3000/api/health
```

Você deve ver uma resposta JSON:
```json
{
  "status": "ok",
  "message": "Patatinha API está funcionando!",
  "timestamp": "2026-02-20T..."
}
```

### 2. Verificar se o Frontend está rodando:

Abra seu navegador e acesse:
```
http://localhost:3005
```

Você deve ver a interface do Painel Gestor.

---

## 🔧 Se os Servidores Não Estiverem Rodando

### Backend (Porta 3000)

1. Abra um terminal
2. Navegue até a pasta do backend:
   ```bash
   cd C:\Users\livin\mypet\backend
   ```
3. Instale as dependências (se necessário):
   ```bash
   npm install
   ```
4. Inicie o servidor:
   ```bash
   npm run dev
   ```

### Frontend Web (Porta 3005)

1. Abra **outro** terminal
2. Navegue até a pasta do web:
   ```bash
   cd C:\Users\livin\mypet\web
   ```
3. Instale as dependências (se necessário):
   ```bash
   npm install
   ```
4. Inicie o servidor:
   ```bash
   npm run dev
   ```

---

## 📝 Notas Importantes

- ⚠️ **Backend usa dados em memória** - Os dados não persistem após reiniciar o servidor
- ⚠️ **PostgreSQL não está configurado** - O código atual usa arrays em memória
- ✅ **CORS configurado** - O frontend pode se comunicar com o backend
- ✅ **Proxy configurado** - O Vite redireciona `/api` para `http://localhost:3000`

---

## 🛑 Para Parar os Servidores

Nos terminais onde os servidores estão rodando, pressione:
```
Ctrl + C
```

---

## 🐛 Problemas Comuns

### Porta já em uso

Se a porta 3000 ou 3005 já estiver em uso:

1. **Backend:** Altere `PORT` no arquivo `backend/.env`
2. **Frontend:** Altere `port` no arquivo `web/vite.config.js`

### Erro de módulo não encontrado

Execute:
```bash
npm install
```

Tanto no backend quanto no frontend.

### Backend não responde

Verifique se:
- O arquivo `.env` existe em `backend/.env`
- As dependências estão instaladas
- Não há erros no console

---

## ✅ Status Atual

- ✅ Arquivo `.env` criado no backend
- ✅ Servidores iniciados em background
- ⚠️ Verifique manualmente se estão respondendo

---

**Última atualização:** 2026-02-20

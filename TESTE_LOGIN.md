# 🧪 Guia de Teste - Login Web

## ✅ Correções Aplicadas

Todas as correções foram aplicadas. Agora você precisa **reiniciar os servidores** para aplicar as mudanças.

---

## 🔄 Como Reiniciar

### **Opção 1: Script Automático**

1. Feche todas as janelas de terminal
2. Execute: `parar-tudo.bat` (para garantir que tudo parou)
3. Execute: `INICIAR_SIMPLES.bat`
4. Aguarde 15 segundos

### **Opção 2: Manual**

1. Feche todas as janelas
2. Abra 2 terminais:
   - Terminal 1: `cd backend && npm run dev`
   - Terminal 2: `cd web && npm run dev`
3. Aguarde iniciar

---

## 🧪 Teste Passo a Passo

### **1. Abrir o Console do Navegador**

1. Abra: `http://localhost:3005`
2. Pressione **F12** (ou clique com botão direito > Inspecionar)
3. Vá para a aba **Console**
4. Vá para a aba **Network** (Rede)

### **2. Tentar Fazer Login**

1. Digite: `admin@patatinha.com`
2. Digite: `admin123`
3. Clique em **Entrar**

### **3. Verificar o Console**

**✅ Se funcionar, você verá:**
```
🔐 Tentando fazer login com: admin@patatinha.com
📦 Resposta completa: {data: {...}, status: 200, ...}
✅ Token recebido: eyJhbGciOiJIUzI1NiIs...
✅ Usuário: {id: 1, name: "Administrador Master", ...}
```

**❌ Se não funcionar, você verá:**
```
❌ Erro no login: {message: "...", response: {...}, ...}
```

### **4. Verificar a Aba Network**

1. Na aba **Network**, procure por: `login`
2. Clique na requisição
3. Veja:
   - **Status:** Deve ser `200` (sucesso) ou `401` (erro de credenciais)
   - **Headers:** Deve ter `Content-Type: application/json`
   - **Response:** Deve ter `token` e `user`

---

## 🔍 Problemas Comuns e Soluções

### **Erro: "Servidor não respondeu"**

**Causa:** Backend não está rodando ou CORS bloqueando

**Solução:**
1. Verifique se o backend está rodando: `http://localhost:3000/api/health`
2. Se não estiver, execute: `cd backend && npm run dev`
3. Aguarde aparecer: `🚀 Servidor rodando na porta 3000`

---

### **Erro: "CORS policy"**

**Causa:** Backend não permite origem do frontend

**Solução:**
- ✅ Já corrigido! Verifique se o backend foi reiniciado após as correções
- Se ainda aparecer, verifique `backend/src/server.js` linha 12-35

---

### **Erro: "E-mail ou senha incorretos"**

**Causa:** Credenciais erradas ou usuário não existe

**Solução:**
1. Verifique se o backend criou os usuários de teste
2. No console do backend, deve aparecer: `✅ Usuários de teste criados!`
3. Use exatamente: `admin@patatinha.com` / `admin123`

---

### **Erro: "Token não recebido"**

**Causa:** Estrutura da resposta diferente do esperado

**Solução:**
- ✅ Já corrigido! O código agora verifica múltiplas estruturas
- Se ainda aparecer, veja no console a resposta completa

---

## 📊 Estrutura Esperada da Resposta

A API deve retornar:
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Administrador Master",
    "email": "admin@patatinha.com",
    "role": "master"
  }
}
```

---

## 🎯 Checklist Final

Antes de testar, verifique:

- [ ] Backend está rodando (`http://localhost:3000/api/health` retorna OK)
- [ ] Frontend está rodando (`http://localhost:3005` abre)
- [ ] Console do navegador está aberto (F12)
- [ ] Aba Network está visível
- [ ] Usuários de teste foram criados (veja console do backend)

---

## 📝 Logs Esperados

### **No Console do Backend:**
```
🌱 Criando usuários de teste...
✅ Usuário criado: admin@patatinha.com (master)
✅ Usuário criado: gerente@patatinha.com (manager)
...
🚀 Servidor rodando na porta 3000
```

### **No Console do Navegador (sucesso):**
```
🔐 Tentando fazer login com: admin@patatinha.com
✅ API Response: POST /api/auth/login 200
📦 Resposta completa: {...}
✅ Token recebido: eyJ...
✅ Usuário: {...}
```

---

**Teste agora e me envie os logs do console se ainda não funcionar!**

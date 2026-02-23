# 🔧 Solução: Frontend Não Está Rodando

## ❌ Problema Identificado

O erro `ERR_CONNECTION_REFUSED` significa que o servidor frontend não está rodando na porta 3005.

## ✅ Solução Passo a Passo

### **Opção 1: Usar o Script Automático (RECOMENDADO)**

1. **Feche todas as janelas de terminal abertas**

2. **Clique duas vezes no arquivo:**
   ```
   iniciar-frontend.bat
   ```

3. **Aguarde aparecer:**
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:3005/
   ```

4. **NÃO FECHE esta janela!**

5. **Abra o navegador em:** `http://localhost:3005`

---

### **Opção 2: Executar Manualmente**

1. **Abra o PowerShell ou CMD**

2. **Execute estes comandos um por um:**

```powershell
cd C:\Users\livin\mypet\web
npm run dev
```

3. **Aguarde aparecer:**
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:3005/
   ```

4. **NÃO FECHE esta janela!**

5. **Abra o navegador em:** `http://localhost:3005`

---

## 🔍 Verificações Importantes

### ✅ **1. Verificar se o Backend está rodando**

Abra no navegador: `http://localhost:3000/api/health`

Deve retornar:
```json
{
  "status": "ok",
  "message": "Patatinha API está funcionando!"
}
```

**Se não funcionar:** O backend não está rodando. Execute `iniciar-backend.bat` primeiro.

---

### ✅ **2. Verificar se a porta 3005 está livre**

Se aparecer erro de "porta já em uso":

1. Feche outros programas que possam estar usando a porta
2. Ou reinicie o computador
3. Tente novamente

---

### ✅ **3. Verificar se as dependências estão instaladas**

Se aparecer erro de módulo não encontrado:

```powershell
cd C:\Users\livin\mypet\web
npm install
```

Aguarde terminar e tente novamente.

---

## 📋 Checklist Completo

Antes de pedir ajuda, verifique:

- [ ] Backend está rodando? (`http://localhost:3000/api/health`)
- [ ] Frontend está rodando? (janela com VITE aberta)
- [ ] As duas janelas estão abertas?
- [ ] Não há erros nas janelas?
- [ ] Digitou corretamente `http://localhost:3005`?
- [ ] Tentou recarregar a página (F5)?

---

## 🎯 Ordem Correta de Inicialização

1. **PRIMEIRO:** Backend (`iniciar-backend.bat`)
   - Deve mostrar: `🚀 Servidor rodando na porta 3000`
   - **DEIXE ABERTO**

2. **SEGUNDO:** Frontend (`iniciar-frontend.bat`)
   - Deve mostrar: `Local: http://localhost:3005/`
   - **DEIXE ABERTO**

3. **TERCEIRO:** Abrir navegador
   - Digite: `http://localhost:3005`
   - Pressione Enter

---

## 🐛 Problemas Comuns

### Erro: "Cannot find module"

**Solução:**
```powershell
cd C:\Users\livin\mypet\web
npm install
```

### Erro: "Port 3005 is already in use"

**Solução:**
1. Feche outros programas
2. Ou altere a porta no arquivo `web/vite.config.js`

### Erro: "npm não é reconhecido"

**Solução:**
1. Instale o Node.js: https://nodejs.org/
2. Reinicie o computador
3. Tente novamente

---

## 📞 Se Nada Funcionar

1. Feche TODAS as janelas de terminal
2. Reinicie o computador
3. Execute `instalar-dependencias.bat` novamente
4. Execute `iniciar-backend.bat`
5. Execute `iniciar-frontend.bat`
6. Abra `http://localhost:3005`

---

**Última atualização:** 2026-02-20

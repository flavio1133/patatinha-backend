# 🚀 Guia Rápido - Iniciar Servidores

## ⚠️ Problema Identificado

O servidor frontend não está rodando porque as dependências não foram instaladas. Siga os passos abaixo:

---

## 📋 Passo a Passo

### 1️⃣ Instalar Dependências do Frontend

Abra um terminal PowerShell ou CMD e execute:

```powershell
cd C:\Users\livin\mypet\web
npm install
```

**Aguarde a instalação terminar** (pode levar alguns minutos).

---

### 2️⃣ Instalar Dependências do Backend (se necessário)

Em outro terminal ou após o passo 1:

```powershell
cd C:\Users\livin\mypet\backend
npm install
```

---

### 3️⃣ Iniciar o Backend

Em um terminal, execute:

```powershell
cd C:\Users\livin\mypet\backend
npm run dev
```

Você deve ver:
```
🚀 Servidor rodando na porta 3000
📍 Ambiente: development
```

**Deixe este terminal aberto!**

---

### 4️⃣ Iniciar o Frontend

Abra **OUTRO terminal** e execute:

```powershell
cd C:\Users\livin\mypet\web
npm run dev
```

Você deve ver algo como:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3005/
  ➜  Network: use --host to expose
```

**Deixe este terminal aberto também!**

---

## ✅ Verificar se Está Funcionando

### Backend (API)
Abra no navegador:
```
http://localhost:3000/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "Patatinha API está funcionando!",
  "timestamp": "..."
}
```

### Frontend (Painel Gestor)
Abra no navegador:
```
http://localhost:3005
```

Deve abrir a interface do Painel de Gestão.

---

## 🐛 Problemas Comuns

### Erro: "porta já em uso"

Se a porta 3000 ou 3005 já estiver em uso:

1. Feche outros programas que possam estar usando essas portas
2. Ou altere a porta no arquivo de configuração

### Erro: "npm não é reconhecido"

Instale o Node.js:
- Baixe em: https://nodejs.org/
- Instale a versão LTS
- Reinicie o terminal

### Erro: "EPERM" ou permissões

Execute o terminal como Administrador:
1. Clique com botão direito no PowerShell/CMD
2. Selecione "Executar como administrador"
3. Execute os comandos novamente

---

## 📝 Comandos Rápidos (Copiar e Colar)

### Terminal 1 - Backend
```powershell
cd C:\Users\livin\mypet\backend
npm install
npm run dev
```

### Terminal 2 - Frontend
```powershell
cd C:\Users\livin\mypet\web
npm install
npm run dev
```

---

## 🛑 Para Parar os Servidores

Nos terminais onde estão rodando, pressione:
```
Ctrl + C
```

---

## 📊 Status Esperado

Quando tudo estiver funcionando:

- ✅ **Backend:** http://localhost:3000 ✅ Rodando
- ✅ **Frontend:** http://localhost:3005 ✅ Rodando
- ✅ **API Health:** http://localhost:3000/api/health ✅ Responde JSON

---

**Última atualização:** 2026-02-20

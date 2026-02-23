# 🎯 Guia Visual - Como Iniciar o Patatinha

## 📋 Passo a Passo Detalhado

### ✅ **OPÇÃO 1: Usar os Scripts Automáticos (MAIS FÁCIL)**

Criei 3 arquivos `.bat` que fazem tudo automaticamente:

#### **1. Primeira Vez - Instalar Dependências**

1. **Encontre o arquivo:** `instalar-dependencias.bat`
2. **Clique duas vezes** nele
3. **Aguarde** a instalação terminar (pode levar 5-10 minutos)
4. Quando aparecer "TODAS AS DEPENDENCIAS FORAM INSTALADAS!", está pronto!

#### **2. Iniciar o Backend**

1. **Encontre o arquivo:** `iniciar-backend.bat`
2. **Clique duas vezes** nele
3. Uma janela preta vai abrir
4. Você deve ver: `🚀 Servidor rodando na porta 3000`
5. **NÃO FECHE esta janela!**

#### **3. Iniciar o Frontend**

1. **Encontre o arquivo:** `iniciar-frontend.bat`
2. **Clique duas vezes** nele
3. Outra janela preta vai abrir
4. Você deve ver: `Local: http://localhost:3005/`
5. **NÃO FECHE esta janela também!**

#### **4. Abrir no Navegador**

1. Abra o Google Chrome (ou outro navegador)
2. Digite na barra de endereço: `http://localhost:3005`
3. Pressione Enter
4. Pronto! O Painel de Gestão deve aparecer! 🎉

---

### ✅ **OPÇÃO 2: Usar o Terminal Manualmente**

Se preferir fazer manualmente ou os scripts não funcionarem:

#### **Passo 1: Abrir o Terminal**

1. Pressione `Windows + R`
2. Digite: `powershell`
3. Pressione Enter
4. Uma janela preta vai abrir

#### **Passo 2: Instalar Dependências do Backend**

No terminal, digite cada linha e pressione Enter:

```powershell
cd C:\Users\livin\mypet\backend
npm install
```

**Aguarde terminar** (pode levar alguns minutos)

#### **Passo 3: Instalar Dependências do Frontend**

Ainda no terminal, digite:

```powershell
cd C:\Users\livin\mypet\web
npm install
```

**Aguarde terminar** novamente

#### **Passo 4: Iniciar o Backend**

1. Abra **OUTRO terminal** (repita Passo 1)
2. Digite:

```powershell
cd C:\Users\livin\mypet\backend
npm run dev
```

3. Você deve ver: `🚀 Servidor rodando na porta 3000`
4. **Deixe esta janela aberta!**

#### **Passo 5: Iniciar o Frontend**

1. Abra **MAIS UM terminal** (repita Passo 1)
2. Digite:

```powershell
cd C:\Users\livin\mypet\web
npm run dev
```

3. Você deve ver: `Local: http://localhost:3005/`
4. **Deixe esta janela aberta também!**

#### **Passo 6: Abrir no Navegador**

1. Abra o Google Chrome
2. Digite: `http://localhost:3005`
3. Pressione Enter
4. Pronto! 🎉

---

## 🖼️ Como Deve Ficar

Quando tudo estiver funcionando, você terá:

```
┌─────────────────────────────────────────┐
│  Janela 1: Backend (porta 3000)        │
│  ┌───────────────────────────────────┐  │
│  │ 🚀 Servidor rodando na porta 3000│  │
│  │ 📍 Ambiente: development         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Janela 2: Frontend (porta 3005)       │
│  ┌───────────────────────────────────┐  │
│  │ VITE v5.x.x  ready in xxx ms      │  │
│  │ ➜  Local: http://localhost:3005/ │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Navegador: http://localhost:3005      │
│  ┌───────────────────────────────────┐  │
│  │  [Painel de Gestão Patatinha]     │  │
│  │                                    │  │
│  │  Login / Dashboard / etc...      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## ❓ Problemas Comuns

### ❌ Erro: "npm não é reconhecido"

**Solução:**
1. Baixe o Node.js: https://nodejs.org/
2. Instale a versão LTS (recomendada)
3. Reinicie o computador
4. Tente novamente

### ❌ Erro: "porta já em uso"

**Solução:**
1. Feche outros programas que possam estar usando as portas
2. Ou reinicie o computador
3. Tente novamente

### ❌ Erro: "EPERM" ou permissões

**Solução:**
1. Clique com botão direito no arquivo `.bat`
2. Selecione "Executar como administrador"
3. Tente novamente

### ❌ O navegador mostra "ERR_CONNECTION_REFUSED"

**Solução:**
1. Verifique se as duas janelas (backend e frontend) estão abertas
2. Verifique se não há erros nas janelas
3. Aguarde alguns segundos e recarregue a página (F5)

---

## 📞 Checklist Rápido

Antes de pedir ajuda, verifique:

- [ ] Node.js está instalado? (`node --version` no terminal)
- [ ] As duas janelas (backend e frontend) estão abertas?
- [ ] Não há erros vermelhos nas janelas?
- [ ] Digitou corretamente `http://localhost:3005`?
- [ ] Tentou recarregar a página (F5)?

---

## 🎯 Resumo Ultra-Rápido

1. **Primeira vez:** Clique em `instalar-dependencias.bat`
2. **Sempre:** Clique em `iniciar-backend.bat` (deixe aberto)
3. **Sempre:** Clique em `iniciar-frontend.bat` (deixe aberto)
4. **Abrir:** `http://localhost:3005` no navegador

**Pronto!** 🎉

---

**Última atualização:** 2026-02-20

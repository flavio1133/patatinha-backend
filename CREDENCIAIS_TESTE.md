# 🔐 Credenciais de Teste - Patatinha Pet Shop

## 📋 Usuários Pré-Cadastrados

O sistema cria automaticamente estes usuários quando o servidor inicia.

---

## 👨‍💼 **ADMINISTRADOR MASTER** (Acesso Total)

**Use para:** Painel Gestor - Acesso completo a todas as funcionalidades

- **E-mail:** `admin@patatinha.com`
- **Senha:** `admin123`
- **Perfil:** Master (acesso total)
- **Acesso:** Todas as funcionalidades do sistema

---

## 👔 **GERENTE** (Acesso Gerencial)

**Use para:** Painel Gestor - Gerenciamento operacional

- **E-mail:** `gerente@patatinha.com`
- **Senha:** `gerente123`
- **Perfil:** Manager (gerenciamento)
- **Acesso:** Agenda, clientes, relatórios (menos configurações sensíveis)

---

## 👷 **FUNCIONÁRIO** (Acesso Operacional)

**Use para:** Painel Gestor - Operações do dia a dia

- **E-mail:** `funcionario@patatinha.com`
- **Senha:** `func123`
- **Perfil:** Employee (funcionário)
- **Acesso:** Agenda própria, check-in/check-out, prontuário

---

## 👤 **CLIENTE 1** (App Cliente)

**Use para:** App Mobile/Web - Cliente comum

- **E-mail:** `cliente@teste.com`
- **Senha:** `cliente123`
- **Perfil:** Customer (cliente)
- **Acesso:** Seus próprios pets, agendamentos, histórico

---

## 👤 **CLIENTE 2** (App Cliente)

**Use para:** App Mobile/Web - Outro cliente para testes

- **E-mail:** `maria@teste.com`
- **Senha:** `maria123`
- **Perfil:** Customer (cliente)
- **Acesso:** Seus próprios pets, agendamentos, histórico

---

## 🎯 Como Usar

### **Para Testar o Painel Gestor (Web):**

1. Acesse: `http://localhost:3005`
2. Faça login com:
   - **Admin:** `admin@patatinha.com` / `admin123`
   - **Gerente:** `gerente@patatinha.com` / `gerente123`
   - **Funcionário:** `funcionario@patatinha.com` / `func123`

### **Para Testar o App Cliente (Mobile/Web):**

1. Acesse o app cliente (quando implementado)
2. Faça login com:
   - **Cliente 1:** `cliente@teste.com` / `cliente123`
   - **Cliente 2:** `maria@teste.com` / `maria123`

---

## 🔄 Criar Novos Usuários

### Via API (Registro):

**Endpoint:** `POST http://localhost:3000/api/auth/register`

**Exemplo (Cliente):**
```json
{
  "name": "João Silva",
  "email": "joao@teste.com",
  "password": "joao123",
  "phone": "(11) 94444-4444"
}
```

**Nota:** Por padrão, novos usuários são criados como `customer` (cliente).

---

## ⚠️ Importante

- **Ambiente de Desenvolvimento:** Estes usuários são criados automaticamente
- **Produção:** NUNCA use estas senhas em produção!
- **Dados em Memória:** Os usuários são perdidos ao reiniciar o servidor
- **Banco de Dados:** Quando configurar PostgreSQL, execute o seed manualmente

---

## 📝 Níveis de Acesso (Roles)

| Role | Descrição | Acesso |
|:-----|:----------|:-------|
| **master** | Administrador total | Tudo |
| **manager** | Gerente | Quase tudo (menos configurações sensíveis) |
| **financial** | Financeiro | Apenas módulo financeiro |
| **employee** | Funcionário | Agenda própria, check-in/out |
| **customer** | Cliente | Apenas seus próprios dados |

---

## 🧪 Testes Rápidos

### Teste 1: Login Admin
```
POST http://localhost:3000/api/auth/login
{
  "email": "admin@patatinha.com",
  "password": "admin123"
}
```

### Teste 2: Login Cliente
```
POST http://localhost:3000/api/auth/login
{
  "email": "cliente@teste.com",
  "password": "cliente123"
}
```

### Teste 3: Ver Perfil
```
GET http://localhost:3000/api/auth/me
Headers: Authorization: Bearer {token}
```

---

**Última atualização:** 2026-02-20

# Logins válidos - Patatinha

Última atualização: desenvolvimento / testes

**Para testar rapidamente:** acesse `/teste-logins` na aplicação (link na Home).

**Importante:** o backend deve estar rodando (`node src/server.js` no diretório backend).

---

## 1. Administradores da plataforma (Painel Gestor)

Acesso: **/gestao/login**

| Tipo | E-mail | Senha | Função |
|------|--------|-------|--------|
| Administrador Master | admin@patatinha.com | admin123 | Acesso total à plataforma |
| Gerente | gerente@patatinha.com | gerente123 | Gerenciamento operacional |
| Funcionário | funcionario@patatinha.com | func123 | Operações do dia a dia |

---

## 2. Empresa (donos e funcionários da pet shop)

Acesso: **/company/login** (ou "Login da empresa" na Home)

### Dono da empresa
| Tipo | E-mail | Senha | Função |
|------|--------|-------|--------|
| Dono/Gestor | contato@patatinha.com | demo123 | Administrador da empresa Patatinha Recife |

### Funcionários da empresa (cadastrados pelo dono)
| Tipo | E-mail | Senha | Função |
|------|--------|-------|--------|
| Vendedor | vendedor@patatinha.com | vendedor123 | Vendas, cadastro, agendamentos |
| Atendente | atendente@patatinha.com | atendente123 | Atendimento, cadastro, agendamentos |

---

## 3. Usuários de serviços (tutores de pets)

Acesso: **/cliente/login**

| Nome | E-mail | Senha | Tipo |
|------|--------|-------|------|
| Cliente Teste | cliente@teste.com | cliente123 | Usuário de serviços |
| Maria Silva | maria@teste.com | maria123 | Usuário de serviços |
| João Experimental | joao@teste.com | joao123 | Usuário de serviços |

---

## Resumo por tipo de usuário

| Tipo de usuário | Onde faz login | Exemplo |
|-----------------|----------------|---------|
| Administrador da plataforma | /gestao/login | admin@patatinha.com |
| Dono da empresa | /company/login | contato@patatinha.com |
| Funcionário da empresa | /company/login | vendedor@patatinha.com |
| Tutor (cliente) | /cliente/login | cliente@teste.com |

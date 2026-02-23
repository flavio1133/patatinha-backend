# Tipos de Usuário - Patatinha

## 1. Administradores da Plataforma (Painel Gestor)

Administradores do **site/plataforma como um todo** – ferramentas administrativas como qualquer gerenciador de TI ou suporte. Acessam via **Painel de Gestão** (`/gestao/login`).

| Tipo | E-mail | Senha | Acesso |
|------|--------|-------|--------|
| **Administrador Master** | admin@patatinha.com | admin123 | Total – todas as funcionalidades da plataforma |
| **Gerente** | gerente@patatinha.com | gerente123 | Gerenciamento operacional da plataforma |
| **Funcionário** | funcionario@patatinha.com | func123 | Operações do dia a dia da plataforma |

---

## 2. Clientes da Plataforma (dois tipos)

### 2.1 Usuários de Serviços (Tutores de Pets)
- **Quem são:** Donos de pets que agendam banho, tosa, consultas etc.
- **Acesso:** Área do cliente – pets, agendamentos, histórico, galeria
- **Exemplos:** cliente@teste.com, maria@teste.com, joao@teste.com

### 2.2 Clientes que Compram o Plano (Donos de Pet Shop)
- **Quem são:** Donos de pet shop que pagam plano e administram **sua empresa**
- **Após pagar:** Viram administradores da página da **sua empresa**
- **Acesso:** Painel da empresa – gestão completa da sua pet shop
- **Poderes:** Cadastrar funcionários (nome, CPF, login, senha), definir função, excluir a qualquer momento
- **Login:** Mesmo login da empresa – `/company/login`
- **Exemplo:** contato@patatinha.com (empresa Patatinha Recife)

---

## 3. Funcionários da Empresa

Funcionários **da pet shop** (não da plataforma). Cadastrados pelo **dono/gestor da empresa**.

| Categoria | Descrição | Permissões típicas |
|-----------|-----------|-------------------|
| **Vendedor** | Operações de venda | Vender produtos, cadastrar clientes, agendar atendimentos |
| **Atendente** | Atendimento e agenda | Cadastrar clientes, agendar, check-in/check-out |
| **Tosador** | Serviços de estética | Executar serviços (banho, tosa), registrar conclusão |
| **Gerente da loja** | Gestão da unidade | Tudo da loja, exceto exclusão de funcionários |

- **Login:** Mesmo ponto de entrada da empresa – `/company/login`
- **Poderes:** Conforme cargo definido pelo gestor
- O gestor da empresa pode **excluir** funcionário a qualquer tempo

---

## Fluxo de Acesso

```
                    ┌─────────────────────────────────────┐
                    │           HOMEPAGE                   │
                    └─────────────────────────────────────┘
                                      │
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
            ▼                         ▼                         ▼
   ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
   │ Tutor (cliente) │    │ Pet Shop         │    │ Admin Plataforma    │
   │ /cliente/login  │    │ /company/login   │    │ /gestao/login       │
   └────────┬────────┘    └────────┬─────────┘    └──────────┬──────────┘
            │                      │                         │
            ▼                      │                         ▼
   ┌─────────────────┐             │              ┌─────────────────────┐
   │ Área do Cliente │             │              │ Master / Gerente /  │
   │ pets, agendar   │             │              │ Funcionário         │
   └─────────────────┘             │              └─────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
           ┌─────────────────┐           ┌─────────────────┐
           │ Dono da Empresa │           │ Funcionário     │
           │ (admin empresa) │           │ (vendedor, etc) │
           └────────┬────────┘           └────────┬────────┘
                    │                             │
                    ▼                             ▼
           ┌─────────────────────────────────────────────┐
           │     Painel da Empresa (gestão da loja)      │
           │  Dono: tudo | Func: conforme cargo          │
           └─────────────────────────────────────────────┘
```

# Usuários de teste – Patatinha

Um usuário de cada categoria. Válidos após deploy do backend.

---

## Separação das plataformas

| Plataforma | Rota | Quem usa | Token |
|------------|------|----------|-------|
| **Gestão** | `/gestao/login` | Admins da plataforma (TI, suporte) | `auth_token` |
| **Empresa** | `/company/login` | Donos e funcionários de pet shop | `company_token` |
| **Cliente** | `/cliente/login` | Tutores de pets | `auth_token` |

---

## 1. Plataforma (Gestão) – `/gestao/login` ou "Acesso administrativo"

| Categoria    | E-mail                   | Senha          |
|--------------|--------------------------|----------------|
| Super Admin  | super@patatinha.com      | Super@2026     |
| Master       | admin@patatinha.com      | Admin@2026     |
| Gerente      | gerente@patatinha.com    | Gerente@2026   |
| Funcionário  | funcionario@patatinha.com| Func@2026      |
| Financeiro   | financeiro@patatinha.com | Financeiro@2026|

---

## 2. Empresa (pet shop) – `/company/login` ou "Login da empresa"

| Categoria | E-mail                   | Senha        |
|-----------|--------------------------|--------------|
| Dono      | contato@patatinha.com    | demo123      |
| Vendedor  | vendedor@patatinha.com   | vendedor123  |
| Atendente | atendente@patatinha.com  | atendente123 |

---

## 3. Cliente (tutor de pet) – `/cliente/login` ou "Entrar como tutor"

| Categoria | E-mail             | Senha       |
|-----------|--------------------|-------------|
| Cliente   | cliente@teste.com  | Cliente@2026|

---

## Importante

- **Gestão** e **Empresa** usam logins diferentes. Não use credenciais de gestão em "Login da empresa".
- Após alterações no backend, faça `git push` para o Render fazer o deploy.

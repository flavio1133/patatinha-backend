# Estado do projeto e próximos passos – Patatinha

**Atualizado para refletir:** deploy online, conta contato@patatinha.com, agenda e integração com a área do cliente. **Última atualização:** frontend com correção do token da empresa, mensagens de erro claras na Agenda e no modal de novo agendamento, deploy no Firebase concluído. Git: remote `origin` apontando para `https://github.com/flavio1133/patatinha-backend.git`, branch `main` com upstream configurado; push funcionando.

---

## 1. Deploy (tudo online)

| Camada        | Onde está                    | URL / observação |
|---------------|------------------------------|-------------------|
| **Backend**   | Render                       | https://patatinha-petshop.onrender.com – **atualiza só quando há deploy a partir do GitHub** |
| **Frontend**  | Firebase Hosting             | https://patatinha-petshop.web.app – atualiza quando você roda `npm run build` + `firebase deploy` |
| **Código**    | GitHub (repositório)         | O Render faz deploy **a partir do repositório**. Se o código não estiver no GitHub, o backend em produção não muda. |

**Importante:** O projeto nesta pasta **não é um repositório Git** por padrão. Para as alterações do backend aparecerem no Render:
1. Subir o código para o **GitHub** (git init, add, commit, remote, push).
2. O **Render** deve estar conectado a esse repositório e fazer deploy (automático ou manual).

O frontend (Firebase) é publicado da sua máquina: build em `web` e `firebase deploy`. Veja o fluxo completo em **`docs/DEPLOY.md`**.

---

## 2. Conta da empresa (contato@patatinha.com)

No backend (`companies.routes.js`):

- **Empresa fictícia Patatinha Recife** já criada com:
  - CNPJ, endereço, telefone, WhatsApp, Instagram, site
  - Status de teste / trial
- **Funcionários fictícios:**
  - **contato@patatinha.com** / **demo123** (dono)
  - **vendedor@patatinha.com** / **vendedor123**
  - **atendente@patatinha.com** / **atendente123**

O dono (contato@patatinha.com) acessa o **painel de gestão** via **Login da empresa** (`/company/login`). O frontend usa `company_token` e, nas rotas de API que não são só “company”, faz fallback para esse token; o backend aceita e trata como gestor (role equivalente a manager). Ou seja: contato@patatinha.com consegue usar a Agenda e o restante do painel em https://patatinha-petshop.web.app/gestao/...

---

## 3. O que já está preenchido automaticamente (demo em memória)

- **Empresa e funcionários** (acima).
- **Clientes/Pets/Profissionais/Agendamentos (seed em memória no backend):**
  - 1 cliente demo: “Cliente Teste Patatinha” (cliente@teste.com), `userId: 5` para ver agendamentos na área do cliente.
  - 1 pet demo: **Kiara** (Golden Retriever), vinculado a esse cliente.
  - 3 profissionais: Ana Souza, Carlos Lima, Mariana Costa (horários e especialidades).
  - Vários **agendamentos fictícios da Kiara** (hoje, amanhã e depois): banho, tosa, banho e tosa, consulta, com status confirmado/concluído.

Ou seja: ao abrir a Agenda da gestão (com contato@patatinha.com ou com login de gestão “auth”), já aparecem agendamentos da Kiara. E, ao logar como **cliente@teste.com** (Cliente@2026), os mesmos agendamentos aparecem na área do cliente.

---

## 4. O que não está preenchido automaticamente (e pode ser cadastrado na interface)

- Clientes reais da empresa (além do demo).
- Pets desses clientes (além da Kiara).
- Novos agendamentos (além do seed).
- Estoque, vendas, financeiro etc.

Tudo isso pode ser cadastrado pela interface usando contato@patatinha.com (ou outro gestor). Como o backend está em **dados em memória/demo**, funciona para testes, mas **os dados podem se perder se o servidor reiniciar** (Render, etc.).

---

## 5. Agenda da empresa – o que está implementado

- **Agendamentos fictícios da Kiara** na Agenda (visões Dia, Semana, Mês, Lista).
- **Formulário real “+ Novo agendamento”** (modal):
  - Cliente → Pet (ex.: Kiara) → Serviço → Profissional (opcional) → Data e horário → Observações.
  - Grava no backend via `POST /api/appointments` (com `customerId` e, quando existir, `userId` do cliente).
- **Integração com a área do cliente:** agendamentos criados com `customerId` (e cliente com `userId`) aparecem para o tutor em **Agendamentos** e no dashboard (cliente@teste.com / Cliente@2026).
- **Resposta da API** de listagem de agendamentos enriquecida com `petName` e `professionalName`.
- **Status** da API (confirmed, checked_in, in_progress, completed, cancelled) mapeados na interface (Confirmado, Check-in, Em andamento, Concluído, Cancelado).

Quando estiver tudo publicado em https://patatinha-petshop.web.app/gestao/appointments, basta testar com contato@patatinha.com (company login) e, na área do cliente, com cliente@teste.com.

---

## 6. Próximos passos (visão geral)

- **Códigos de acesso (Passo 5):** No painel de gestão, o dono da empresa (contato@patatinha.com) tem no menu "Códigos de acesso" (`/gestao/codigos`). Pode gerar códigos, copiar, enviar por WhatsApp, gerar QR e excluir. O cliente usa o código em `/cliente/codigo` para se vincular à empresa (validar → login/cadastro → vincular).

1. **Cenário “real” e duradouro para contato@patatinha.com**
   - Subir **PostgreSQL** no Render (ou similar).
   - Conectar as rotas (clientes, pets, appointments, profissionais, etc.) ao banco.
   - Criar **seed completo** só para essa empresa (clientes, pets, agenda, etc.), conforme você definir (quantos clientes, quantos pets, quais serviços na agenda, etc.).

2. **Opcional antes do banco**
   - Listar exatamente quais dados de exemplo você quer (quantos clientes, quantos pets, quais serviços na agenda, estoque inicial, etc.) e deixar o seed já preparado para quando o banco estiver ligado.

---

## 7. Referência rápida de logins

| Onde      | E-mail                  | Senha        | Uso |
|-----------|-------------------------|-------------|-----|
| Empresa   | contato@patatinha.com   | demo123     | Dono – painel gestão (Agenda, Clientes, etc.) |
| Empresa   | vendedor@patatinha.com  | vendedor123 | Funcionário |
| Empresa   | atendente@patatinha.com | atendente123| Funcionário |
| Gestão    | admin@patatinha.com     | Admin@2026  | Acesso administrativo (/gestao/login) |
| Cliente   | cliente@teste.com       | Cliente@2026| Ver agendamentos da Kiara na área do cliente |

Detalhes em `docs/USUARIOS-TESTE.md` e `docs/LOGINS_VALIDOS.md`.

---

*Documento para manter a par do estado atual e dos próximos passos, inclusive após deploy.*

# Plano – Painel de Gestão funcionando de ponta a ponta

Objetivo: fazer o menu (Dashboard, Agenda, Clientes, Pets, Estoque, PDV, Financeiro, Relatórios, Configurações) funcionar de verdade em produção, com sincronização entre empresa, clientes e dados.

---

## Prioridades (ordem sugerida)

| # | Passo | Objetivo | Confirmação |
|---|--------|----------|-------------|
| **1** | **Conexão API em produção** | Frontend (Firebase) falar com Backend (Render); Dashboard carregar dados reais ou fallback claro. | ✅ Confirmado |
| **2** | Navegação empresa → painel | Quem entra por “Login da empresa” conseguir ir ao Painel de Gestão (sidebar) sem confusão. | ✅ Implementado |
| 3 | **Agenda** | Listar/criar agendamentos; disponibilidade; integração com área do cliente. | ✅ Implementado |
| 4 | **Clientes e Pets** | Empresa ver/cadastrar clientes; acesso aos dados dos animais e dos clientes. | ✅ Implementado |
| 5 | Códigos de acesso únicos | Pet shop gerar códigos para clientes; cliente usar código para vincular à empresa. | ✅ Implementado |
| 6 | Estoque e PDV | Administrar estoque; registrar vendas (ganhos). | |
| 7 | Financeiro | Controle de entradas/saídas; faturamento. | |
| 8 | Relatórios e gráficos | Relatórios e gráficos reais a partir dos dados. | |
| 9 | Configurações | Perfil e preferências da empresa. | |
| 10 | Recursos extras | Melhorias profissionais no painel (filtros, exportação, etc.). | |

---

## Passo 1 – Conexão API em produção (atual)

**Objetivo:** Garantir que, ao abrir o painel em https://patatinha-petshop.web.app, o app use a API do Render e que pelo menos o **Dashboard** carregue (dados reais ou mensagem clara).

**O que pode estar falhando hoje:**
- O build de produção não estar usando a URL da API do Render (variável `VITE_API_URL`).
- Sem isso, o frontend chama `/api` no próprio domínio (Firebase), onde não existe backend, e todas as telas “não funcionam”.

**O que fazer no Passo 1:**
1. Garantir que o build de produção use `VITE_API_URL=https://patatinha-petshop.onrender.com/api` (arquivo `.env.production`).
2. Rebuild do frontend com esse env e novo deploy no Firebase.
3. Testar: abrir o painel, fazer login (empresa ou gestão) e abrir o Dashboard; deve carregar números/gráficos ou mensagem de erro clara (ex.: “Não foi possível carregar. Verifique a conexão.”).

**Critério de sucesso do Passo 1:**  
Ao entrar no Painel de Gestão e clicar em Dashboard, a página carrega e mostra dados (ou um aviso de erro explícito), sem tela em branco ou “nada funcionando”.

---

### Como fazer o deploy com a API correta

1. No projeto, o arquivo **`web/.env.production`** deve conter:
   ```env
   VITE_API_URL=https://patatinha-petshop.onrender.com/api
   ```
2. Gerar o build de produção a partir da pasta **`web`**:
   ```bash
   cd web
   npm run build
   ```
   (O comando `vite build` já usa o modo production e lê `.env.production`.)
3. Publicar a pasta **`web/dist`** no Firebase (por exemplo: `firebase deploy` na raiz do projeto).

Assim o app em produção passa a chamar o backend no Render.

---

## Passo 3 – Agenda ✅

**O que está funcionando:**
- **Listar:** Agenda com visões Dia, Semana, Mês e Lista; filtros por status e profissional; dados vindos da API (com fallback mock).
- **Criar:** Botão "+ Novo agendamento" abre modal com Cliente → Pet → Serviço → Profissional (opcional) → Data e horário; grava no backend.
- **Integração cliente:** Agendamentos criados com cliente vinculado (customerId/userId) aparecem na área do cliente (cliente@teste.com em Agendamentos e no dashboard).
- **Check-in:** Botão de check-in para agendamentos confirmados.
- **Estados vazios:** Mensagens quando não há agendamentos no dia, na semana, no mês ou na lista.

**Como testar:** Painel de Gestão → Agenda → escolher data, criar novo agendamento (cliente "Cliente Teste Patatinha", pet "Kiara"). Depois entrar como cliente@teste.com (Cliente@2026) e ver o agendamento em Agendamentos.

---

**Próximo:** Passo 4 – Clientes e Pets.

---

## Passo 4 – Clientes e Pets ✅

**O que foi implementado:**
- **Clientes:** Listagem com busca, tabela/cards, botão "+ Novo Cliente" com formulário completo (nome, telefone, e-mail, endereço, observações) gravando na API. Mensagem de erro quando a API falha e botão "Tentar novamente".
- **Detalhe do cliente:** Aba **Informações** com endereço e observações; aba **Pets** com lista de pets do cliente (vindos da API) e link para detalhe do pet; aba **Agendamentos** com lista de agendamentos do cliente (data, horário, pet, serviço, status).
- **Pets (gestão):** Lista de todos os pets com nome do dono (busca de clientes para montar o mapa customerId → nome). Busca por nome, raça, espécie ou dono.
- **Detalhe do pet:** Nome do dono (via API de clientes), info importante, alertas de comportamento, preferências de tosa/banho, idade e peso quando existirem.

**Próximo:** Passo 5 – Códigos de acesso únicos.

---

## Passo 5 – Códigos de acesso únicos ✅

**O que foi implementado:**
- **No painel de gestão:** Item "Códigos de acesso" no menu lateral (Layout), rota `/gestao/codigos`, mesma página de gerar/listar/copiar/WhatsApp/QR/excluir códigos, sem sair do painel. Link "Voltar" leva a `/gestao/dashboard` quando acessado pelo painel e a `/company/dashboard` quando acessado pela área empresa.
- **Rota legada:** `/company/codigos` continua funcionando (protegida por `company_token`) para quem entra pela área da empresa.
- **Backend:** Estatísticas de códigos (total, disponíveis, usados, expirados) calculadas sempre sobre a lista completa da empresa, mesmo com filtro por status na listagem.
- **Fluxo cliente:** Cliente em `/cliente/codigo` digita o código → validação (`validate-invitation-code`) → login/cadastro → vínculo (`link-client-to-company`). Códigos gerados na gestão podem ser compartilhados por link, copiar ou WhatsApp.

**Próximo:** Passo 6 – Estoque e PDV.

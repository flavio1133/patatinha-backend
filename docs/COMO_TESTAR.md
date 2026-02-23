# Como testar se tudo deu certo

Use este guia para conferir se o frontend, a API e os fluxos principais estão funcionando.

---

## 1. Site no ar (Firebase)

1. Abra no navegador: **https://patatinha-petshop.web.app**
2. A página inicial do Patatinha deve carregar (não tela em branco nem erro).
3. Se carregar = **Frontend (Firebase) está ok.**

---

## 2. API no ar (Render)

1. Abra no navegador: **https://patatinha-petshop.onrender.com/api/health**
2. Deve aparecer algo como: `{"status":"ok","message":"Patatinha API está funcionando!"}`.
3. Se aparecer = **Backend (Render) está respondendo.**

Se der erro ou não abrir, o backend pode estar dormindo (Render “spin down”) ou o deploy ainda não tem o código novo. Espere 1–2 minutos e teste de novo.

---

## 3. Login da empresa e painel

1. No site **https://patatinha-petshop.web.app**, vá em **Login da empresa** (ou acesse `/company/login`).
2. Entre com:
   - **E-mail:** `contato@patatinha.com`
   - **Senha:** `demo123`
3. Deve entrar e ver a tela da empresa.
4. Clique em **“Abrir painel de gestão”** (ou acesse `/gestao/dashboard`).
5. Deve abrir o painel com o menu lateral (Dashboard, Agenda, Clientes, Pets, etc.).

Se isso funcionar = **Login da empresa e acesso ao painel estão ok.**

---

## 4. Dashboard e Clientes

1. No painel, clique em **Dashboard**.
2. Deve carregar (números, gráficos ou mensagem de “não foi possível carregar”).
3. Clique em **Clientes**.
4. Deve aparecer pelo menos “Cliente Teste Patatinha” (ou lista vazia, mas sem erro de rede).

Se a lista carregar (ou der erro claro da API) = **Dashboard e Clientes estão se comunicando com a API.**

---

## 5. Agenda

1. No menu, clique em **Agenda**.
2. Deve abrir a agenda (dia/semana/mês ou lista).
3. Clique em **“+ Novo agendamento”**.
4. Selecione cliente (ex.: Cliente Teste Patatinha), pet (Kiara), serviço, data e horário e salve.
5. O agendamento deve aparecer na lista.

Se criar e listar = **Agenda está ok.**

---

## 6. Códigos de acesso

1. No menu do painel, clique em **Códigos de acesso**.
2. Deve abrir a página de códigos (gerar, copiar, WhatsApp, QR).
3. Clique em **“Gerar novo código”**.
4. Deve aparecer um código novo na lista.

Se gerar e listar = **Códigos de acesso estão ok.**

---

## 7. Configurações (datas e horários)

1. No menu, clique em **Configurações**.
2. Abra a aba **“Datas e horários”** (ou primeira aba).
3. Deve aparecer:
   - Horário de funcionamento por dia (Segunda a Domingo).
   - Serviços que o cliente pode agendar (checkboxes).
4. Altere um horário ou um serviço e clique em **“Salvar horários”** ou **“Salvar serviços”**.
5. Deve aparecer mensagem de sucesso (ou erro claro).

Se carregar e salvar = **Configurações estão ok.**

---

## 8. Cliente agendar (horários disponíveis)

Só vale testar se o **backend no Render já tiver o código novo** (deploy a partir do GitHub).

1. Gere um **código de acesso** no painel (item 6) e copie.
2. Abra uma aba anônima ou outro navegador e acesse **https://patatinha-petshop.web.app/cliente/codigo**.
3. Digite o código e valide; faça login ou cadastro e vincule à empresa.
4. Vá em **Agendar** (ou **Agendar serviço**).
5. Escolha o pet, o serviço e uma **data**.
6. Deve aparecer **“Horários disponíveis”** com vários horários (ex.: 08:00, 08:30, 09:00…).  
   Se aparecer **“Nenhum horário nesta data”** em toda data, o backend em produção ainda não tem a rota nova de disponibilidade (falta deploy no Render com o código do GitHub).

Se os horários aparecerem e você conseguir concluir o agendamento = **Cliente agendando está ok.**

---

## Resumo rápido

| O que testar              | Como                              | Deu certo se…                    |
|---------------------------|-----------------------------------|----------------------------------|
| Site no ar                | Abrir patatinha-petshop.web.app   | Página inicial carrega          |
| API no ar                 | Abrir ...onrender.com/api/health  | Aparece `"status":"ok"`          |
| Login empresa             | contato@patatinha.com / demo123   | Entra e vê painel                |
| Dashboard e Clientes      | Clicar no menu                    | Carrega ou mensagem clara        |
| Agenda                    | Criar um agendamento              | Aparece na lista                 |
| Códigos de acesso         | Gerar um código                   | Código aparece na tela           |
| Configurações             | Salvar horários/serviços          | Mensagem de sucesso              |
| Cliente ver horários      | Agendar com código vinculado      | Aparecem horários na data        |

Se todos os itens que você testar passarem, **está tudo certo** no que foi testado. Se algo falhar, anote a tela (ou o texto do erro) e em qual passo parou para ajustar.

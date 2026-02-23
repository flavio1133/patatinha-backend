# 📋 Regras de Negócio - Patatinha

Este documento contém todas as regras de negócio do sistema Patatinha, organizadas por módulo.

## 📌 Índice

- [Módulo 1: Gestão de Clientes e Pets (CRM)](#módulo-1-gestão-de-clientes-e-pets-crm)
- [Módulo 2: Agenda Inteligente](#módulo-2-agenda-inteligente)
- [Módulo 3: Controle de Estoque e PDV](#módulo-3-controle-de-estoque-e-pdv)
- [Módulo 4: Gestão Financeira](#módulo-4-gestão-financeira)
- [Módulo 5: Acessos e Permissões](#módulo-5-acessos-e-permissões)
- [Módulo 6: Notificações e Comunicação](#módulo-6-notificações-e-comunicação)

---

## Módulo 1: Gestão de Clientes e Pets (CRM)

### RN001 - Limite de Pets por Cliente
**Regra:** Um cliente pode ter no máximo 5 pets cadastrados.

**Motivo:** Evitar cadastros em massa e uso indevido.

**Implementação:**
- Validação no backend ao criar pet
- Mensagem de erro: "Limite de 5 pets por cliente atingido"

---

### RN002 - Campos Obrigatórios do Pet
**Regra:** Ao cadastrar um pet, os campos obrigatórios são: nome, espécie e data de nascimento (ou idade aproximada).

**Motivo:** Dados mínimos para atendimento.

**Implementação:**
- Validação de campos obrigatórios no formulário
- Mensagem de erro específica para cada campo faltante

---

### RN003 - Alertas de Segurança no Prontuário
**Regra:** Se o pet tiver alergia ou comportamento agressivo, isso deve aparecer em DESTAQUE (fundo vermelho) no prontuário.

**Motivo:** Segurança do animal e do profissional.

**Implementação:**
- Campo `importantInfo` e `behaviorAlerts` no modelo Pet
- Estilo visual diferenciado na UI (fundo vermelho, ícone de alerta)

---

### RN004 - Compressão de Imagens
**Regra:** Fotos enviadas devem ser comprimidas automaticamente para no máximo 2MB.

**Motivo:** Economizar espaço em disco.

**Implementação:**
- Middleware de upload que comprime imagens
- Validação de tamanho antes do upload

---

### RN005 - Alertas de Vacina
**Regra:** Alertas de vacina: enviar 15, 7 e 1 dia antes do vencimento.

**Motivo:** Lembrar o cliente no timing certo.

**Implementação:**
- Job agendado que verifica vacinas próximas ao vencimento
- Envio de notificações automáticas (WhatsApp/SMS/Push)

---

### RN006 - Sugestão de Pacotes Familiares
**Regra:** Se o cliente tiver 2 ou mais pets, o sistema deve sugerir pacotes familiares.

**Motivo:** Aumentar ticket médio.

**Implementação:**
- Lógica que verifica quantidade de pets do cliente
- Banner ou notificação sugerindo pacotes quando aplicável

---

## Módulo 2: Agenda Inteligente

### RN007 - Cancelamento pelo Cliente
**Regra:** Cancelamento pelo cliente via app: permitido até 2 horas antes do horário agendado.

**Motivo:** Evitar horários vagos de última hora.

**Implementação:**
- Validação de tempo antes de permitir cancelamento
- Botão de cancelamento desabilitado se menos de 2h

---

### RN008 - Cancelamento com Menos de 2h
**Regra:** Cancelamento com menos de 2h de antecedência: só pode ser feito por telefone e pode gerar taxa de 50% (configurável).

**Motivo:** Proteger faturamento.

**Implementação:**
- Apenas gestores podem cancelar com menos de 2h
- Opção de aplicar taxa de cancelamento
- Configuração da taxa no sistema

---

### RN009 - Política de No-Show
**Regra:** Cliente que não comparecer (no-show) sem aviso: após 3 ocorrências, só agenda com pré-pagamento.

**Motivo:** Educar o cliente.

**Implementação:**
- Contador de no-shows por cliente
- Flag `requiresPrePayment` quando atingir 3 ocorrências
- Validação ao criar agendamento

---

### RN010 - Duração Padrão dos Serviços
**Regra:** Duração padrão dos serviços: banho (60min), tosa (90min), banho+tosa (120min), consulta (30min).

**Motivo:** Base para agenda.

**Implementação:**
- Configuração de duração por tipo de serviço
- Uso no cálculo de disponibilidade

---

### RN011 - Intervalo entre Agendamentos
**Regra:** Intervalo entre agendamentos para o mesmo profissional: 15 minutos.

**Motivo:** Tempo para preparar estação.

**Implementação:**
- Buffer de 15 minutos no cálculo de disponibilidade
- Não permitir agendamentos consecutivos sem intervalo

---

### RN012 - Conflito de Horários
**Regra:** Profissional não pode ter 2 agendamentos no mesmo horário.

**Motivo:** Óbvio, mas precisa estar explícito.

**Implementação:**
- Validação ao criar/atualizar agendamento
- Verificação de conflitos antes de salvar

---

### RN013 - Check-in com Tolerância
**Regra:** Check-in deve ser feito até 15 minutos após o horário agendado. Após isso, sistema pergunta: "Cliente atrasado? Remarcar?"

**Motivo:** Evitar que agenda atrase.

**Implementação:**
- Validação de tempo ao fazer check-in
- Modal de confirmação se atrasado

---

### RN014 - Check-out após Check-in
**Regra:** Check-out só pode ser feito após o check-in (não dá para finalizar o que não começou).

**Motivo:** Consistência de dados.

**Implementação:**
- Validação de status antes de permitir check-out
- Mensagem de erro se tentar check-out sem check-in

---

### RN015 - Lembrete de Busca
**Regra:** Se o pet estiver pronto há mais de 1h, enviar lembrete ao cliente: "Seu pet está aguardando busca".

**Motivo:** Evitar esquecimento.

**Implementação:**
- Job que verifica pets em status "completed" há mais de 1h
- Envio automático de notificação

---

### RN016 - Profissional Preferido
**Regra:** Cliente pode ter um profissional preferido. Se ele não estiver disponível, sugerir o próximo com mesma especialidade.

**Motivo:** Personalização.

**Implementação:**
- Campo `preferredProfessionalId` no modelo Customer
- Lógica de sugestão ao agendar

---

## Módulo 3: Controle de Estoque e PDV

### RN017 - Receita Padrão de Serviços
**Regra:** Todo serviço de banho/tosa deve ter uma "receita padrão" de insumos (ex: banho pequeno = 40ml shampoo, 30ml condicionador).

**Motivo:** Calcular custo real.

**Implementação:**
- Tabela de receitas de serviços
- Aplicação automática ao finalizar serviço

---

### RN018 - Baixa Automática de Insumos
**Regra:** Ao finalizar um serviço, os insumos são automaticamente baixados do estoque.

**Motivo:** Controle preciso.

**Implementação:**
- Lógica no check-out que aplica receita do serviço
- Dedução automática do estoque

---

### RN019 - Alerta de Estoque Mínimo
**Regra:** Se o estoque de um produto estiver abaixo do mínimo configurado, notificar gestor imediatamente.

**Motivo:** Evitar ruptura.

**Implementação:**
- Verificação após cada movimentação de estoque
- Notificação push/email imediata

---

### RN020 - Alerta de Validade
**Regra:** Produtos com validade inferior a 30 dias devem aparecer em alerta vermelho.

**Motivo:** Evitar perda por vencimento.

**Implementação:**
- Campo `expiryDate` no modelo Product
- Filtro e destaque visual para produtos próximos ao vencimento

---

### RN021 - Precisão em Vendas Fracionadas
**Regra:** Venda fracionada: o sistema deve trabalhar com gramas (1kg = 1000g) para precisão.

**Motivo:** Evitar erro de cálculo.

**Implementação:**
- Armazenamento em gramas no banco
- Conversão para exibição (kg/g)

---

### RN022 - Preço Proporcional Fracionado
**Regra:** Na venda fracionada, o preço é proporcional ao quilo (ex: se 1kg = R$ 40, 300g = R$ 12).

**Motivo:** Justo para o cliente.

**Implementação:**
- Cálculo: `preco = (quantidade_gramas / 1000) * preco_por_kg`
- Validação de precisão

---

### RN023 - Embalagem em Venda Fracionada
**Regra:** Ao vender fracionado, o sistema pergunta: "Usar embalagem do cliente ou fornecer saco?" (custo adicional).

**Motivo:** Controle de embalagens.

**Implementação:**
- Campo opcional `bagCost` na venda
- Pergunta na interface do PDV

---

### RN024 - Produto Indisponível
**Regra:** Produto com estoque zero não deve aparecer como disponível para venda (nem no PDV, nem no app do cliente).

**Motivo:** Evitar frustração.

**Implementação:**
- Filtro de produtos disponíveis (estoque > 0)
- Mensagem "Produto indisponível" se tentar vender

---

## Módulo 4: Gestão Financeira

### RN025 - Cálculo Automático de Comissão
**Regra:** Comissão de tosador: calcular automaticamente ao finalizar serviço, baseado na regra configurada para aquele profissional.

**Motivo:** Transparência e agilidade.

**Implementação:**
- Cálculo automático no check-out
- Registro na tabela de comissões

---

### RN026 - Tipos de Comissão
**Regra:** Comissões podem ser: % sobre serviço, % sobre produtos, valor fixo por atendimento, ou misto.

**Motivo:** Flexibilidade.

**Implementação:**
- Modelo de regra de comissão com tipo configurável
- Cálculo baseado no tipo selecionado

---

### RN027 - Meta de Comissão
**Regra:** Meta de comissão: se profissional bater X atendimentos no mês, ganha bônus Y.

**Motivo:** Incentivo.

**Implementação:**
- Configuração de meta por profissional
- Cálculo de bônus ao final do mês

---

### RN028 - Faturamento de Assinaturas
**Regra:** Assinaturas: faturamento automático no dia 5 de cada mês (configurável).

**Motivo:** Receita previsível.

**Implementação:**
- Job agendado para dia 5
- Processamento automático de cobranças

---

### RN029 - Retry de Cobrança
**Regra:** Se cartão do cliente for recusado na cobrança da assinatura, enviar alerta imediato e tentar novamente em 3, 7 e 15 dias.

**Motivo:** Evitar perda do cliente.

**Implementação:**
- Sistema de retry configurável
- Notificações em cada tentativa

---

### RN030 - Bloqueio de Assinatura
**Regra:** Após 3 tentativas sem sucesso, bloquear benefícios da assinatura até regularização.

**Motivo:** Proteger receita.

**Implementação:**
- Contador de tentativas falhadas
- Status `suspended` na assinatura
- Validação ao usar serviços

---

### RN031 - Prioridade na Agenda
**Regra:** Cliente com assinatura ativa tem prioridade na agenda.

**Motivo:** Fidelização.

**Implementação:**
- Ordenação de disponibilidade priorizando assinantes
- Badge visual na interface

---

### RN032 - Categorização de Transações
**Regra:** Fluxo de caixa: toda movimentação deve ter categoria (ex: Venda, Compra, Salário, Imposto).

**Motivo:** Relatórios precisos.

**Implementação:**
- Campo obrigatório `category` em todas as transações
- Lista de categorias pré-definidas

---

### RN033 - Alertas de Vencimento
**Regra:** Contas a pagar com vencimento em 5 dias devem aparecer em alerta amarelo; vencidas, em vermelho.

**Motivo:** Evitar juros.

**Implementação:**
- Cálculo de dias até vencimento
- Cores dinâmicas na interface

---

## Módulo 5: Acessos e Permissões

### RN034 - Níveis de Acesso
**Regra:** Níveis de acesso no painel gestor: Master (tudo), Gerente (quase tudo), Financeiro (só finanças), Funcionário (só agenda e check-in).

**Motivo:** Segurança.

**Implementação:**
- Middleware de autorização por role
- Validação de permissões em cada endpoint

---

### RN035 - Autenticação de Dois Fatores
**Regra:** Master e Gerente devem ter autenticação de dois fatores obrigatória.

**Motivo:** Proteger dados sensíveis.

**Implementação:**
- Obrigatoriedade de 2FA para roles específicas
- Integração com serviço de 2FA

---

### RN036 - Privacidade de Agenda
**Regra:** Funcionário só vê os próprios agendamentos na agenda (não vê dos colegas).

**Motivo:** Privacidade.

**Implementação:**
- Filtro automático por `professionalId` quando role é `employee`
- Validação no backend

---

### RN037 - Privacidade de Dados do Cliente
**Regra:** Cliente só vê seus próprios dados e de seus pets.

**Motivo:** LGPD.

**Implementação:**
- Validação de ownership em todas as rotas de cliente
- Filtro automático por `customerId` do token

---

### RN038 - Log de Auditoria
**Regra:** Log de todas as ações sensíveis (quem alterou preço, quem excluiu cliente).

**Motivo:** Auditoria.

**Implementação:**
- Tabela de logs de auditoria
- Registro automático de ações críticas

---

## Módulo 6: Notificações e Comunicação

### RN039 - Confirmação de Agendamento
**Regra:** 24h antes do agendamento: enviar confirmação automática (WhatsApp) com botão "Confirmar presença".

**Motivo:** Reduzir no-show.

**Implementação:**
- Job agendado que verifica agendamentos do dia seguinte
- Envio de mensagem com botão interativo

---

### RN040 - Lembrete de Confirmação
**Regra:** Se cliente não confirmar até 12h antes, enviar lembrete extra.

**Motivo:** Reforço.

**Implementação:**
- Verificação de status de confirmação
- Envio de lembrete se não confirmado

---

### RN041 - Notificação de Check-in
**Regra:** Check-in: notificar cliente com mensagem personalizada + previsão de término.

**Motivo:** Transparência.

**Implementação:**
- Envio automático ao fazer check-in
- Cálculo de previsão baseado na duração do serviço

---

### RN042 - Notificação de Check-out
**Regra:** Check-out: notificar cliente com foto do antes/depois + mensagem carinhosa.

**Motivo:** Encantamento.

**Implementação:**
- Envio automático ao fazer check-out
- Inclusão de foto se disponível

---

### RN043 - Horário de Marketing
**Regra:** Marketing em massa: só enviar entre 9h e 20h (evitar horário noturno).

**Motivo:** Não incomodar.

**Implementação:**
- Validação de horário antes de enviar
- Agendamento automático se fora do horário

---

## 📊 Resumo de Implementação

| Status | Quantidade |
|:-------|:-----------|
| ✅ Implementadas | 0 |
| ⏳ Pendentes | 43 |
| 📝 Documentadas | 43 |

---

**Última atualização:** 2026-02-20

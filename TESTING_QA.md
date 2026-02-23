# 🧪 FASE 5 - TESTES (Quality Assurance)

Este documento define a estratégia completa de testes e garantia de qualidade do sistema Patatinha.

---

## 📋 VISÃO GERAL

```
PIRÂMIDE DE TESTES
        ⬆️                      ⬆️
      MANUAIS                  15%  - Mais lentos, mais caros
    ⬆️⬆️⬆️⬆️⬆️                    
  AUTOMATIZADOS                25%  - Equilíbrio
⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️          
   UNITÁRIOS                   60%  - Rápidos, baratos
```

**Objetivo:** Garantir que o sistema funciona perfeitamente antes do lançamento, evitando bugs que prejudiquem a reputação.

---

## 1. TESTES UNITÁRIOS

**O que é:** Testar pequenas partes do código isoladamente (funções, componentes)

**Quem faz:** Desenvolvedores (durante a programação)

**Exemplos:**
- ✅ Função de calcular troco: 50 reais pagos com 100 → troco 50
- ✅ Validar CPF: "123.456.789-09" → true ou false
- ✅ Formatar data: "2026-03-15" → "15/03/2026"
- ✅ Calcular comissão: 30% de R$ 100 → R$ 30
- ✅ Validar email: "teste@email.com" → true

**Ferramentas:**
- **JavaScript/Node.js:** Jest, Mocha
- **Flutter/Dart:** test package (built-in)
- **React:** Jest + React Testing Library

**Meta de Cobertura:** >80% do código

---

## 2. TESTES DE INTEGRAÇÃO

**O que é:** Testar se diferentes partes do sistema conversam bem

**Quem faz:** Desenvolvedores

**Exemplos:**
- ✅ API de agendamento → salva no banco de dados
- ✅ App cliente → recebe dados da API
- ✅ PDV → baixa estoque ao finalizar venda
- ✅ Check-in → envia notificação ao cliente
- ✅ Cancelamento → libera horário na agenda

**Ferramentas:**
- **API:** Postman, Supertest, Newman
- **E2E:** Cypress, Playwright
- **Mobile:** Appium, Detox

**Ambiente:** Ambiente de testes separado do desenvolvimento

**📚 Documentação Detalhada:** Ver `INTEGRATION_TESTS.md` para guia completo com exemplos de código e testes práticos.

---

## 3. TESTES FUNCIONAIS (MANUAIS)

**O que é:** Testar as funcionalidades como um usuário faria

**Quem faz:** QA (Quality Assurance) - testador profissional

### **📱 APP CLIENTE - CHECKLIST DE TESTES**

#### **CADASTRO/LOGIN**
```
☐ Criar conta com WhatsApp funciona?
☐ Criar conta com e-mail funciona?
☐ Validação de campos obrigatórios funciona?
☐ Mensagem de erro para e-mail inválido?
☐ Mensagem de erro para senha fraca?
☐ Login com usuário existente funciona?
☐ Login com credenciais erradas mostra erro?
☐ Esqueci senha - recuperação funciona?
☐ Link de recuperação expira após X horas?
☐ Sair da conta funciona?
☐ Sessão expira após inatividade?
```

#### **PETS**
```
☐ Adicionar novo pet (todos os campos)
☐ Validar campos obrigatórios (nome, espécie)
☐ Editar pet existente funciona?
☐ Excluir pet (com confirmação)
☐ Adicionar foto do pet (câmera e galeria)
☐ Ver histórico do pet carrega corretamente?
☐ Ver fotos do pet (galeria)
☐ Ver vacinas do pet
☐ Ver prontuário médico do pet
☐ Limite de 5 pets por cliente funciona?
```

#### **AGENDAMENTOS**
```
☐ Ver agenda com horários disponíveis
☐ Horários ocupados aparecem bloqueados?
☐ Selecionar serviço funciona?
☐ Selecionar data funciona?
☐ Selecionar horário funciona?
☐ Confirmar agendamento funciona?
☐ Ver agendamento na lista após criar
☐ Ver detalhes do agendamento
☐ Cancelar agendamento (até 2h antes)
☐ Tentar cancelar com menos de 2h (mostra erro?)
☐ Remarcar agendamento funciona?
☐ Receber confirmação de agendamento?
```

#### **ACOMPANHAMENTO EM TEMPO REAL**
```
☐ Receber notificação de check-in
☐ Ver status atualizado na tela
☐ Ver barra de progresso
☐ Receber notificação de pronto
☐ Ver foto do "depois" quando disponível
☐ Botão "Falar com a loja" abre WhatsApp?
☐ Atualização automática do status?
```

#### **PERFIL E CONFIGURAÇÕES**
```
☐ Editar dados pessoais funciona?
☐ Validar campos ao editar?
☐ Ver assinatura/saldo do plano
☐ Ver histórico de compras
☐ Ver histórico de serviços
☐ Configurar notificações
☐ Sair da conta funciona?
☐ Excluir conta (com confirmação dupla)
```

---

### **💻 PAINEL GESTOR - CHECKLIST DE TESTES**

#### **LOGIN E SEGURANÇA**
```
☐ Login com credenciais corretas funciona?
☐ Login com credenciais erradas mostra erro?
☐ Autenticação de dois fatores (se tiver)
☐ Logout funciona?
☐ Sessão expira após inatividade?
☐ Tentar acessar rota protegida sem login redireciona?
☐ Usuário comum não acessa área de admin?
```

#### **DASHBOARD**
```
☐ Cards mostram números corretos?
☐ Gráficos carregam corretamente?
☐ Alertas aparecem quando necessário?
☐ Filtros de data funcionam?
☐ Comparação com período anterior funciona?
☐ Links dos cards levam às páginas corretas?
```

#### **CLIENTES E PETS**
```
☐ Listar clientes funciona?
☐ Busca de clientes funciona?
☐ Filtros funcionam?
☐ Ver detalhes do cliente funciona?
☐ Adicionar cliente funciona?
☐ Validar campos obrigatórios?
☐ Editar cliente funciona?
☐ Excluir cliente (com confirmação)?
☐ Adicionar pet ao cliente funciona?
☐ Ver alertas de comportamento em destaque?
☐ Ver histórico completo do pet?
☐ Exportar lista de clientes?
```

#### **AGENDA**
```
☐ Ver agenda do dia funciona?
☐ Mudar para visão semanal funciona?
☐ Mudar para visão mensal funciona?
☐ Filtrar por profissional funciona?
☐ Filtrar por serviço funciona?
☐ Criar agendamento manual funciona?
☐ Editar agendamento funciona?
☐ Cancelar agendamento funciona?
☐ Fazer check-in funciona?
☐ Fazer check-out funciona?
☐ Remarcar agendamento funciona?
☐ Verificar conflitos de horário?
☐ Bloquear horários funciona?
```

#### **PDV (PONTO DE VENDA)**
```
☐ Buscar cliente funciona?
☐ Adicionar produtos à venda funciona?
☐ Adicionar serviços à venda funciona?
☐ Remover itens da venda funciona?
☐ Aplicar desconto funciona?
☐ Calcular total corretamente?
☐ Finalizar venda (dinheiro) funciona?
☐ Calcular troco corretamente?
☐ Finalizar venda (cartão) funciona?
☐ Finalizar venda (PIX) gera QR Code?
☐ Finalizar venda (crediário) funciona?
☐ Emitir comprovante funciona?
☐ Estoque é baixado após venda?
☐ Comissão é calculada corretamente?
```

#### **ESTOQUE**
```
☐ Listar produtos funciona?
☐ Buscar produto funciona?
☐ Filtros funcionam?
☐ Adicionar produto funciona?
☐ Validar campos obrigatórios?
☐ Editar produto funciona?
☐ Excluir produto (com confirmação)?
☐ Dar entrada no estoque funciona?
☐ Ver alertas de estoque baixo funciona?
☐ Ver produtos próximos ao vencimento funciona?
☐ Venda fracionada funciona?
☐ Cálculo de preço fracionado está correto?
```

#### **FINANCEIRO**
```
☐ Ver comissões calculadas funciona?
☐ Marcar comissão como paga funciona?
☐ Ver fluxo de caixa funciona?
☐ Filtrar por período funciona?
☐ Registrar conta a pagar funciona?
☐ Registrar conta a receber funciona?
☐ Gerar relatório DRE funciona?
☐ Exportar relatórios funciona?
☐ Ver lista de assinantes funciona?
☐ Ver status das assinaturas funciona?
☐ Cobrar assinatura manualmente funciona?
☐ Ver inadimplentes funciona?
```

---

## 4. TESTES DE REGRESSÃO

**O que é:** Testar se funcionalidades que já funcionavam continuam funcionando após mudanças

**Quando fazer:** Após cada correção ou nova funcionalidade

**Exemplo:**
- Você corrige um bug no agendamento
- Testa se o cadastro de cliente (que já funcionava) continua funcionando
- Testa se o PDV (que já funcionava) continua funcionando

**Ferramentas:**
- Testes automatizados (Cypress, Playwright)
- Suíte de testes E2E
- Smoke tests (testes rápidos das funcionalidades críticas)

**Frequência:** Após cada deploy ou correção de bug

---

## 5. TESTES DE USABILIDADE

**O que é:** Observar usuários reais usando o sistema

**Quem faz:** Usuários reais (donos de pet, funcionários de pet shop)

**Como fazer:**
1. Chamar 3-5 pessoas que representam seus usuários
2. Pedir para realizarem tarefas específicas
3. Observar sem interferir
4. Anotar onde elas têm dificuldade
5. Perguntar o que acharam

**Tarefas para Testar:**

#### **Para Clientes:**
```
☐ Criar conta e adicionar pet (5 minutos)
☐ Agendar um banho (3 minutos)
☐ Ver histórico do pet (2 minutos)
☐ Cancelar agendamento (2 minutos)
☐ Ver fotos do pet (1 minuto)
```

#### **Para Gestores:**
```
☐ Fazer login e ver dashboard (2 minutos)
☐ Cadastrar novo cliente e pet (5 minutos)
☐ Criar agendamento manual (3 minutos)
☐ Fazer check-in e check-out (3 minutos)
☐ Finalizar venda no PDV (5 minutos)
☐ Ver relatório financeiro (3 minutos)
```

**O que observar:**
- ☐ Conseguiu fazer a tarefa sem ajuda?
- ☐ Quanto tempo levou?
- ☐ Onde ficou confuso?
- ☐ O que esperava encontrar e não encontrou?
- ☐ O que gostou mais?
- ☐ O que gostou menos?
- ☐ O que mudaria?

**Ferramentas:**
- Gravação de tela (com permissão)
- Observação direta
- Questionário pós-teste
- Entrevista estruturada

---

## 6. TESTES DE PERFORMANCE

**O que é:** Testar se o sistema aguenta muitos usuários ao mesmo tempo

**Quando fazer:** Antes do lançamento

**Testes:**

#### **Carga (Load Testing)**
- 100 pessoas usando simultaneamente - ainda responde rápido?
- Tempo de resposta < 2 segundos para 95% das requisições

#### **Estresse (Stress Testing)**
- 1000 pessoas - o sistema trava?
- Identificar ponto de falha
- Verificar recuperação após sobrecarga

#### **Tempo de Resposta**
- Quanto tempo leva para abrir cada tela?
- Quanto tempo leva para carregar lista de clientes?
- Quanto tempo leva para salvar agendamento?

**Métricas Esperadas:**
- Tempo de resposta API: < 500ms (p95)
- Tempo de carregamento de tela: < 2s
- Lighthouse Performance Score: > 80

**Ferramentas:**
- **API:** K6, JMeter, Artillery
- **Web:** Lighthouse, WebPageTest
- **Mobile:** Firebase Performance Monitoring

---

## 7. TESTES DE SEGURANÇA

**O que é:** Procurar vulnerabilidades

**Testes:**

#### **Autenticação e Autorização**
```
☐ Dados de cartão estão protegidos?
☐ Usuário comum consegue acessar área de admin?
☐ Tokens expiram corretamente?
☐ Senhas estão criptografadas (bcrypt)?
☐ Rate limiting funciona?
☐ CORS está configurado corretamente?
```

#### **Validação e Sanitização**
```
☐ Injeção de SQL é possível?
☐ XSS (Cross-Site Scripting) é possível?
☐ CSRF (Cross-Site Request Forgery) está protegido?
☐ Validação de inputs funciona?
☐ Sanitização de dados funciona?
```

#### **Dados Sensíveis**
```
☐ Senhas não aparecem em logs?
☐ Tokens não aparecem em URLs?
☐ Dados de pagamento estão tokenizados?
☐ Backup do banco está criptografado?
```

**Ferramentas:**
- OWASP ZAP
- Burp Suite
- Snyk
- npm audit / yarn audit

---

## 📅 CRONOGRAMA DE TESTES

```
SPRINT 1-4: Testes durante desenvolvimento
├── Devs fazem testes unitários (contínuo)
├── Devs testam localmente antes de entregar
└── Code review inclui verificação de testes

SPRINT 5: Testes da Versão Beta
├── QA testa todas as funcionalidades (2 semanas)
├── Checklist completo executado
├── Relatório de bugs gerado
└── Devs corrigem bugs críticos

SPRINT 6: Testes com Usuários Reais
├── 3-5 pet shops parceiros usam (2 semanas)
├── Feedback coletado diariamente
├── Ajustes feitos em paralelo
└── Relatório de usabilidade gerado

SEMANA 23: Testes de Carga e Segurança
├── Simular 100 usuários simultâneos
├── Verificar tempos de resposta
├── Scanner de segurança executado
└── Relatório de performance gerado

SEMANA 24: Testes de Regressão Final
├── Re-testar tudo que já estava funcionando
├── Smoke tests executados
├── Homologação final
└── ✅ APROVADO PARA LANÇAMENTO
```

---

## 🐞 COMO REPORTAR BUGS

### **Template de Bug**

```
TÍTULO: [Cliente] Não consigo agendar horário para as 14h

PRIORIDADE: 🟡 ALTO

DESCRIÇÃO:
Ao tentar agendar um banho para o Rex no dia 15/03, o horário das 14h 
aparece como disponível, mas ao confirmar aparece erro.

PASSOS PARA REPRODUZIR:
1. Fazer login como cliente (maria@gmail.com)
2. Clicar em "Agendar"
3. Selecionar pet "Rex"
4. Selecionar serviço "Banho"
5. Selecionar data "15/03/2026"
6. Clicar no horário "14:00"
7. Clicar em "Confirmar"

RESULTADO ESPERADO:
Agendamento confirmado com sucesso

RESULTADO ATUAL:
Mensagem de erro: "Horário indisponível"

AMBIENTE:
- App: iOS 18.2 / iPhone 15
- Versão do app: 1.0.3
- Backend: v1.0.2

ANEXOS:
[print do erro]
[log do console se aplicável]

NOTAS ADICIONAIS:
O horário aparece disponível na lista, mas quando clica dá erro.
Pode ser problema de sincronização entre frontend e backend.
```

### **Ferramentas para Reportar Bugs**
- **GitHub Issues** (recomendado)
- **Jira**
- **Trello**
- **Google Sheets** (simples)

---

## 📊 MATRIZ DE PRIORIDADE DE BUGS

| Prioridade | Descrição | Exemplo | Ação | Tempo para Corrigir |
|:---|:---|:---|:---|:---|
| 🔴 **CRÍTICO** | Impede uso do sistema | App fecha ao abrir | Corrigir IMEDIATAMENTE | < 4 horas |
| 🟡 **ALTO** | Funcionalidade principal quebrada | Não consegue agendar | Corrigir antes do lançamento | < 24 horas |
| 🟢 **MÉDIO** | Funcionalidade secundária com problema | Filtro não funciona | Corrigir na próxima versão | < 1 semana |
| ⚪ **BAIXO** | Problema estético | Botão desalinhado | Corrigir quando possível | < 1 mês |

### **Critérios de Priorização**

**🔴 CRÍTICO:**
- Sistema completamente inacessível
- Perda de dados
- Vulnerabilidade de segurança crítica
- Pagamentos não funcionam

**🟡 ALTO:**
- Funcionalidade core não funciona
- Muitos usuários afetados
- Impacto no negócio

**🟢 MÉDIO:**
- Funcionalidade secundária quebrada
- Poucos usuários afetados
- Workaround disponível

**⚪ BAIXO:**
- Problema visual
- Melhoria de UX
- Não afeta funcionalidade

---

## ✅ CHECKLIST FINAL DE QUALIDADE

### **Código e Testes**
```
☐ Todos os testes unitários passando (>80% cobertura)
☐ Testes de integração da API 100% ok
☐ Testes E2E das funcionalidades críticas passando
☐ Sem warnings no console
☐ Código revisado por pelo menos 1 pessoa
☐ Documentação de código atualizada
```

### **Funcionalidades**
```
☐ Fluxos críticos testados manualmente (checklist completo)
☐ Todas as regras de negócio implementadas e testadas
☐ Validações de formulário funcionando
☐ Mensagens de erro amigáveis (não mostra código feio)
☐ Tratamento de erros de rede implementado
☐ Loading states implementados
```

### **Dispositivos e Navegadores**
```
☐ Testado em pelo menos 3 dispositivos diferentes
☐ Testado em iOS (iPhone 12, 13, 14)
☐ Testado em Android (versões 11, 12, 13)
☐ Testado em Chrome (desktop e mobile)
☐ Testado em Safari (iOS e macOS)
☐ Testado em Firefox (opcional)
☐ Testado em diferentes tamanhos de tela
```

### **Performance**
```
☐ Performance aceitável (Lighthouse >80)
☐ Tempo de carregamento < 2s
☐ API responde < 500ms (p95)
☐ Imagens otimizadas
☐ Bundle size aceitável
☐ Testes de carga ok (100 usuários simultâneos)
```

### **Segurança**
```
☐ Testes de segurança ok
☐ Sem vulnerabilidades conhecidas
☐ Dados sensíveis protegidos
☐ HTTPS obrigatório em produção
☐ Tokens com expiração adequada
☐ Rate limiting implementado
```

### **Usabilidade**
```
☐ Feedback de usuários reais incorporado
☐ Testes de usabilidade realizados
☐ Acessibilidade básica verificada
☐ Navegação intuitiva
☐ Mensagens claras e objetivas
```

### **Documentação e Deploy**
```
☐ README atualizado
☐ Guia de instalação disponível
☐ Documentação da API disponível
☐ Todos os bugs conhecidos documentados
☐ Plano de rollback definido
☐ Monitoramento configurado
```

---

## 🛠️ FERRAMENTAS DE TESTE

### **Testes Unitários**
- **JavaScript/Node.js:** Jest, Mocha, Chai
- **Flutter/Dart:** test package (built-in)
- **React:** Jest + React Testing Library

### **Testes de Integração**
- **API:** Postman, Supertest, Newman
- **E2E:** Cypress, Playwright, Selenium

### **Testes de Performance**
- **API:** K6, JMeter, Artillery
- **Web:** Lighthouse, WebPageTest
- **Mobile:** Firebase Performance Monitoring

### **Testes de Segurança**
- OWASP ZAP
- Burp Suite
- Snyk
- npm audit / yarn audit

### **Gerenciamento de Bugs**
- GitHub Issues
- Jira
- Trello
- Google Sheets

---

## 📈 MÉTRICAS DE QUALIDADE

### **Cobertura de Testes**
- **Meta:** >80% de cobertura de código
- **Unitários:** >70%
- **Integração:** >50%
- **E2E:** Funcionalidades críticas

### **Bugs por Prioridade**
- **Críticos:** 0 antes do lançamento
- **Altos:** < 5 antes do lançamento
- **Médios/Baixos:** Documentados para próximas versões

### **Performance**
- **API Response Time:** < 500ms (p95)
- **Page Load Time:** < 2s
- **Lighthouse Score:** > 80

### **Disponibilidade**
- **Uptime:** > 99.5%
- **MTTR (Mean Time To Repair):** < 1 hora

---

## 🚀 PROCESSO DE RELEASE

### **Antes do Release**
1. ✅ Todos os testes passando
2. ✅ Checklist de qualidade completo
3. ✅ Bugs críticos corrigidos
4. ✅ Documentação atualizada
5. ✅ Aprovação do time

### **Durante o Release**
1. Deploy em produção
2. Smoke tests em produção
3. Monitoramento ativo
4. Rollback plan pronto

### **Após o Release**
1. Monitorar métricas
2. Coletar feedback
3. Documentar problemas
4. Planejar próximas correções

---

## 📚 REFERÊNCIAS

### **Documentos Relacionados**
- `BUSINESS_RULES.md` - Regras de negócio a serem testadas
- `USER_FLOWS.md` - Fluxos de usuário a serem testados
- `ARCHITECTURE_TECHNICAL.md` - Arquitetura técnica

### **Padrões e Boas Práticas**
- [Testing Best Practices](https://testingjavascript.com/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Google Testing Blog](https://testing.googleblog.com/)

---

**Última atualização:** 2026-02-20  
**Versão:** 5.0 (Estratégia de Testes Completa)

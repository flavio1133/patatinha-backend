# Módulo B - Assinaturas e Pagamentos

## Implementado

### Backend
- **Planos de assinatura** – 3 planos: Profissional (R$ 250), Empresarial (R$ 399), Enterprise (R$ 699)
- **Rotas** `/api/subscription-plans` (público), `/api/company-subscription/*` (auth empresa)
- **Middleware** `checkSubscription` – verifica trial/ativo
- **Checkout mock** – POST `/api/company-subscription/checkout` simula pagamento aprovado
- **Histórico de pagamentos** – em memória
- **Webhook** – POST `/api/payments/webhook` (estrutura pronta)
- **Jobs** – `src/jobs/subscriptionJobs.js` (executáveis via `runAll()`)

### Frontend
- **/assinatura** – página de planos
- **/assinatura/checkout** – checkout (cartão/PIX/boleto – mock)
- **/assinatura/sucesso** – confirmação
- **/company/assinatura** – gestão (status, histórico, cancelar, reativar)

### Fluxo
1. Empresa em trial → vê "Escolher plano" no dashboard
2. Escolhe plano → checkout → pagamento simulado → ativa
3. Pode cancelar e reativar em "Minha assinatura"

### Próximos passos (produção)
- Integrar Mercado Pago (SDK, webhook real)
- npm install node-cron e agendar jobs
- Migrar para PostgreSQL

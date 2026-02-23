/**
 * Webhook e rotas de pagamento
 * POST /api/payments/webhook - recebe notificações do Mercado Pago (mock)
 */
const express = require('express');
const router = express.Router();

// Webhook - responder 200 imediatamente
router.post('/webhook', (req, res) => {
  res.status(200).send('OK');
  const { type, data } = req.body || {};
  if (type && data) {
    console.log('[Webhook]', type, data);
    // Em produção: processar handleSubscriptionUpdate, handlePaymentUpdate
  }
});

module.exports = router;

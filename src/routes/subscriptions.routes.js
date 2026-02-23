const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');

// TODO: Implementar conexão com banco de dados
const subscriptionPlans = [];
const subscriptions = [];
let planIdCounter = 1;
let subscriptionIdCounter = 1;

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ========== PLANOS DE ASSINATURA ==========

// Listar planos
router.get('/plans', authenticateToken, (req, res) => {
  const { active } = req.query;
  let filteredPlans = [...subscriptionPlans];

  if (active === 'true') {
    filteredPlans = filteredPlans.filter(p => p.isActive);
  }

  res.json({ plans: filteredPlans });
});

// Criar plano
router.post('/plans', [
  authenticateToken,
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('monthlyPrice').isFloat({ min: 0.01 }).withMessage('Preço mensal deve ser maior que zero'),
  validate
], (req, res) => {
  const {
    name,
    description,
    monthlyPrice,
    services, // [{ type: 'banho', quantity: 4 }, { type: 'tosa', quantity: 1 }]
    productDiscount, // % de desconto em produtos
    contractMonths, // 0 = mensal, 12 = anual, etc.
    benefits, // Array de benefícios adicionais
    isActive = true,
  } = req.body;

  const newPlan = {
    id: planIdCounter++,
    name,
    description: description || null,
    monthlyPrice: parseFloat(monthlyPrice),
    services: services || [],
    productDiscount: productDiscount || 0,
    contractMonths: contractMonths || 0, // 0 = mensal
    benefits: benefits || [],
    isActive,
    createdAt: new Date(),
  };

  subscriptionPlans.push(newPlan);
  res.status(201).json({
    message: 'Plano criado com sucesso',
    plan: newPlan,
  });
});

// ========== ASSINATURAS ==========

// Listar assinaturas
router.get('/', authenticateToken, (req, res) => {
  const { customerId, status, active } = req.query;
  let filteredSubscriptions = [...subscriptions];

  if (customerId) {
    filteredSubscriptions = filteredSubscriptions.filter(
      s => s.customerId === parseInt(customerId)
    );
  }

  if (status) {
    filteredSubscriptions = filteredSubscriptions.filter(s => s.status === status);
  }

  if (active === 'true') {
    filteredSubscriptions = filteredSubscriptions.filter(s => s.status === 'active');
  }

  res.json({ subscriptions: filteredSubscriptions });
});

// Criar assinatura
router.post('/', [
  authenticateToken,
  body('customerId').isInt().withMessage('ID do cliente é obrigatório'),
  body('planId').isInt().withMessage('ID do plano é obrigatório'),
  body('paymentMethod').isIn(['credit_card', 'pix_recurring', 'bank_debit']),
  validate
], (req, res) => {
  const {
    customerId,
    planId,
    paymentMethod,
    creditCardToken, // Token do cartão (se aplicável)
    startDate,
  } = req.body;

  const plan = subscriptionPlans.find(p => p.id === parseInt(planId));
  if (!plan) {
    return res.status(404).json({ error: 'Plano não encontrado' });
  }

  const start = startDate ? new Date(startDate) : new Date();
  const nextBillingDate = new Date(start);
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  // Inicializar saldo de serviços
  const serviceBalance = {};
  plan.services.forEach(service => {
    serviceBalance[service.type] = service.quantity;
  });

  const newSubscription = {
    id: subscriptionIdCounter++,
    customerId: parseInt(customerId),
    planId: parseInt(planId),
    planName: plan.name,
    monthlyPrice: plan.monthlyPrice,
    paymentMethod,
    creditCardToken: creditCardToken || null,
    status: 'active',
    startDate: start.toISOString().split('T')[0],
    nextBillingDate: nextBillingDate.toISOString().split('T')[0],
    serviceBalance, // Saldo de serviços do mês atual
    totalPaid: 0,
    createdAt: new Date(),
  };

  subscriptions.push(newSubscription);

  // TODO: Processar primeira cobrança
  // TODO: Criar transação de receita recorrente

  res.status(201).json({
    message: 'Assinatura criada com sucesso',
    subscription: newSubscription,
  });
});

// Usar serviço do plano
router.post('/:id/use-service', [
  authenticateToken,
  body('serviceType').isIn(['banho', 'tosa', 'banho_tosa', 'veterinario']),
  validate
], (req, res) => {
  const { serviceType } = req.body;
  const subscription = subscriptions.find(s => s.id === parseInt(req.params.id));

  if (!subscription) {
    return res.status(404).json({ error: 'Assinatura não encontrada' });
  }

  if (subscription.status !== 'active') {
    return res.status(400).json({ error: 'Assinatura não está ativa' });
  }

  // Verificar se tem saldo
  const balance = subscription.serviceBalance[serviceType] || 0;
  if (balance <= 0) {
    return res.status(400).json({
      error: 'Saldo de serviço esgotado',
      serviceType,
      balance: 0,
    });
  }

  // Deduzir do saldo
  subscription.serviceBalance[serviceType] = balance - 1;

  res.json({
    message: 'Serviço utilizado com sucesso',
    subscription,
    remainingBalance: subscription.serviceBalance[serviceType],
  });
});

// Processar cobrança mensal (chamado por job agendado)
router.post('/process-billing', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const dueSubscriptions = subscriptions.filter(
    s => s.status === 'active' && s.nextBillingDate === today
  );

  const results = [];
  const transactions = require('./cashflow.routes').transactions;

  dueSubscriptions.forEach(subscription => {
    // TODO: Processar cobrança real via gateway
    // Por enquanto, simular sucesso
    const paymentSuccess = true; // Simulado

    if (paymentSuccess) {
      // Criar transação de receita
      transactions.push({
        id: transactions.length + 1,
        type: 'income',
        amount: subscription.monthlyPrice,
        category: 'subscription_revenue',
        description: `Assinatura ${subscription.planName} - ${subscription.customerId}`,
        date: today,
        paymentMethod: subscription.paymentMethod,
        reconciled: false,
        relatedSubscriptionId: subscription.id,
        createdAt: new Date(),
      });

      // Atualizar assinatura
      const nextBilling = new Date(subscription.nextBillingDate);
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      subscription.nextBillingDate = nextBilling.toISOString().split('T')[0];
      subscription.totalPaid += subscription.monthlyPrice;

      // Resetar saldo de serviços
      const plan = subscriptionPlans.find(p => p.id === subscription.planId);
      if (plan) {
        subscription.serviceBalance = {};
        plan.services.forEach(service => {
          subscription.serviceBalance[service.type] = service.quantity;
        });
      }

      results.push({
        subscriptionId: subscription.id,
        status: 'success',
        amount: subscription.monthlyPrice,
      });
    } else {
      // Falha no pagamento
      subscription.status = 'payment_failed';
      results.push({
        subscriptionId: subscription.id,
        status: 'failed',
        error: 'Pagamento recusado',
      });
    }
  });

  res.json({
    message: 'Cobranças processadas',
    processed: results.length,
    results,
  });
});

// Relatório de receita recorrente (MRR)
router.get('/reports/mrr', authenticateToken, (req, res) => {
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const mrr = activeSubscriptions.reduce((sum, s) => sum + s.monthlyPrice, 0);
  const arr = mrr * 12; // Annual Recurring Revenue

  // Taxa de cancelamento (churn)
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const cancelledLastMonth = subscriptions.filter(
    s => s.status === 'cancelled' && new Date(s.cancelledAt) >= last30Days
  ).length;
  const churnRate = activeSubscriptions.length > 0
    ? (cancelledLastMonth / activeSubscriptions.length) * 100
    : 0;

  res.json({
    activeSubscriptions: activeSubscriptions.length,
    mrr, // Monthly Recurring Revenue
    arr, // Annual Recurring Revenue
    churnRate: churnRate.toFixed(2),
    averageSubscriptionValue: activeSubscriptions.length > 0
      ? mrr / activeSubscriptions.length
      : 0,
  });
});

// Cancelar assinatura
router.post('/:id/cancel', authenticateToken, (req, res) => {
  const { reason } = req.body;
  const subscription = subscriptions.find(s => s.id === parseInt(req.params.id));

  if (!subscription) {
    return res.status(404).json({ error: 'Assinatura não encontrada' });
  }

  subscription.status = 'cancelled';
  subscription.cancelledAt = new Date();
  subscription.cancellationReason = reason || null;

  res.json({
    message: 'Assinatura cancelada',
    subscription,
  });
});

module.exports = router;
module.exports.subscriptionPlans = subscriptionPlans;
module.exports.subscriptions = subscriptions;

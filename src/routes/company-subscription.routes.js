/**
 * Rotas de assinatura da empresa (plano que a pet shop paga para usar a plataforma)
 * Requer authCompany
 */
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { subscriptionPlans } = require('./subscription-plans.routes');
const { companies } = require('./companies.routes');
const { checkSubscription } = require('../middleware/subscription.middleware');

const JWT_SECRET = process.env.JWT_SECRET || 'patatinha-secret-key-change-in-production';

// Dados em memória
const paymentHistory = [];
let paymentIdCounter = 1;

// Middleware authCompany (reutilizar da companies)
function authCompany(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'company') return res.status(403).json({ error: 'Acesso negado' });
    req.companyId = decoded.companyId || decoded.id;
    req.isCompanyOwner = decoded.role === 'owner' || !decoded.companyId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function requireOwner(req, res, next) {
  if (!req.isCompanyOwner) return res.status(403).json({ error: 'Apenas o gestor pode gerenciar assinatura' });
  next();
}

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// GET /api/company-subscription/current - Assinatura atual
router.get('/current', authCompany, (req, res) => {
  const company = companies.find((c) => c.id === req.companyId);
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

  const plan = company.subscription_plan_id
    ? subscriptionPlans.find((p) => p.id === company.subscription_plan_id)
    : null;

  let nextBilling = null;
  if (company.subscription_status === 'active' && plan) {
    const lastPayment = paymentHistory
      .filter((p) => p.company_id === req.companyId && p.status === 'approved')
      .sort((a, b) => new Date(b.paid_at) - new Date(a.paid_at))[0];
    if (lastPayment) {
      const next = new Date(lastPayment.paid_at || lastPayment.created_at);
      next.setMonth(next.getMonth() + 1);
      nextBilling = next.toISOString().split('T')[0];
    }
  }

  const trialEnd = company.trial_end ? new Date(company.trial_end) : null;
  const now = new Date();
  const daysLeft = trialEnd && trialEnd > now ? Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)) : 0;

  res.json({
    company_id: company.id,
    subscription_status: company.subscription_status,
    subscription_plan_id: company.subscription_plan_id,
    plan: plan || null,
    trial_start: company.trial_start,
    trial_end: company.trial_end,
    trial_days_left: company.subscription_status === 'trial' ? daysLeft : 0,
    next_billing: nextBilling,
    payment_customer_id: company.payment_customer_id,
  });
});

// GET /api/company-subscription/history - Histórico de pagamentos
router.get('/history', authCompany, (req, res) => {
  const list = paymentHistory.filter((p) => p.company_id === req.companyId);
  res.json({ payments: list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) });
});

// GET /api/company-subscription/next-payment - Próxima cobrança
router.get('/next-payment', authCompany, (req, res) => {
  const company = companies.find((c) => c.id === req.companyId);
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

  if (company.subscription_status === 'trial') {
    return res.json({
      type: 'trial',
      date: company.trial_end,
      message: 'Primeira cobrança após o período de teste',
    });
  }

  const last = paymentHistory
    .filter((p) => p.company_id === req.companyId && p.status === 'approved')
    .sort((a, b) => new Date(b.paid_at || b.created_at) - new Date(a.paid_at || a.created_at))[0];
  if (!last) return res.json({ next_payment: null });

  const next = new Date(last.paid_at || last.created_at);
  next.setMonth(next.getMonth() + 1);
  res.json({
    type: 'subscription',
    date: next.toISOString().split('T')[0],
    amount: last.amount,
  });
});

// POST /api/company-subscription/checkout - Simular/processar checkout (mock)
router.post('/checkout', authCompany, requireOwner, [
  body('plan_id').notEmpty().withMessage('Plano é obrigatório'),
  body('payment_method').optional().isIn(['credit_card', 'pix', 'boleto']),
], validate, (req, res) => {
  const { plan_id } = req.body;
  const plan = subscriptionPlans.find((p) => p.id === plan_id);
  if (!plan || !plan.active) return res.status(404).json({ error: 'Plano não encontrado' });

  const company = companies.find((c) => c.id === req.companyId);
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

  // Mock: criar pagamento simulado (em produção, integrar com Mercado Pago)
  const payment = {
    id: `pay_${paymentIdCounter++}`,
    company_id: req.companyId,
    amount: plan.price,
    status: 'approved',
    payment_method: req.body.payment_method || 'credit_card',
    external_id: `mock_${Date.now()}`,
    paid_at: new Date(),
    due_date: new Date().toISOString().split('T')[0],
    plan_id: plan.id,
    plan_name: plan.name,
    created_at: new Date(),
  };
  paymentHistory.push(payment);

  // Atualizar empresa
  const idx = companies.findIndex((c) => c.id === req.companyId);
  companies[idx].subscription_status = 'active';
  companies[idx].subscription_plan_id = plan.id;
  companies[idx].updated_at = new Date();

  res.status(201).json({
    message: 'Assinatura ativada com sucesso!',
    payment,
    subscription: {
      status: 'active',
      plan: plan,
      trial_days: 15,
    },
  });
});

// POST /api/company-subscription/cancel
router.post('/cancel', authCompany, requireOwner, (req, res) => {
  const idx = companies.findIndex((c) => c.id === req.companyId);
  if (idx === -1) return res.status(404).json({ error: 'Empresa não encontrada' });
  companies[idx].subscription_status = 'canceled';
  companies[idx].updated_at = new Date();
  res.json({ message: 'Assinatura cancelada' });
});

// POST /api/company-subscription/reactivate
router.post('/reactivate', authCompany, requireOwner, (req, res) => {
  const idx = companies.findIndex((c) => c.id === req.companyId);
  if (idx === -1) return res.status(404).json({ error: 'Empresa não encontrada' });
  if (companies[idx].subscription_status !== 'canceled') {
    return res.status(400).json({ error: 'Apenas assinaturas canceladas podem ser reativadas' });
  }
  companies[idx].subscription_status = 'active';
  companies[idx].updated_at = new Date();
  res.json({ message: 'Assinatura reativada' });
});

module.exports = router;
module.exports.paymentHistory = paymentHistory;

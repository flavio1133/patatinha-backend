const express = require('express');
const router = express.Router();

// Planos de assinatura da plataforma (que as empresas pagam)
// Dados em memória - seed no carregamento
const subscriptionPlans = [
  {
    id: 'plan_1',
    name: 'Plano Profissional',
    description: 'Ideal para pet shops em crescimento',
    price: 250.0,
    billing_cycle: 'monthly',
    features: {
      services: 'ilimitado',
      clients: 'ilimitado',
      employees: 5,
      reports: true,
      whatsapp: false,
      api: false,
    },
    max_clients: 0,
    max_employees: 5,
    has_whatsapp_integration: false,
    has_reports: true,
    has_api_access: false,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'plan_2',
    name: 'Plano Empresarial',
    description: 'Para pet shops em expansão',
    price: 399.0,
    billing_cycle: 'monthly',
    features: {
      services: 'ilimitado',
      clients: 'ilimitado',
      employees: 15,
      reports: true,
      whatsapp: true,
      api: false,
    },
    max_clients: 0,
    max_employees: 15,
    has_whatsapp_integration: true,
    has_reports: true,
    has_api_access: false,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 'plan_3',
    name: 'Plano Enterprise',
    description: 'Solução completa para redes',
    price: 699.0,
    billing_cycle: 'monthly',
    features: {
      services: 'ilimitado',
      clients: 'ilimitado',
      employees: 999,
      reports: true,
      whatsapp: true,
      api: true,
    },
    max_clients: 0,
    max_employees: 999,
    has_whatsapp_integration: true,
    has_reports: true,
    has_api_access: true,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
];

// Listar planos ativos (público - para página de assinatura)
router.get('/', (req, res) => {
  const active = req.query.active !== 'false';
  const plans = active ? subscriptionPlans.filter((p) => p.active) : subscriptionPlans;
  res.json({ plans });
});

// Obter plano por ID
router.get('/:id', (req, res) => {
  const plan = subscriptionPlans.find((p) => p.id === req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plano não encontrado' });
  res.json(plan);
});

module.exports = router;
module.exports.subscriptionPlans = subscriptionPlans;

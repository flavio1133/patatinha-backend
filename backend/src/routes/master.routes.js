/**
 * Rotas do Painel Master (Super Admin) - Gestão SaaS multi-tenant.
 * Apenas role super_admin. Usa auth_token (não company_token).
 */
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { companies, companySettings } = require('./companies.routes');
const { users } = require('./auth.routes');
const { subscriptionPlans } = require('./subscription-plans.routes');
const { paymentHistory } = require('./company-subscription.routes');
const { logAudit } = require('../services/audit.service');

const JWT_SECRET = process.env.JWT_SECRET || 'patatinha-secret-key-change-in-production';

// Só aceita token de usuário (auth), não de empresa
function requireAuthUser(req, res, next) {
  if (req.user?.type === 'company') {
    return res.status(403).json({ error: 'Use o login de gestão (Super Admin) para acessar o painel master' });
  }
  next();
}

router.use(authenticateToken, requireAuthUser, requireRole('super_admin'));

// Helper de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/master/dashboard - Métricas globais da plataforma
router.get('/dashboard', (req, res) => {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const active = companies.filter((c) => ['active', 'trial'].includes(c.subscription_status || 'trial') && c.subscription_status !== 'blocked');
  const delinquent = companies.filter((c) => ['past_due', 'blocked'].includes(c.subscription_status));
  const inactive = companies.filter((c) => c.subscription_status === 'canceled');
  const newThisMonth = companies.filter((c) => {
    const created = c.created_at ? new Date(c.created_at) : null;
    return created && created >= thisMonthStart;
  });

  // MRR simplificado: considerar planos ativos (valor fixo por plano por enquanto)
  let mrr = 0;
  companies.forEach((c) => {
    if (c.subscription_status === 'active' && c.subscription_plan_id) {
      const plan = subscriptionPlans.find((p) => p.id === c.subscription_plan_id);
      if (plan && plan.monthlyPrice) mrr += plan.monthlyPrice;
    }
  });

  res.json({
    totalStores: companies.length,
    activeStores: active.length,
    newStoresThisMonth: newThisMonth.length,
    delinquentStores: delinquent.length,
    mrr,
    inactiveStores: inactive.length,
  });
});

// GET /api/master/companies - Lista todas as lojas (tenants)
router.get('/companies', (req, res) => {
  const list = companies.map((c) => {
    const { password_hash, payment_method, ...safe } = c;
    return {
      ...safe,
      trial_end: c.trial_end,
      subscription_status: c.subscription_status || 'trial',
      subscription_plan_id: c.subscription_plan_id,
    };
  });
  res.json({ companies: list });
});

// GET /api/master/companies/:id - Detalhe de uma loja
router.get('/companies/:id', (req, res) => {
  const company = companies.find((c) => c.id === req.params.id);
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });
  const settings = companySettings.find((s) => s.company_id === company.id);
  const { password_hash, payment_method, ...safe } = company;
  res.json({ ...safe, settings: settings || {} });
});

// POST /api/master/impersonate - Gera token de empresa para "Acessar como Loja"
router.post('/impersonate', (req, res) => {
  const { companyId } = req.body || {};
  if (!companyId) return res.status(400).json({ error: 'companyId é obrigatório' });
  const company = companies.find((c) => c.id === companyId);
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

  const token = jwt.sign(
    { id: company.id, companyId: company.id, type: 'company', role: 'owner' },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  const { password_hash, payment_method, ...companySafe } = company;
  res.json({
    token,
    company: companySafe,
    role: 'owner',
    impersonating: true,
  });
});

// PATCH /api/master/companies/:id - Ações sobre a loja (renovar teste, bloquear, etc.)
router.patch('/companies/:id', (req, res) => {
  const idx = companies.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Empresa não encontrada' });

  const { trial_days_add, subscription_status: newStatus } = req.body || {};

  if (trial_days_add != null && typeof trial_days_add === 'number' && trial_days_add > 0) {
    const c = companies[idx];
    const base = c.trial_end && new Date(c.trial_end) > new Date() ? new Date(c.trial_end) : new Date();
    base.setDate(base.getDate() + trial_days_add);
    c.trial_end = base;
    c.updated_at = new Date();
  }

  if (newStatus && ['active', 'trial', 'canceled', 'past_due', 'blocked'].includes(newStatus)) {
    companies[idx].subscription_status = newStatus;
    companies[idx].updated_at = new Date();
  }

  const { password_hash, payment_method, ...safe } = companies[idx];
  res.json({ message: 'Empresa atualizada', company: safe });
});

// PATCH /api/master/companies/:id/modules - Atualizar módulos (feature toggles) da loja
router.patch('/companies/:id/modules', (req, res) => {
  const companyId = req.params.id;
  const company = companies.find((c) => c.id === companyId);
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });

  let settings = companySettings.find((s) => s.company_id === companyId);
  if (!settings) {
    settings = {
      id: `settings_${companyId}`,
      company_id: companyId,
      opening_hours: {},
      services_offered: ['banho', 'tosa', 'banho_tosa', 'veterinario', 'vacina'],
      enabled_modules: {
        pdv: true,
        finance: true,
        inventory: true,
        reports: true,
      },
      employees: [],
      created_at: new Date(),
      updated_at: new Date(),
    };
    companySettings.push(settings);
  }

  const modules = req.body?.modules;
  if (!modules || typeof modules !== 'object') {
    return res.status(400).json({ error: 'Payload inválido: modules é obrigatório' });
  }

  settings.enabled_modules = {
    ...(settings.enabled_modules || {}),
    ...modules,
  };
  settings.updated_at = new Date();

  res.json({
    message: 'Módulos atualizados com sucesso',
    enabled_modules: settings.enabled_modules,
  });
});

// PATCH /api/master/companies/:id/owner - Editar dados cadastrais do gestor (nome, e-mail, telefone)
router.patch('/companies/:id/owner', (req, res) => {
  const idx = companies.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Empresa não encontrada' });

  const company = companies[idx];
  const { name, email, phone, confirm_name, reason } = req.body || {};

  if ((email && email !== company.email) || (name && name !== company.name)) {
    if (!confirm_name || confirm_name.trim().toLowerCase() !== company.name.trim().toLowerCase()) {
      return res.status(400).json({ error: 'Confirmação inválida. Digite corretamente o nome da empresa.' });
    }
  }

  const oldSnapshot = { name: company.name, email: company.email, phone: company.phone };

  if (name !== undefined) company.name = name;
  if (phone !== undefined) company.phone = phone;
  if (email !== undefined && email !== company.email) {
    const emailLower = email.trim().toLowerCase();
    if (companies.some((c) => c.id !== company.id && c.email.toLowerCase() === emailLower)) {
      return res.status(400).json({ error: 'E-mail já cadastrado para outra empresa' });
    }
    company.email = emailLower;
  }
  company.updated_at = new Date();

  logAudit({
    userId: req.user.userId || req.user.id,
    userName: req.user.name || req.user.email || 'Super Admin',
    userRole: req.user.role || 'super_admin',
    action: 'update',
    entity: 'company_owner',
    entityId: company.id,
    oldValue: oldSnapshot,
    newValue: { name: company.name, email: company.email, phone: company.phone },
    reason: reason || 'Edição de dados do gestor pela administração',
  });

  const { password_hash, payment_method, ...safe } = company;
  res.json({ message: 'Dados do gestor atualizados', company: safe });
});

// POST /api/master/companies/:id/owner/reset-password - Reset forçado de senha do gestor
router.post('/companies/:id/owner/reset-password', async (req, res) => {
  const idx = companies.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Empresa não encontrada' });

  const company = companies[idx];
  const { confirm_name, tempPassword } = req.body || {};

  if (!confirm_name || confirm_name.trim().toLowerCase() !== company.name.trim().toLowerCase()) {
    return res.status(400).json({ error: 'Confirmação inválida. Digite corretamente o nome da empresa.' });
  }

  const plain = tempPassword || '123456';
  const bcryptLib = require('bcryptjs');
  const hash = await bcryptLib.hash(plain, 10);
  const oldSnapshot = { email: company.email };

  company.password_hash = hash;
  company.updated_at = new Date();

  logAudit({
    userId: req.user.userId || req.user.id,
    userName: req.user.name || req.user.email || 'Super Admin',
    userRole: req.user.role || 'super_admin',
    action: 'update',
    entity: 'company_owner',
    entityId: company.id,
    oldValue: oldSnapshot,
    newValue: { email: company.email, password_reset: true },
    reason: 'Reset de senha do gestor pela administração',
  });

  res.json({
    message: 'Senha do gestor redefinida com sucesso. Entregue a senha temporária ao cliente.',
    temporary_password: plain,
  });
});

// PATCH /api/master/companies/:id/owner/status - Suspender / reativar gestor
router.patch('/companies/:id/owner/status', (req, res) => {
  const idx = companies.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Empresa não encontrada' });

  const company = companies[idx];
  const { is_active, confirm_name, reason } = req.body || {};

  if (!confirm_name || confirm_name.trim().toLowerCase() !== company.name.trim().toLowerCase()) {
    return res.status(400).json({ error: 'Confirmação inválida. Digite corretamente o nome da empresa.' });
  }

  const oldStatus = company.owner_is_active !== false;
  const newStatus = is_active !== false;
  company.owner_is_active = newStatus;
  company.updated_at = new Date();

  logAudit({
    userId: req.user.userId || req.user.id,
    userName: req.user.name || req.user.email || 'Super Admin',
    userRole: req.user.role || 'super_admin',
    action: newStatus ? 'reactivate' : 'deactivate',
    entity: 'company_owner',
    entityId: company.id,
    oldValue: { owner_is_active: oldStatus },
    newValue: { owner_is_active: newStatus },
    reason: reason || (newStatus ? 'Reativação de gestor' : 'Suspensão de gestor'),
  });

  const { password_hash, payment_method, ...safe } = company;
  res.json({ message: 'Status do gestor atualizado', company: safe });
});

// POST /api/master/companies/:id/manual-payment - Registrar pagamento / renovar manualmente
router.post('/companies/:id/manual-payment', (req, res) => {
  const idx = companies.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Empresa não encontrada' });

  const body = req.body || {};
  const planId = body.plan_id || companies[idx].subscription_plan_id;
  const plans = subscriptionPlans || [];
  const plan = plans.find((p) => p.id === planId) || plans.find((p) => p.active);
  if (!plan) {
    return res.status(400).json({ error: 'Plano inválido para registrar pagamento' });
  }

  const now = new Date();
  const payment = {
    id: `manual_${Date.now()}`,
    company_id: companies[idx].id,
    amount: plan.price,
    status: 'approved',
    payment_method: body.payment_method || 'manual',
    external_id: `manual_${Date.now()}`,
    paid_at: now,
    due_date: now.toISOString().split('T')[0],
    plan_id: plan.id,
    plan_name: plan.name,
    created_at: now,
  };
  if (Array.isArray(paymentHistory)) {
    paymentHistory.push(payment);
  }

  companies[idx].subscription_status = 'active';
  companies[idx].subscription_plan_id = plan.id;
  companies[idx].updated_at = now;

  const { password_hash, payment_method, ...safe } = companies[idx];
  res.json({ message: 'Pagamento registrado e assinatura ativada', company: safe, payment });
});

// --- Equipe Master (SaaS Staff) ---
// GET /api/master/staff - lista de usuários internos (não clientes)
router.get('/staff', (req, res) => {
  const staff = users
    .filter((u) => u.role && u.role !== 'customer')
    .map(({ password, ...safe }) => ({
      ...safe,
      isActive: safe.isActive !== false,
    }));
  res.json({ staff });
});

// POST /api/master/staff - criar funcionário da Equipe Master
router.post(
  '/staff',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
    body('role')
      .isIn(['master', 'manager', 'employee', 'financial'])
      .withMessage('Papel inválido para Staff Master'),
  ],
  validate,
  async (req, res) => {
    const { name, email, password, role } = req.body;
    const emailLower = email.trim().toLowerCase();
    const existing = users.find((u) => u.email && u.email.toLowerCase() === emailLower);
    if (existing) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const hashedPassword = await require('bcryptjs').hash(password, 10);
    const user = {
      id: users.length + 1,
      name,
      email: emailLower,
      password: hashedPassword,
      role,
      isActive: true,
      createdAt: new Date(),
    };
    users.push(user);
    const { password: _p, ...safe } = user;
    res.status(201).json({ message: 'Membro da equipe criado', user: safe });
  }
);

// PUT /api/master/staff/:id - atualizar nome, telefone ou role
router.put(
  '/staff/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
    body('phone').optional().trim(),
    body('role')
      .optional()
      .isIn(['master', 'manager', 'employee', 'financial', 'customer'])
      .withMessage('Papel inválido'),
    body('isActive').optional().isBoolean(),
  ],
  validate,
  (req, res) => {
    const id = parseInt(req.params.id, 10);
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Usuário não encontrado' });

    const user = users[idx];
    const { name, phone, role, isActive } = req.body;

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone || null;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    user.updatedAt = new Date();

    const { password: _p, ...safe } = user;
    res.json({ message: 'Usuário atualizado', user: safe });
  }
);

// DELETE /api/master/staff/:id - desativar usuário (soft delete)
router.delete('/staff/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Usuário não encontrado' });

  users[idx].isActive = false;
  users[idx].updatedAt = new Date();
  res.json({ message: 'Usuário desativado' });
});

module.exports = router;

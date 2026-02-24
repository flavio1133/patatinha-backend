/**
 * Middleware para verificar status da assinatura da empresa
 * Usar em rotas protegidas que exigem empresa com trial ativo ou assinatura paga
 */

function getCompanies() {
  const { companies } = require('../routes/companies.routes');
  return companies;
}

async function checkSubscription(req, res, next) {
  const companyId = req.companyId;
  // Se não houver companyId, não é um contexto de empresa (ex.: Super Admin) – deixa passar
  if (!companyId) {
    return next();
  }

  const companies = getCompanies();
  const company = companies.find((c) => c.id === companyId);

  if (!company) {
    return res.status(404).json({ error: 'Empresa não encontrada' });
  }

  const now = new Date();

  // Caso 1: Em período de trial
  if (company.subscription_status === 'trial' && company.trial_end) {
    const trialEnd = new Date(company.trial_end);
    if (trialEnd > now) {
      const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
      req.subscription = { status: 'trial', daysLeft };
      return next();
    }
  }

  // Caso 2: Trial expirado e não ativo
  if (company.subscription_status === 'trial' || company.subscription_status === 'expired') {
    const trialEnd = company.trial_end ? new Date(company.trial_end) : null;
    if (!trialEnd || trialEnd <= now) {
      return res.status(402).json({
        error: 'Assinatura expirada',
        code: 'SUBSCRIPTION_EXPIRED',
        message: 'Seu período de teste expirou. Faça o pagamento para continuar usando o sistema.',
        trial_end: company.trial_end,
      });
    }
  }

  // Caso 3: Assinatura ativa
  if (company.subscription_status === 'active') {
    req.subscription = { status: 'active' };
    return next();
  }

  // Caso 4: Outros status (past_due, pending)
  if (['past_due', 'pending'].includes(company.subscription_status)) {
    return res.status(402).json({
      error: 'Assinatura irregular',
      code: 'SUBSCRIPTION_INACTIVE',
      message: 'Sua assinatura está pendente ou inadimplente. Regularize o pagamento para continuar.',
      subscription_status: company.subscription_status,
    });
  }

  if (company.subscription_status === 'canceled') {
    return res.status(402).json({
      error: 'Assinatura cancelada',
      code: 'SUBSCRIPTION_CANCELED',
      message: 'Sua assinatura foi cancelada. Reative para continuar.',
    });
  }

  // Caso 5: Bloqueado manualmente (Kill Switch)
  if (company.subscription_status === 'blocked') {
    return res.status(402).json({
      error: 'Acesso bloqueado pela administração',
      code: 'SUBSCRIPTION_BLOCKED',
      message: 'Entre em contato com o suporte para regularizar sua assinatura.',
    });
  }

  return res.status(402).json({
    error: 'Assinatura inválida',
    code: 'SUBSCRIPTION_INACTIVE',
  });
}

module.exports = { checkSubscription };

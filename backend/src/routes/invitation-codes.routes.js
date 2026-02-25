/**
 * Rotas de códigos de convite e vinculação cliente-empresa
 */
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { generateUniqueInvitationCode } = require('../utils/codeGenerator');

const JWT_SECRET = process.env.JWT_SECRET || 'patatinha-secret-key-change-in-production';

const { invitationCodes, clientCompanies, nextLinkId } = require('../data/invitation-codes.data');

// Helpers
function getCompanies() {
  const { companies } = require('./companies.routes');
  return companies;
}

function getCompanySettings() {
  const { companySettings } = require('./companies.routes');
  return companySettings;
}

function authClient(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'customer' && decoded.role !== 'client') return res.status(403).json({ error: 'Acesso negado' });
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

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

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// POST /api/validate-invitation-code - Validar código (cliente pode não estar logado)
router.post('/validate-invitation-code', [
  body('code').trim().notEmpty().withMessage('Código não fornecido'),
], validate, (req, res) => {
  const code = req.body.code.trim().toUpperCase();
  const invitation = invitationCodes.find((c) => c.code.toUpperCase() === code);

  if (!invitation) {
    return res.status(404).json({ valid: false, error: 'Código inválido' });
  }

  if (invitation.status !== 'available') {
    return res.status(400).json({
      valid: false,
      error: invitation.status === 'used' ? 'Código já utilizado' : 'Código expirado',
    });
  }

  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    invitation.status = 'expired';
    return res.status(400).json({ valid: false, error: 'Código expirado' });
  }

  const companies = getCompanies();
  const company = companies.find((c) => c.id === invitation.company_id);
  if (!company) return res.status(404).json({ valid: false, error: 'Empresa não encontrada' });

  res.json({
    valid: true,
    company: {
      id: company.id,
      name: company.name,
      logo_url: company.logo_url,
      phone: company.phone,
      whatsapp: company.whatsapp,
    },
    invitation: { id: invitation.id, code: invitation.code },
  });
});

// GET /api/linked-companies - Listar Pet Shops vinculados ao cliente (requer auth cliente)
router.get('/linked-companies', authClient, (req, res) => {
  const clientId = req.userId;
  const companies = getCompanies();
  const links = clientCompanies.filter(
    (l) => String(l.client_id) === String(clientId) && l.is_active
  );
  const list = links.map((l) => {
    const company = companies.find((c) => c.id === l.company_id);
    if (!company) return null;
    return {
      id: company.id,
      name: company.name,
      logo_url: company.logo_url,
      phone: company.phone,
      whatsapp: company.whatsapp,
    };
  }).filter(Boolean);
  res.json({ companies: list });
});

// POST /api/link-client-to-company - Vincular cliente à empresa (requer auth cliente)
router.post('/link-client-to-company', authClient, [
  body('invitationId').notEmpty().withMessage('ID do convite é obrigatório'),
], validate, (req, res) => {
  const { invitationId } = req.body;
  const clientId = req.userId;

  const invitation = invitationCodes.find((c) => String(c.id) === String(invitationId));
  if (!invitation) return res.status(404).json({ error: 'Convite não encontrado' });

  if (invitation.status !== 'available') {
    return res.status(400).json({ error: 'Convite não está mais disponível' });
  }

  const existing = clientCompanies.find(
    (l) => String(l.client_id) === String(clientId) && l.company_id === invitation.company_id && l.is_active
  );
  if (existing) return res.status(400).json({ error: 'Cliente já vinculado a esta empresa' });

  // Marcar código como usado
  invitation.status = 'used';
  invitation.client_id = clientId;
  invitation.used_at = new Date();

  // Vincular cliente à empresa
  clientCompanies.push({
    id: nextLinkId(),
    client_id: clientId,
    company_id: invitation.company_id,
    linked_at: new Date(),
    linked_by: 'invitation',
    is_active: true,
  });

  res.json({ success: true, message: 'Cliente vinculado com sucesso', company_id: invitation.company_id });
});

module.exports = router;
module.exports.invitationCodes = invitationCodes;
module.exports.clientCompanies = clientCompanies;

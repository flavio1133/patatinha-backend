const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');

// TODO: Implementar conexão com banco de dados
const commissionRules = [];
const commissionRecords = [];
let ruleIdCounter = 1;
let recordIdCounter = 1;

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar regras de comissão
router.get('/rules', authenticateToken, (req, res) => {
  const { professionalId } = req.query;
  let filteredRules = [...commissionRules];

  if (professionalId) {
    filteredRules = filteredRules.filter(r => r.professionalId === parseInt(professionalId));
  }

  res.json({ rules: filteredRules });
});

// Criar regra de comissão
router.post('/rules', [
  authenticateToken,
  body('professionalId').isInt().withMessage('ID do profissional é obrigatório'),
  body('type').isIn(['percentage_service', 'fixed_service', 'percentage_product', 'mixed']),
  validate
], (req, res) => {
  const {
    professionalId,
    type,
    servicePercentage, // % sobre serviço
    serviceFixedAmount, // Valor fixo por serviço
    productPercentage, // % sobre produtos vendidos
    minAmount, // Valor mínimo de comissão
    maxAmount, // Valor máximo de comissão
    isActive = true,
  } = req.body;

  const newRule = {
    id: ruleIdCounter++,
    professionalId: parseInt(professionalId),
    type,
    servicePercentage: servicePercentage ? parseFloat(servicePercentage) : null,
    serviceFixedAmount: serviceFixedAmount ? parseFloat(serviceFixedAmount) : null,
    productPercentage: productPercentage ? parseFloat(productPercentage) : null,
    minAmount: minAmount ? parseFloat(minAmount) : null,
    maxAmount: maxAmount ? parseFloat(maxAmount) : null,
    isActive,
    createdAt: new Date(),
  };

  commissionRules.push(newRule);
  res.status(201).json({
    message: 'Regra de comissão criada com sucesso',
    rule: newRule,
  });
});

// Calcular comissão de um atendimento
router.post('/calculate', [
  authenticateToken,
  body('appointmentId').isInt().withMessage('ID do agendamento é obrigatório'),
  validate
], (req, res) => {
  const { appointmentId, serviceAmount, productAmount } = req.body;

  const appointments = require('./appointments.routes').appointments || [];
  const appointment = appointments.find(a => a.id === appointmentId);

  if (!appointment) {
    return res.status(404).json({ error: 'Agendamento não encontrado' });
  }

  const professionalId = appointment.professionalId;
  const rule = commissionRules.find(
    r => r.professionalId === professionalId && r.isActive
  );

  if (!rule) {
    return res.json({
      appointmentId,
      professionalId,
      commission: 0,
      message: 'Nenhuma regra de comissão encontrada',
    });
  }

  let commission = 0;

  // Calcular comissão baseado no tipo de regra
  switch (rule.type) {
    case 'percentage_service':
      commission = (serviceAmount || 0) * (rule.servicePercentage / 100);
      break;
    case 'fixed_service':
      commission = rule.serviceFixedAmount || 0;
      break;
    case 'percentage_product':
      commission = (productAmount || 0) * (rule.productPercentage / 100);
      break;
    case 'mixed':
      const serviceComm = rule.servicePercentage
        ? (serviceAmount || 0) * (rule.servicePercentage / 100)
        : rule.serviceFixedAmount || 0;
      const productComm = rule.productPercentage
        ? (productAmount || 0) * (rule.productPercentage / 100)
        : 0;
      commission = serviceComm + productComm;
      break;
  }

  // Aplicar limites
  if (rule.minAmount && commission < rule.minAmount) {
    commission = rule.minAmount;
  }
  if (rule.maxAmount && commission > rule.maxAmount) {
    commission = rule.maxAmount;
  }

  // Registrar comissão
  const commissionRecord = {
    id: recordIdCounter++,
    professionalId,
    appointmentId,
    ruleId: rule.id,
    serviceAmount: serviceAmount || 0,
    productAmount: productAmount || 0,
    commission,
    calculatedAt: new Date(),
    paid: false,
    paidAt: null,
  };

  commissionRecords.push(commissionRecord);

  res.json({
    appointmentId,
    professionalId,
    commission,
    record: commissionRecord,
  });
});

// Listar comissões (com filtros)
router.get('/', authenticateToken, (req, res) => {
  const { professionalId, startDate, endDate, paid } = req.query;
  let filteredCommissions = [...commissionRecords];

  if (professionalId) {
    filteredCommissions = filteredCommissions.filter(
      c => c.professionalId === parseInt(professionalId)
    );
  }

  if (startDate) {
    filteredCommissions = filteredCommissions.filter(c => c.calculatedAt >= startDate);
  }
  if (endDate) {
    filteredCommissions = filteredCommissions.filter(c => c.calculatedAt <= endDate);
  }

  if (paid !== undefined) {
    filteredCommissions = filteredCommissions.filter(c => c.paid === (paid === 'true'));
  }

  res.json({ commissions: filteredCommissions });
});

// Relatório de comissões do mês
router.get('/report/monthly', authenticateToken, (req, res) => {
  const { year, month, professionalId } = req.query;
  const targetYear = parseInt(year) || new Date().getFullYear();
  const targetMonth = parseInt(month) || new Date().getMonth() + 1;

  let filteredCommissions = commissionRecords.filter(c => {
    const cDate = new Date(c.calculatedAt);
    return cDate.getFullYear() === targetYear && cDate.getMonth() + 1 === targetMonth;
  });

  if (professionalId) {
    filteredCommissions = filteredCommissions.filter(
      c => c.professionalId === parseInt(professionalId)
    );
  }

  // Agrupar por profissional
  const byProfessional = {};
  filteredCommissions.forEach(c => {
    if (!byProfessional[c.professionalId]) {
      byProfessional[c.professionalId] = {
        professionalId: c.professionalId,
        totalCommissions: 0,
        totalServices: 0,
        totalProducts: 0,
        count: 0,
        records: [],
      };
    }
    byProfessional[c.professionalId].totalCommissions += c.commission;
    byProfessional[c.professionalId].totalServices += c.serviceAmount;
    byProfessional[c.professionalId].totalProducts += c.productAmount;
    byProfessional[c.professionalId].count++;
    byProfessional[c.professionalId].records.push(c);
  });

  // Buscar nomes dos profissionais
  const professionals = require('./professionals.routes').professionals || [];
  Object.values(byProfessional).forEach(summary => {
    const professional = professionals.find(p => p.id === summary.professionalId);
    summary.professionalName = professional ? professional.name : 'Desconhecido';
  });

  const totalCommissions = filteredCommissions.reduce((sum, c) => sum + c.commission, 0);
  const paidCommissions = filteredCommissions
    .filter(c => c.paid)
    .reduce((sum, c) => sum + c.commission, 0);
  const unpaidCommissions = totalCommissions - paidCommissions;

  res.json({
    year: targetYear,
    month: targetMonth,
    totalCommissions,
    paidCommissions,
    unpaidCommissions,
    byProfessional: Object.values(byProfessional),
  });
});

// Marcar comissão como paga
router.post('/:id/pay', authenticateToken, (req, res) => {
  const { paymentDate, notes } = req.body;
  const commission = commissionRecords.find(c => c.id === parseInt(req.params.id));

  if (!commission) {
    return res.status(404).json({ error: 'Comissão não encontrada' });
  }

  commission.paid = true;
  commission.paidAt = paymentDate ? new Date(paymentDate) : new Date();
  commission.paymentNotes = notes || null;

  res.json({
    message: 'Comissão marcada como paga',
    commission,
  });
});

module.exports = router;
module.exports.commissionRules = commissionRules;
module.exports.commissionRecords = commissionRecords;

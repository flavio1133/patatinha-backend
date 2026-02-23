const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');

// TODO: Implementar conexão com banco de dados
const vaccinations = [];
let vaccinationIdCounter = 1;

// Vacinas pré-cadastradas comuns
const COMMON_VACCINES = [
  { name: 'V8', type: 'vaccine', boosterDays: 365 },
  { name: 'V10', type: 'vaccine', boosterDays: 365 },
  { name: 'Raiva', type: 'vaccine', boosterDays: 365 },
  { name: 'Giárdia', type: 'vaccine', boosterDays: 365 },
  { name: 'Antirrábica', type: 'vaccine', boosterDays: 365 },
  { name: 'Vermífugo', type: 'dewormer', boosterDays: 90 },
  { name: 'Antipulgas', type: 'flea', boosterDays: 30 },
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar vacinas de um pet
router.get('/pet/:petId', authenticateToken, (req, res) => {
  const petVaccinations = vaccinations
    .filter(v => v.petId === parseInt(req.params.petId))
    .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));

  res.json({ vaccinations: petVaccinations });
});

// Listar vacinas próximas do vencimento (para alertas)
router.get('/expiring', authenticateToken, (req, res) => {
  const { days = 30 } = req.query;
  const today = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(today.getDate() + parseInt(days));

  const expiringVaccinations = vaccinations.filter(v => {
    if (!v.nextBoosterDate) return false;
    const nextDate = new Date(v.nextBoosterDate);
    return nextDate <= expirationDate && nextDate >= today;
  });

  // Agrupar por pet
  const groupedByPet = {};
  expiringVaccinations.forEach(v => {
    if (!groupedByPet[v.petId]) {
      groupedByPet[v.petId] = [];
    }
    groupedByPet[v.petId].push(v);
  });

  res.json({
    expiringVaccinations: expiringVaccinations,
    groupedByPet,
    daysUntilExpiration: parseInt(days),
  });
});

// Obter vacinas comuns pré-cadastradas
router.get('/common', authenticateToken, (req, res) => {
  res.json({ vaccines: COMMON_VACCINES });
});

// Registrar nova vacina/vermífugo/antipulgas
router.post('/', [
  authenticateToken,
  body('petId').isInt().withMessage('ID do pet é obrigatório'),
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('type').isIn(['vaccine', 'dewormer', 'flea']),
  body('applicationDate').notEmpty().withMessage('Data de aplicação é obrigatória'),
  validate
], (req, res) => {
  const {
    petId,
    name,
    type,
    applicationDate,
    nextBoosterDate,
    lot,
    veterinarianName,
    attachment, // URL da foto do comprovante
  } = req.body;

  // Se não forneceu próxima data, calcular baseado no tipo
  let calculatedNextBooster = nextBoosterDate;
  if (!calculatedNextBooster) {
    const vaccineInfo = COMMON_VACCINES.find(v => v.name === name);
    if (vaccineInfo) {
      const appDate = new Date(applicationDate);
      appDate.setDate(appDate.getDate() + vaccineInfo.boosterDays);
      calculatedNextBooster = appDate.toISOString().split('T')[0];
    }
  }

  const newVaccination = {
    id: vaccinationIdCounter++,
    petId: parseInt(petId),
    name,
    type,
    applicationDate,
    nextBoosterDate: calculatedNextBooster,
    lot: lot || null,
    veterinarianName: veterinarianName || null,
    attachment: attachment || null,
    createdAt: new Date(),
  };

  vaccinations.push(newVaccination);
  res.status(201).json({
    message: 'Vacina registrada com sucesso',
    vaccination: newVaccination,
  });
});

// Atualizar vacina
router.put('/:id', authenticateToken, (req, res) => {
  const vaccinationIndex = vaccinations.findIndex(v => v.id === parseInt(req.params.id));

  if (vaccinationIndex === -1) {
    return res.status(404).json({ error: 'Vacina não encontrada' });
  }

  vaccinations[vaccinationIndex] = {
    ...vaccinations[vaccinationIndex],
    ...req.body,
    updatedAt: new Date(),
  };

  res.json({
    message: 'Vacina atualizada',
    vaccination: vaccinations[vaccinationIndex],
  });
});

// Deletar vacina
router.delete('/:id', authenticateToken, (req, res) => {
  const vaccinationIndex = vaccinations.findIndex(v => v.id === parseInt(req.params.id));

  if (vaccinationIndex === -1) {
    return res.status(404).json({ error: 'Vacina não encontrada' });
  }

  vaccinations.splice(vaccinationIndex, 1);
  res.json({ message: 'Vacina removida' });
});

// Função auxiliar para buscar vacinas por petId
function getVaccinationsByPetId(petId) {
  return vaccinations
    .filter(v => v.petId === petId)
    .sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate));
}

module.exports = router;
module.exports.getVaccinationsByPetId = getVaccinationsByPetId;

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');

// TODO: Implementar conexão com banco de dados
const medicalRecords = [];
let recordIdCounter = 1;

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar prontuário de um pet (histórico cronológico)
router.get('/pet/:petId', authenticateToken, (req, res) => {
  const petRecords = medicalRecords
    .filter(r => r.petId === parseInt(req.params.petId))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Mais recentes primeiro

  res.json({ records: petRecords });
});

// Criar nova entrada no prontuário
router.post('/', [
  authenticateToken,
  body('petId').isInt().withMessage('ID do pet é obrigatório'),
  body('type').isIn(['consulta', 'banho', 'tosa', 'veterinario', 'hotel', 'outros']),
  body('date').notEmpty().withMessage('Data é obrigatória'),
  validate
], (req, res) => {
  const {
    petId,
    type,
    date,
    description,
    professionalName,
    attachments, // Array de URLs de fotos/documentos
    behaviorNotes, // Observações de comportamento durante o atendimento
  } = req.body;

  const newRecord = {
    id: recordIdCounter++,
    petId: parseInt(petId),
    type,
    date,
    description: description || null,
    professionalName: professionalName || null,
    attachments: attachments || [],
    behaviorNotes: behaviorNotes || null,
    createdAt: new Date(),
  };

  medicalRecords.push(newRecord);
  res.status(201).json({
    message: 'Registro adicionado ao prontuário',
    record: newRecord,
  });
});

// Atualizar registro
router.put('/:id', authenticateToken, (req, res) => {
  const recordIndex = medicalRecords.findIndex(r => r.id === parseInt(req.params.id));

  if (recordIndex === -1) {
    return res.status(404).json({ error: 'Registro não encontrado' });
  }

  medicalRecords[recordIndex] = {
    ...medicalRecords[recordIndex],
    ...req.body,
    updatedAt: new Date(),
  };

  res.json({
    message: 'Registro atualizado',
    record: medicalRecords[recordIndex],
  });
});

// Deletar registro
router.delete('/:id', authenticateToken, (req, res) => {
  const recordIndex = medicalRecords.findIndex(r => r.id === parseInt(req.params.id));

  if (recordIndex === -1) {
    return res.status(404).json({ error: 'Registro não encontrado' });
  }

  medicalRecords.splice(recordIndex, 1);
  res.json({ message: 'Registro removido' });
});

// Função auxiliar para buscar registros por petId
function getRecordsByPetId(petId) {
  return medicalRecords
    .filter(r => r.petId === petId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

module.exports = router;
module.exports.getRecordsByPetId = getRecordsByPetId;

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { canAddPet, validatePetRequiredFields } = require('../services/business-rules.service');

// TODO: Implementar conexão com banco de dados
// Por enquanto, usando dados em memória
const pets = [];
const petsState = { petIdCounter: 1 };

// Middleware de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar pets (do usuário ou de um cliente específico)
router.get('/', authenticateToken, (req, res) => {
  const { customerId } = req.query;
  
  let filteredPets = pets;
  
  // Se for cliente do app mobile, filtrar por userId
  if (req.user.userId && !customerId) {
    filteredPets = pets.filter(p => p.userId === req.user.userId);
  }
  
  // Se for busca por cliente (admin)
  if (customerId) {
    filteredPets = pets.filter(p => p.customerId === parseInt(customerId));
  }
  
  res.json({ pets: filteredPets });
});

// Função auxiliar para buscar pets por customerId
function getPetsByCustomerId(customerId) {
  return pets.filter(p => p.customerId === customerId);
}

// Criar novo pet
router.post('/', [
  authenticateToken,
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('species').optional().isIn(['dog', 'cat', 'bird', 'rabbit', 'other']),
  validate
], (req, res) => {
  const { 
    name, 
    breed, 
    age, 
    birthDate,
    species, 
    color,
    weight,
    photo,
    customerId,
    importantInfo, // Campo de alerta importante (ex: "diabético", "medicação contínua")
    behaviorAlerts, // Array de alertas de comportamento
    groomingPreferences, // Preferências de corte
  } = req.body;

  // Determinar se é cliente do app (userId) ou cliente cadastrado pelo admin (customerId)
  const ownerId = customerId || req.user.userId;
  const isCustomerPet = !!customerId;

  // RN002: Validar campos obrigatórios
  const validation = validatePetRequiredFields({ name, species, birthDate, age });
  if (!validation.valid) {
    return res.status(400).json({ 
      error: 'Campos obrigatórios não preenchidos',
      errors: validation.errors 
    });
  }

  // RN001: Verificar limite de pets por cliente
  const existingPets = isCustomerPet 
    ? pets.filter(p => p.customerId === ownerId)
    : pets.filter(p => p.userId === ownerId);
  
  const limitCheck = canAddPet(ownerId, existingPets.length);
  if (!limitCheck.allowed) {
    return res.status(400).json({ 
      error: limitCheck.reason,
      maxPets: limitCheck.maxPets,
      currentPets: existingPets.length,
    });
  }

  const newPet = {
    id: petsState.petIdCounter++,
    userId: isCustomerPet ? null : ownerId,
    customerId: isCustomerPet ? ownerId : null,
    name,
    breed: breed || null,
    age: age || null,
    birthDate: birthDate || null,
    species: species || 'dog',
    color: color || null,
    weight: weight || null,
    photo: photo || null,
    importantInfo: importantInfo || null, // Alerta em destaque
    behaviorAlerts: behaviorAlerts || [], // Array de alertas
    groomingPreferences: groomingPreferences || {
      hairLength: null,
      shampooType: null,
      finishing: [],
      notes: null,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  pets.push(newPet);
  res.status(201).json({ message: 'Pet cadastrado com sucesso', pet: newPet });
});

// Histórico completo do pet (agendamentos + fotos)
router.get('/:id/history', authenticateToken, (req, res) => {
  const pet = pets.find(p => p.id === parseInt(req.params.id));
  if (!pet) {
    return res.status(404).json({ error: 'Pet não encontrado' });
  }
  if (pet.userId && pet.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const appointments = require('./appointments.routes').appointments || [];
  const petAppointments = appointments
    .filter(a => a.petId === pet.id)
    .sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
  const petPhotos = require('./photos.routes').getPhotosByPetId(pet.id);
  res.json({
    pet: { id: pet.id, name: pet.name },
    appointments: petAppointments,
    photos: petPhotos,
  });
});

// Obter pet específico com todos os dados relacionados
router.get('/:id', authenticateToken, async (req, res) => {
  const pet = pets.find(p => p.id === parseInt(req.params.id));
  
  if (!pet) {
    return res.status(404).json({ error: 'Pet não encontrado' });
  }

  // Verificar permissão (se for pet do usuário ou se for admin)
  if (pet.userId && pet.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  // Buscar dados relacionados
  const medicalRecords = require('./medical-records.routes').getRecordsByPetId(pet.id);
  const vaccinations = require('./vaccinations.routes').getVaccinationsByPetId(pet.id);
  const photos = require('./photos.routes').getPhotosByPetId(pet.id);

  res.json({
    ...pet,
    medicalRecords,
    vaccinations,
    photos,
  });
});

// Atualizar pet
router.put('/:id', authenticateToken, (req, res) => {
  const pet = pets.find(p => p.id === parseInt(req.params.id));
  
  if (!pet) {
    return res.status(404).json({ error: 'Pet não encontrado' });
  }

  // Verificar permissão
  if (pet.userId && pet.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const petIndex = pets.findIndex(p => p.id === parseInt(req.params.id));
  
  pets[petIndex] = { 
    ...pets[petIndex], 
    ...req.body, 
    updatedAt: new Date() 
  };
  
  res.json({ message: 'Pet atualizado com sucesso', pet: pets[petIndex] });
});

// Deletar pet
router.delete('/:id', authenticateToken, (req, res) => {
  const pet = pets.find(p => p.id === parseInt(req.params.id));
  
  if (!pet) {
    return res.status(404).json({ error: 'Pet não encontrado' });
  }

  // Verificar permissão
  if (pet.userId && pet.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const petIndex = pets.findIndex(p => p.id === parseInt(req.params.id));
  pets.splice(petIndex, 1);
  
  res.json({ message: 'Pet removido com sucesso' });
});

module.exports = router;
module.exports.getPetsByCustomerId = getPetsByCustomerId;
module.exports.pets = pets;
module.exports.petsState = petsState;
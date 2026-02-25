const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { canAddPet, validatePetRequiredFields } = require('../services/business-rules.service');
const { logAudit } = require('../services/audit.service');

// TODO: Implementar conexão com banco de dados
// Por enquanto, usando dados em memória
const pets = [];
const petsState = { petIdCounter: 1 };

// Pet fictício para o cliente cliente@teste.com (userId 5 em seed-users)
// e também vinculado ao customer id 1 criado em customers.routes.js
const demoPetKiara = {
  id: petsState.petIdCounter++,
  userId: 5,
  customerId: 1,
  name: 'Kiara',
  breed: 'Golden Retriever',
  age: 3,
  birthDate: '2021-04-15',
  species: 'dog',
  color: 'Dourado',
  weight: 24,
  photo: null,
  importantInfo: 'Alergia a alguns tipos de shampoo perfumado.',
  behaviorAlerts: [
    'Assusta com barulho alto de secador.',
    'Precisa de aproximação calma na primeira interação.',
  ],
  groomingPreferences: {
    hairLength: 'Médio',
    shampooType: 'Hipoalergênico',
    finishing: ['Laço rosa', 'Perfume suave'],
    notes: 'Gosta de água morna e carinho na cabeça.',
  },
  is_active: true,
  deleted_at: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};
pets.push(demoPetKiara);

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
  const { customerId, includeInactive } = req.query;
  
  let filteredPets = pets;

  // Por padrão ocultar inativos (soft delete)
  if (!includeInactive) {
    filteredPets = filteredPets.filter(p => p.is_active !== false);
  }
  
  // Se for cliente do app mobile, filtrar por userId
  if (req.user.userId && !customerId) {
    filteredPets = filteredPets.filter(p => p.userId === req.user.userId);
  }
  
  // Se for busca por cliente (admin)
  if (customerId) {
    filteredPets = filteredPets.filter(p => p.customerId === parseInt(customerId));
  }
  
  res.json({ pets: filteredPets });
});

// Função auxiliar para buscar pets por customerId (inclui inativos para integridade)
function getPetsByCustomerId(customerId) {
  return pets.filter(p => p.customerId === customerId);
}

// Criar novo pet
router.post('/', [
  authenticateToken,
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('species').optional().isIn(['dog', 'cat', 'bird', 'rabbit', 'other']),
  validate
], async (req, res) => {
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

  const now = new Date();
  const newPet = {
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
    importantInfo: importantInfo || null,
    behaviorAlerts: behaviorAlerts || [],
    groomingPreferences: groomingPreferences || {
      hairLength: null,
      shampooType: null,
      finishing: [],
      notes: null,
    },
    is_active: true,
    deleted_at: null,
    createdAt: now,
    updatedAt: now,
  };

  const created = await Pet.create({
    userId: newPet.userId,
    customerId: newPet.customerId,
    name: newPet.name,
    breed: newPet.breed,
    age: newPet.age,
    birthDate: newPet.birthDate,
    species: newPet.species,
    color: newPet.color,
    weight: newPet.weight,
    photo: newPet.photo,
    importantInfo: newPet.importantInfo,
    behaviorAlerts: newPet.behaviorAlerts,
    groomingPreferences: newPet.groomingPreferences,
    is_active: newPet.is_active,
    deleted_at: newPet.deleted_at,
  });

  const persistedPet = {
    ...newPet,
    id: created.id,
  };

  pets.push(persistedPet);
  petsState.petIdCounter = Math.max(petsState.petIdCounter, created.id + 1);

  res.status(201).json({ message: 'Pet cadastrado com sucesso', pet: persistedPet });
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
router.put('/:id', authenticateToken, async (req, res) => {
  const pet = pets.find(p => p.id === parseInt(req.params.id));
  
  if (!pet) {
    return res.status(404).json({ error: 'Pet não encontrado' });
  }

  // Verificar permissão
  if (pet.userId && pet.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const petIndex = pets.findIndex(p => p.id === parseInt(req.params.id));
  const updated = {
    ...pets[petIndex],
    ...req.body,
    updatedAt: new Date(),
  };

  await Pet.update(
    {
      name: updated.name,
      breed: updated.breed,
      age: updated.age,
      birthDate: updated.birthDate,
      species: updated.species,
      color: updated.color,
      weight: updated.weight,
      photo: updated.photo,
      importantInfo: updated.importantInfo,
      behaviorAlerts: updated.behaviorAlerts,
      groomingPreferences: updated.groomingPreferences,
    },
    { where: { id: updated.id } },
  );

  pets[petIndex] = updated;
  
  res.json({ message: 'Pet atualizado com sucesso', pet: pets[petIndex] });
});

// Desativar pet (soft delete) – apenas Gestor ou Super Admin; motivo obrigatório
router.delete('/:id', [
  authenticateToken,
  requireRole('master', 'manager', 'super_admin'),
  body('reason').trim().notEmpty().withMessage('Motivo da desativação é obrigatório'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const pet = pets.find(p => p.id === parseInt(req.params.id));
  
  if (!pet) {
    return res.status(404).json({ error: 'Pet não encontrado' });
  }

  if (pet.userId && pet.userId !== req.user.userId && !['master', 'manager', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  if (pet.is_active === false) {
    return res.status(400).json({ error: 'Pet já está desativado' });
  }

  const reason = req.body.reason.trim();
  const petIndex = pets.findIndex(p => p.id === parseInt(req.params.id));
  const oldSnapshot = { ...pet };

  pets[petIndex].is_active = false;
  pets[petIndex].deleted_at = new Date();
  pets[petIndex].updatedAt = new Date();

  await Pet.update(
    {
      is_active: false,
      deleted_at: pets[petIndex].deleted_at,
      updated_at: pets[petIndex].updatedAt,
    },
    { where: { id: pets[petIndex].id } },
  );

  logAudit({
    userId: req.user.userId || req.user.id,
    userName: req.user.name || req.user.email || 'Usuário',
    userRole: req.user.role || 'unknown',
    action: 'deactivate',
    entity: 'pet',
    entityId: pet.id,
    oldValue: oldSnapshot,
    newValue: { ...pets[petIndex] },
    reason,
  });

  res.json({
    message: 'Pet desativado com sucesso. O histórico de serviços foi preservado.',
    pet: pets[petIndex],
  });
});

module.exports = router;
module.exports.getPetsByCustomerId = getPetsByCustomerId;
module.exports.pets = pets;
module.exports.petsState = petsState;
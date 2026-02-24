const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { users } = require('./auth.routes');
const { logAudit } = require('../services/audit.service');

// TODO: Implementar conexão com banco de dados
const professionals = [];
const state = { professionalIdCounter: 1 };

// Profissionais fictícios para a Patatinha Recife (agenda e alocação)
const demoProfessionals = [
  {
    id: state.professionalIdCounter++,
    name: 'Ana Souza',
    specialties: ['banho', 'tosa', 'banho_tosa'],
    roles: ['tosador', 'banhista'],
    averageSpeed: 60,
    workSchedule: { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
    daysOff: ['sunday'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: state.professionalIdCounter++,
    name: 'Carlos Lima',
    specialties: ['veterinario', 'banho', 'outros'],
    roles: ['veterinario'],
    averageSpeed: 45,
    workSchedule: { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
    daysOff: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: state.professionalIdCounter++,
    name: 'Mariana Costa',
    specialties: ['banho', 'tosa', 'banho_tosa'],
    roles: ['banhista', 'recepcionista'],
    averageSpeed: 55,
    workSchedule: { start: '09:00', end: '17:00', lunchStart: '12:00', lunchEnd: '13:00' },
    daysOff: ['saturday', 'sunday'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
demoProfessionals.forEach((p) => professionals.push(p));

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar todos os profissionais (por padrão apenas ativos)
router.get('/', authenticateToken, (req, res) => {
  const { includeInactive } = req.query;
  let list = professionals;
  if (!includeInactive) {
    list = list.filter(p => p.isActive !== false && !p.deleted_at);
  }
  res.json({ professionals: list });
});

// Obter profissional específico
router.get('/:id', authenticateToken, (req, res) => {
  const professional = professionals.find(p => p.id === parseInt(req.params.id));
  
  if (!professional) {
    return res.status(404).json({ error: 'Profissional não encontrado' });
  }

  res.json(professional);
});

// Criar novo profissional
router.post('/', [
  authenticateToken,
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('specialties').isArray().withMessage('Especialidades devem ser um array'),
  validate
], (req, res) => {
  const {
    name,
    specialties, // ['banho', 'tosa', 'gatos', 'caes_grandes']
    averageSpeed, // minutos por serviço
    workSchedule, // { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' }
    daysOff, // ['sunday', 'monday']
    isActive = true,
    email,
    phone,
    permissions,
    roles, // ['tosador', 'banhista', 'veterinario', 'auxiliar', 'recepcionista', 'vendedor', 'gerente']
  } = req.body;

  const validRoles = ['tosador', 'banhista', 'veterinario', 'auxiliar', 'recepcionista', 'vendedor', 'gerente'];
  const sanitizedRoles = Array.isArray(roles)
    ? roles.filter((r) => validRoles.includes(r))
    : [];

  const newProfessional = {
    id: state.professionalIdCounter++,
    name,
    specialties: specialties || [],
    roles: sanitizedRoles,
    averageSpeed: averageSpeed || 60, // padrão 60 minutos
    workSchedule: workSchedule || {
      start: '08:00',
      end: '18:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
    },
    daysOff: daysOff || [],
    email: email || null,
    phone: phone || null,
    userId: null,
    permissions: permissions || {
      canViewAgenda: true,
      canEditAgenda: true,
      canEditInventory: false,
      canViewFinance: false,
    },
    isActive,
    createdAt: new Date(),
    updatedAt: new Date(),
    deleted_at: null,
  };

  professionals.push(newProfessional);
  res.status(201).json({
    message: 'Profissional cadastrado com sucesso',
    professional: newProfessional,
  });
});

// Atualizar profissional
router.put('/:id', authenticateToken, (req, res) => {
  const professionalIndex = professionals.findIndex(
    p => p.id === parseInt(req.params.id)
  );

  if (professionalIndex === -1) {
    return res.status(404).json({ error: 'Profissional não encontrado' });
  }

  professionals[professionalIndex] = {
    ...professionals[professionalIndex],
    ...req.body,
    updatedAt: new Date(),
  };

  res.json({
    message: 'Profissional atualizado com sucesso',
    professional: professionals[professionalIndex],
  });
});

// Atualizar permissões de um profissional
router.put('/:id/permissions', authenticateToken, (req, res) => {
  const professionalIndex = professionals.findIndex(
    p => p.id === parseInt(req.params.id)
  );

  if (professionalIndex === -1) {
    return res.status(404).json({ error: 'Profissional não encontrado' });
  }

  professionals[professionalIndex].permissions = {
    ...(professionals[professionalIndex].permissions || {}),
    ...(req.body || {}),
  };
  professionals[professionalIndex].updatedAt = new Date();

  res.json({
    message: 'Permissões atualizadas com sucesso',
    permissions: professionals[professionalIndex].permissions,
  });
});

// Criar login/senha para profissional (senha padrão 123456)
router.post('/:id/create-login', authenticateToken, async (req, res) => {
  const professional = professionals.find(p => p.id === parseInt(req.params.id));

  if (!professional) {
    return res.status(404).json({ error: 'Profissional não encontrado' });
  }

  if (!professional.email) {
    return res.status(400).json({ error: 'Profissional precisa ter e-mail para criar acesso' });
  }

  const emailLower = professional.email.trim().toLowerCase();
  let user = users.find(u => u.email && u.email.toLowerCase() === emailLower);

  if (!user) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    user = {
      id: users.length + 1,
      name: professional.name,
      email: professional.email,
      password: hashedPassword,
      phone: professional.phone || null,
      role: 'employee',
      createdAt: new Date(),
    };
    users.push(user);
  }

  professional.userId = user.id;
  professional.updatedAt = new Date();

  res.json({
    message: 'Acesso criado/atualizado com sucesso',
    professional: {
      id: professional.id,
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      userId: professional.userId,
    },
    credentials: {
      login: professional.email,
      password: '123456',
    },
  });
});

// Desativar profissional (soft delete) – apenas Gestor ou Super Admin; motivo obrigatório
router.delete('/:id', [
  authenticateToken,
  requireRole('master', 'manager', 'super_admin'),
  body('reason').trim().notEmpty().withMessage('Motivo da desativação é obrigatório'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const professionalIndex = professionals.findIndex(
    p => p.id === parseInt(req.params.id)
  );

  if (professionalIndex === -1) {
    return res.status(404).json({ error: 'Profissional não encontrado' });
  }

  const professional = professionals[professionalIndex];
  if (professional.isActive === false || professional.deleted_at) {
    return res.status(400).json({ error: 'Profissional já está desativado' });
  }

  const reason = req.body.reason.trim();
  const oldSnapshot = { ...professional };

  professionals[professionalIndex].isActive = false;
  professionals[professionalIndex].deleted_at = new Date();
  professionals[professionalIndex].updatedAt = new Date();

  logAudit({
    userId: req.user.userId || req.user.id,
    userName: req.user.name || req.user.email || 'Usuário',
    userRole: req.user.role || 'unknown',
    action: 'deactivate',
    entity: 'professional',
    entityId: professional.id,
    oldValue: oldSnapshot,
    newValue: { ...professionals[professionalIndex] },
    reason,
  });

  res.json({
    message: 'Profissional desativado com sucesso. O histórico de agendamentos foi preservado.',
    professional: professionals[professionalIndex],
  });
});

// Obter disponibilidade de um profissional em uma data
router.get('/:id/availability', authenticateToken, (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ error: 'Data é obrigatória' });
  }

  const professional = professionals.find(p => p.id === parseInt(req.params.id));
  if (!professional) {
    return res.status(404).json({ error: 'Profissional não encontrado' });
  }

  // Buscar agendamentos do profissional na data
  const appointments = require('./appointments.routes').getAppointmentsByProfessionalAndDate(
    parseInt(req.params.id),
    date
  );

  // Calcular horários disponíveis
  const availableSlots = calculateAvailableSlots(
    professional,
    date,
    appointments
  );

  res.json({
    professional: professional.name,
    date,
    availableSlots,
    appointments: appointments.length,
  });
});

// Função auxiliar para calcular horários disponíveis
function calculateAvailableSlots(professional, date, existingAppointments) {
  const slots = [];
  const workStart = professional.workSchedule.start; // '08:00'
  const workEnd = professional.workSchedule.end; // '18:00'
  const lunchStart = professional.workSchedule.lunchStart; // '12:00'
  const lunchEnd = professional.workSchedule.lunchEnd; // '13:00'

  // Converter para minutos do dia
  const startMinutes = timeToMinutes(workStart);
  const endMinutes = timeToMinutes(workEnd);
  const lunchStartMinutes = timeToMinutes(lunchStart);
  const lunchEndMinutes = timeToMinutes(lunchEnd);

  // Criar slots de 30 em 30 minutos
  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    // Pular horário de almoço
    if (minutes >= lunchStartMinutes && minutes < lunchEndMinutes) {
      continue;
    }

    const slotTime = minutesToTime(minutes);
    const isAvailable = !isSlotOccupied(slotTime, existingAppointments);
    
    slots.push({
      time: slotTime,
      available: isAvailable,
    });
  }

  return slots;
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function isSlotOccupied(slotTime, appointments) {
  // Verificar se algum agendamento ocupa este slot
  // Considerar duração do serviço e buffer de 5 minutos antes/depois
  return appointments.some(apt => {
    const aptStart = timeToMinutes(apt.time);
    const aptEnd = aptStart + (apt.duration || 60);
    const slotMinutes = timeToMinutes(slotTime);
    
    // Slot ocupado se está dentro do intervalo do agendamento
    // ou dentro do buffer de 5 minutos
    return slotMinutes >= aptStart - 5 && slotMinutes < aptEnd + 5;
  });
}

// Função auxiliar para buscar profissional por ID
function getProfessionalById(id) {
  return professionals.find(p => p.id === id);
}

module.exports = router;
module.exports.getProfessionalById = getProfessionalById;
module.exports.professionals = professionals;
module.exports.professionalsState = state;
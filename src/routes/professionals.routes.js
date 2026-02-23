const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');

// TODO: Implementar conexão com banco de dados
const professionals = [];
const state = { professionalIdCounter: 1 };

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar todos os profissionais
router.get('/', authenticateToken, (req, res) => {
  res.json({ professionals });
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
  } = req.body;

  const newProfessional = {
    id: state.professionalIdCounter++,
    name,
    specialties: specialties || [],
    averageSpeed: averageSpeed || 60, // padrão 60 minutos
    workSchedule: workSchedule || {
      start: '08:00',
      end: '18:00',
      lunchStart: '12:00',
      lunchEnd: '13:00',
    },
    daysOff: daysOff || [],
    isActive,
    createdAt: new Date(),
    updatedAt: new Date(),
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

// Deletar profissional
router.delete('/:id', authenticateToken, (req, res) => {
  const professionalIndex = professionals.findIndex(
    p => p.id === parseInt(req.params.id)
  );

  if (professionalIndex === -1) {
    return res.status(404).json({ error: 'Profissional não encontrado' });
  }

  professionals.splice(professionalIndex, 1);
  res.json({ message: 'Profissional removido com sucesso' });
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
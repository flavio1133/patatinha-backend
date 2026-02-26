const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkSubscription } = require('../middleware/subscription.middleware');
const { requireRole } = require('../middleware/role.middleware');
const {
  canCancelAppointment,
  getServiceDuration,
  hasScheduleConflict,
  canCheckIn,
  canCheckOut,
  isPetWaitingTooLong,
  timeToMinutes,
  minutesToTime,
} = require('../services/business-rules.service');
const { Appointment, ClientCompany } = require('../db');

// Cache em memória para manter compatibilidade com demais módulos
const appointments = [];

async function hydrateAppointmentsFromDatabase() {
  try {
    const rows = await Appointment.findAll({ order: [['id', 'ASC']] });
    appointments.length = 0;
    rows.forEach((row) => {
      const plain = row.get({ plain: true });
      appointments.push({
        ...plain,
        createdAt: plain.createdAt || plain.created_at,
      });
    });
  } catch (err) {
    console.error('Erro ao carregar agendamentos do banco:', err.message);
  }
}

hydrateAppointmentsFromDatabase();

// Duração padrão dos serviços (em minutos)
const SERVICE_DURATIONS = {
  banho: 60,
  tosa: 90,
  banho_tosa: 120,
  veterinario: 30,
  hotel: 0, // variável
  outros: 60,
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar agendamentos (com filtros)
router.get('/', authenticateToken, (req, res) => {
  const { date, professionalId, status, customerId } = req.query;
  let filteredAppointments = [...appointments];

  // Gestão (company token): só agendamentos daquela unidade
  if (req.companyId) {
    filteredAppointments = filteredAppointments.filter((a) => a.companyId === req.companyId);
  }

  // Se for cliente do app mobile, filtrar por userId
  if (req.user.userId && !professionalId && !date) {
    filteredAppointments = filteredAppointments.filter(a => a.userId === req.user.userId);
  }

  // Filtro por data
  if (date) {
    filteredAppointments = filteredAppointments.filter(a => a.date === date);
  }

  // Filtro por profissional
  if (professionalId) {
    filteredAppointments = filteredAppointments.filter(
      a => a.professionalId === parseInt(professionalId)
    );
  }

  // Filtro por status
  if (status) {
    filteredAppointments = filteredAppointments.filter(a => a.status === status);
  }

  // Filtro por cliente (para admin)
  if (customerId) {
    filteredAppointments = filteredAppointments.filter(
      a => a.customerId === parseInt(customerId)
    );
  }

  const pets = require('./pets.routes').pets || [];
  const getProfessionalById = require('./professionals.routes').getProfessionalById;
  const enriched = filteredAppointments.map(a => {
    const pet = pets.find(p => p.id === a.petId);
    const professional = getProfessionalById(a.professionalId);
    return {
      ...a,
      petName: pet ? pet.name : null,
      professionalName: professional ? professional.name : null,
    };
  });

  res.json({ appointments: enriched });
});

// Cancelar todos os agendamentos de um cliente (gestão; justificativa obrigatória)
router.post('/cancel-by-customer', authenticateToken, requireRole(['master', 'manager']), async (req, res) => {
  const customerId = req.body?.customerId != null ? parseInt(req.body.customerId, 10) : null;
  const reason = (req.body?.reason && String(req.body.reason).trim()) || '';
  if (!customerId || !Number.isInteger(customerId)) {
    return res.status(400).json({ error: 'customerId é obrigatório' });
  }
  if (!reason) {
    return res.status(400).json({ error: 'Justificativa do cancelamento é obrigatória' });
  }

  let list = appointments.filter(
    (a) => a.customerId === customerId && a.status !== 'cancelled'
  );
  if (req.companyId) {
    list = list.filter((a) => a.companyId === req.companyId);
  }

  const now = new Date();
  for (const apt of list) {
    const idx = appointments.findIndex((a) => a.id === apt.id);
    if (idx === -1) continue;
    appointments[idx].status = 'cancelled';
    appointments[idx].cancellation_reason = reason;
    appointments[idx].cancelled_by = 'company';
    appointments[idx].cancelled_at = now;
    appointments[idx].cancelledAt = now;
    appointments[idx].cancellationFee = 0;
    await Appointment.update(
      {
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_by: 'company',
        cancelled_at: now,
        cancellationFee: 0,
      },
      { where: { id: apt.id } }
    );
  }

  res.json({
    message: 'Agendamentos cancelados com sucesso',
    cancelledCount: list.length,
  });
});

// Verificar disponibilidade
router.get('/availability', authenticateToken, (req, res) => {
  const { date, service } = req.query;

  if (!date || !service) {
    return res.status(400).json({ error: 'Data e serviço são obrigatórios' });
  }

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = dayNames[new Date(date + 'T12:00:00').getDay()];

  // Buscar todos os profissionais disponíveis (e que trabalham nesse dia)
  const professionals = require('./professionals.routes').professionals || [];
  const availableProfessionals = professionals.filter((p) => {
    if (!p.isActive) return false;
    const daysOff = p.daysOff || [];
    return !daysOff.includes(dayOfWeek);
  });

  const availability = availableProfessionals.map(professional => {
    const professionalAppointments = appointments.filter(
      a => a.professionalId === professional.id && a.date === date && a.status !== 'cancelled'
    );

    const availableSlots = calculateAvailableSlotsForService(
      professional,
      date,
      professionalAppointments,
      service
    );

    return {
      professionalId: professional.id,
      professionalName: professional.name,
      availableSlots,
      currentAppointments: professionalAppointments.length,
    };
  });

  res.json({ date, service, availability });
});

// Criar novo agendamento (com alocação automática de profissional)
router.post('/', [
  authenticateToken,
  body('petId').isInt().withMessage('ID do pet é obrigatório'),
  body('service').isIn(['banho', 'tosa', 'banho_tosa', 'veterinario', 'hotel', 'outros']),
  body('date').notEmpty().withMessage('Data é obrigatória'),
  body('time').notEmpty().withMessage('Horário é obrigatório'),
  validate
], async (req, res) => {
  const { petId, service, date, time, notes, professionalId, customerId, userId: bodyUserId, companyId: bodyCompanyId } = req.body;

  // Quando a gestão agenda em nome do cliente: usar userId do cliente para ele ver na área do cliente
  let userId = req.user.userId || null;
  if (bodyUserId != null) {
    userId = bodyUserId;
  } else if (customerId) {
    const { getCustomerById } = require('./customers.routes');
    const cust = getCustomerById(parseInt(customerId));
    if (cust && cust.userId != null) userId = cust.userId;
  }

  // companyId: gestão usa req.companyId; cliente envia no body ao agendar por unidade
  const companyId = req.companyId || bodyCompanyId || null;

  // Se for cliente (app) agendando para uma empresa específica, garantir que exista vínculo persistente
  if (!req.companyId && userId && companyId) {
    try {
      const link = await ClientCompany.findOne({
        where: { client_id: userId, company_id: companyId, is_active: true },
      });
      if (!link) {
        return res.status(403).json({ error: 'Cliente não está vinculado a esta empresa' });
      }
    } catch (err) {
      console.error('Erro ao verificar vínculo cliente-empresa antes do agendamento:', err.message);
      return res.status(500).json({ error: 'Erro ao validar vínculo com a empresa' });
    }
  }

  // Alocar profissional automaticamente se não especificado
  let assignedProfessionalId = professionalId;
  if (!assignedProfessionalId) {
    assignedProfessionalId = assignProfessional(service, date, time);
    if (!assignedProfessionalId) {
      return res.status(400).json({ error: 'Nenhum profissional disponível neste horário' });
    }
  }

  // Verificar disponibilidade
  const isAvailable = checkAvailability(date, time, service, assignedProfessionalId);
  if (!isAvailable.available) {
    return res.status(400).json({
      error: 'Horário não disponível',
      reason: isAvailable.reason,
      suggestions: isAvailable.suggestions,
    });
  }

  // RN011/RN012: Verificar conflitos de horário e intervalo mínimo
  if (assignedProfessionalId) {
    const conflictCheck = hasScheduleConflict(
      appointments.filter(a => a.status !== 'cancelled'),
      { date, time, service },
      assignedProfessionalId
    );
    if (conflictCheck.hasConflict) {
      return res.status(400).json({
        error: conflictCheck.reason,
        conflictingAppointment: conflictCheck.conflictingAppointment,
      });
    }
  }

  const duration = SERVICE_DURATIONS[service] || 60;

  const newAppointmentData = {
    userId,
    customerId: customerId ? parseInt(customerId) : null,
    companyId: companyId || null,
    petId: parseInt(petId),
    professionalId: assignedProfessionalId,
    service,
    date,
    time,
    duration,
    notes: notes || null,
    status: 'confirmed',
    checkInTime: null,
    checkOutTime: null,
    estimatedCompletionTime: null,
  };

  const created = await Appointment.create(newAppointmentData);
  const newAppointment = created.get({ plain: true });

  appointments.push({
    ...newAppointment,
    createdAt: new Date(),
  });

  // TODO: Enviar notificação de confirmação

  res.status(201).json({
    message: 'Agendamento criado com sucesso',
    appointment: newAppointment,
  });
});

// Obter agendamento específico
router.get('/:id', authenticateToken, (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));

  if (!appointment) {
    return res.status(404).json({ error: 'Agendamento não encontrado' });
  }

  // Verificar permissão (se for pet do usuário ou se for admin)
  if (appointment.userId && appointment.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  res.json(appointment);
});

// Check-in (pet chegou)
router.post('/:id/check-in', authenticateToken, (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));

  if (!appointment) {
    return res.status(404).json({ error: 'Agendamento não encontrado' });
  }

  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    return res.status(400).json({ error: 'Agendamento já finalizado ou cancelado' });
  }

  // RN013: Verificar tolerância de check-in
  const checkInValidation = canCheckIn(appointment);
  if (!checkInValidation.allowed) {
    return res.status(400).json({ error: checkInValidation.reason });
  }

  const checkInTime = new Date();
  const estimatedCompletion = new Date(checkInTime);
  estimatedCompletion.setMinutes(estimatedCompletion.getMinutes() + appointment.duration);

  appointment.status = 'checked_in';
  appointment.checkInTime = checkInTime;
  appointment.estimatedCompletionTime = estimatedCompletion;
  appointment.isLateCheckIn = checkInValidation.isLate;

  // TODO: Enviar notificação ao cliente com previsão de término

  res.json({
    message: 'Check-in realizado com sucesso',
    appointment,
    estimatedCompletionTime: estimatedCompletion,
    isLate: checkInValidation.isLate,
    requiresConfirmation: checkInValidation.requiresConfirmation,
    lateMessage: checkInValidation.message,
  });
});

// Iniciar atendimento
router.post('/:id/start', authenticateToken, (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));

  if (!appointment) {
    return res.status(404).json({ error: 'Agendamento não encontrado' });
  }

  if (appointment.status !== 'checked_in') {
    return res.status(400).json({ error: 'Agendamento precisa estar com check-in realizado' });
  }

  appointment.status = 'in_progress';

  res.json({
    message: 'Atendimento iniciado',
    appointment,
  });
});

// Check-out (pet pronto)
router.post('/:id/check-out', authenticateToken, (req, res) => {
  const { photoUrl, notes } = req.body;
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));

  if (!appointment) {
    return res.status(404).json({ error: 'Agendamento não encontrado' });
  }

  // RN014: Verificar se pode fazer check-out
  const checkOutValidation = canCheckOut(appointment);
  if (!checkOutValidation.allowed) {
    return res.status(400).json({ error: checkOutValidation.reason });
  }

  const checkOutTime = new Date();
  appointment.status = 'completed';
  appointment.checkOutTime = checkOutTime;
  if (photoUrl) appointment.completionPhoto = photoUrl;
  if (notes) appointment.completionNotes = notes;

  // Criar entrada no prontuário automaticamente
  const medicalRecord = {
    petId: appointment.petId,
    type: appointment.service === 'banho' ? 'banho' : 
          appointment.service === 'tosa' ? 'tosa' :
          appointment.service === 'banho_tosa' ? 'banho' : 'outros',
    date: appointment.date,
    description: `Serviço de ${appointment.service} realizado`,
    professionalName: getProfessionalName(appointment.professionalId),
    attachments: photoUrl ? [photoUrl] : [],
  };

  // TODO: Salvar no prontuário
  // TODO: Enviar notificação ao cliente com foto

  res.json({
    message: 'Check-out realizado com sucesso',
    appointment,
    medicalRecord,
  });
});

// Atualizar agendamento
router.put('/:id', authenticateToken, async (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));

  if (!appointment) {
    return res.status(404).json({ error: 'Agendamento não encontrado' });
  }

  // Verificar permissão
  if (appointment.userId && appointment.userId !== req.user.userId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const appointmentIndex = appointments.findIndex(a => a.id === parseInt(req.params.id));

  // Se mudou data/horário, verificar disponibilidade
  if (req.body.date || req.body.time) {
    const newDate = req.body.date || appointment.date;
    const newTime = req.body.time || appointment.time;
    const isAvailable = checkAvailability(newDate, newTime, appointment.service, req.body.professionalId || appointment.professionalId);
    
    if (!isAvailable.available) {
      return res.status(400).json({
        error: 'Novo horário não disponível',
        reason: isAvailable.reason,
      });
    }
  }

  const updated = {
    ...appointments[appointmentIndex],
    ...req.body,
    updatedAt: new Date(),
  };

  await Appointment.update(
    {
      date: updated.date,
      time: updated.time,
      notes: updated.notes,
      professionalId: updated.professionalId,
      status: updated.status,
    },
    { where: { id: updated.id } },
  );

  appointments[appointmentIndex] = updated;

  res.json({
    message: 'Agendamento atualizado com sucesso',
    appointment: appointments[appointmentIndex],
  });
});

// Cancelar agendamento (cliente ou Pet Shop), com justificativa obrigatória
router.delete('/:id', authenticateToken, async (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));

  if (!appointment) {
    return res.status(404).json({ error: 'Agendamento não encontrado' });
  }

  const isCompanyCancel = req.companyId && appointment.companyId === req.companyId;
  const isClientCancel = appointment.userId && appointment.userId === req.user.userId;

  if (!isCompanyCancel && !isClientCancel) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const reason = (req.body && req.body.reason) ? String(req.body.reason).trim() : '';
  if (!reason) {
    return res.status(400).json({ error: 'Justificativa do cancelamento é obrigatória' });
  }

  // Cliente: regras de horário e taxa; Pet Shop: pode cancelar sempre (com justificativa)
  if (!isCompanyCancel) {
    const isManager = ['master', 'manager'].includes(req.user.role);
    const cancelCheck = canCancelAppointment(appointment, isManager);
    if (!cancelCheck.allowed) {
      return res.status(400).json({
        error: cancelCheck.reason,
        requiresManager: cancelCheck.requiresManager,
        hoursUntilAppointment: cancelCheck.hoursUntilAppointment,
      });
    }
  }

  const appointmentIndex = appointments.findIndex(a => a.id === parseInt(req.params.id));
  const cancelCheck = isCompanyCancel ? { canChargeFee: false, feePercentage: 0 } : canCancelAppointment(appointment, ['master', 'manager'].includes(req.user.role));

  appointments[appointmentIndex].status = 'cancelled';
  appointments[appointmentIndex].cancellation_reason = reason;
  appointments[appointmentIndex].cancelled_by = isCompanyCancel ? 'company' : 'client';
  appointments[appointmentIndex].cancelled_at = new Date();
  appointments[appointmentIndex].cancellationFee = cancelCheck.canChargeFee ? cancelCheck.feePercentage : 0;
  appointments[appointmentIndex].cancelledAt = new Date();

  await Appointment.update(
    {
      status: 'cancelled',
      cancellation_reason: appointments[appointmentIndex].cancellation_reason,
      cancelled_by: appointments[appointmentIndex].cancelled_by,
      cancelled_at: appointments[appointmentIndex].cancelled_at,
      cancellationFee: appointments[appointmentIndex].cancellationFee,
    },
    { where: { id: appointments[appointmentIndex].id } },
  );

  res.json({
    message: 'Agendamento cancelado com sucesso',
    cancellationFee: cancelCheck.canChargeFee ? cancelCheck.feePercentage : 0,
    feeMessage: cancelCheck.canChargeFee ? `Pode ser aplicada taxa de ${cancelCheck.feePercentage}% conforme política. Entre em contato para estorno/crédito.` : null,
  });
});

// Obter grade semanal (para dashboard)
router.get('/schedule/week', authenticateToken, (req, res) => {
  const { startDate } = req.query; // formato: YYYY-MM-DD
  
  if (!startDate) {
    return res.status(400).json({ error: 'Data inicial é obrigatória' });
  }

  const start = new Date(startDate);
  const weekAppointments = [];

  // Buscar agendamentos da semana
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayAppointments = appointments.filter(
      a => a.date === dateStr && a.status !== 'cancelled'
    );

    weekAppointments.push({
      date: dateStr,
      dayOfWeek: currentDate.toLocaleDateString('pt-BR', { weekday: 'long' }),
      appointments: dayAppointments,
      count: dayAppointments.length,
    });
  }

  res.json({
    weekStart: startDate,
    schedule: weekAppointments,
  });
});

// Funções auxiliares

function checkAvailability(date, time, service, professionalId) {
  const duration = SERVICE_DURATIONS[service] || 60;
  const timeMinutes = timeToMinutes(time);
  const endMinutes = timeMinutes + duration;

  // Se profissional específico foi solicitado
  if (professionalId) {
    const professional = require('./professionals.routes').getProfessionalById(professionalId);
    if (!professional || !professional.isActive) {
      return { available: false, reason: 'Profissional não disponível' };
    }

    const professionalAppointments = appointments.filter(
      a => a.professionalId === professionalId &&
           a.date === date &&
           a.status !== 'cancelled'
    );

    // Verificar conflitos
    for (const apt of professionalAppointments) {
      const aptStart = timeToMinutes(apt.time);
      const aptEnd = aptStart + apt.duration;

      if ((timeMinutes >= aptStart - 5 && timeMinutes < aptEnd + 5) ||
          (endMinutes > aptStart - 5 && endMinutes <= aptEnd + 5)) {
        return {
          available: false,
          reason: 'Horário conflitante com outro agendamento',
          suggestions: getAlternativeSlots(professional, date, service),
        };
      }
    }

    return { available: true };
  }

  // Buscar qualquer profissional disponível
  const professionals = require('./professionals.routes').professionals || [];
  const availableProfessionals = professionals.filter(p => p.isActive);

  for (const professional of availableProfessionals) {
    const professionalAppointments = appointments.filter(
      a => a.professionalId === professional.id &&
           a.date === date &&
           a.status !== 'cancelled'
    );

    let hasConflict = false;
    for (const apt of professionalAppointments) {
      const aptStart = timeToMinutes(apt.time);
      const aptEnd = aptStart + apt.duration;

      if ((timeMinutes >= aptStart - 5 && timeMinutes < aptEnd + 5) ||
          (endMinutes > aptStart - 5 && endMinutes <= aptEnd + 5)) {
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      return { available: true, suggestedProfessionalId: professional.id };
    }
  }

  return {
    available: false,
    reason: 'Nenhum profissional disponível neste horário',
  };
}

function assignProfessional(service, date, time) {
  const professionals = require('./professionals.routes').professionals || [];
  const availableProfessionals = professionals.filter(p => p.isActive);

  // Ordenar por carga de trabalho (menos agendamentos primeiro)
  const professionalsWithLoad = availableProfessionals.map(professional => {
    const appointmentsCount = appointments.filter(
      a => a.professionalId === professional.id &&
           a.date === date &&
           a.status !== 'cancelled'
    ).length;

    return {
      professional,
      load: appointmentsCount,
    };
  }).sort((a, b) => a.load - b.load);

  // Verificar disponibilidade de cada profissional
  for (const { professional } of professionalsWithLoad) {
    const isAvailable = checkAvailability(date, time, service, professional.id);
    if (isAvailable.available) {
      return professional.id;
    }
  }

  return null;
}

function getAlternativeSlots(professional, date, service) {
  // Retornar horários alternativos próximos
  return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
}

function getProfessionalName(professionalId) {
  const professional = require('./professionals.routes').getProfessionalById(professionalId);
  return professional ? professional.name : 'Não informado';
}

function calculateAvailableSlotsForService(professional, date, existingAppointments, service) {
  const duration = SERVICE_DURATIONS[service] || 60;
  const slots = [];
  const workStart = professional.workSchedule.start;
  const workEnd = professional.workSchedule.end;
  const lunchStart = professional.workSchedule.lunchStart;
  const lunchEnd = professional.workSchedule.lunchEnd;

  const startMinutes = timeToMinutes(workStart);
  const endMinutes = timeToMinutes(workEnd);
  const lunchStartMinutes = timeToMinutes(lunchStart);
  const lunchEndMinutes = timeToMinutes(lunchEnd);

  for (let minutes = startMinutes; minutes <= endMinutes - duration; minutes += 30) {
    if (minutes >= lunchStartMinutes && minutes < lunchEndMinutes) {
      continue;
    }

    const slotTime = minutesToTime(minutes);
    const slotEndMinutes = minutes + duration;

    // Verificar se há conflito
    let hasConflict = false;
    for (const apt of existingAppointments) {
      const aptStart = timeToMinutes(apt.time);
      const aptEnd = aptStart + apt.duration;

      if ((minutes >= aptStart - 5 && minutes < aptEnd + 5) ||
          (slotEndMinutes > aptStart - 5 && slotEndMinutes <= aptEnd + 5)) {
        hasConflict = true;
        break;
      }
    }

    if (!hasConflict) {
      slots.push(slotTime);
    }
  }

  return slots;
}

// Função auxiliar para buscar agendamentos por profissional e data
function getAppointmentsByProfessionalAndDate(professionalId, date) {
  return appointments.filter(
    a => a.professionalId === professionalId &&
         a.date === date &&
         a.status !== 'cancelled'
  );
}

module.exports = router;
module.exports.getAppointmentsByProfessionalAndDate = getAppointmentsByProfessionalAndDate;
module.exports.appointments = appointments;

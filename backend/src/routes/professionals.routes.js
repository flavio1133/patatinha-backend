/**
 * Rotas de profissionais – persistência em PostgreSQL (Sequelize).
 * Cache em memória hidratado do banco para compatibilidade com appointments e companies.
 */
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { Professional, sequelize } = require('../db');

const professionals = [];
const state = { professionalIdCounter: 1 };

async function hydrateProfessionalsFromDatabase() {
  try {
    const rows = await Professional.findAll({ order: [['id', 'ASC']] });
    professionals.length = 0;
    rows.forEach((row) => {
      const plain = row.get({ plain: true });
      professionals.push({
        ...plain,
        workSchedule: plain.workSchedule || plain.work_schedule || { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
        daysOff: plain.daysOff || plain.days_off || [],
        isActive: plain.isActive !== false && plain.is_active !== false,
      });
    });
    const last = professionals[professionals.length - 1];
    state.professionalIdCounter = last ? (last.id || 0) + 1 : 1;
    if (process.env.NODE_ENV === 'development' && process.env.DB_LOGGING === 'true') {
      console.log('📦 Profissionais hidratados do banco:', professionals.length);
    }
  } catch (err) {
    console.error('Erro ao carregar profissionais do banco:', err.message);
  }
}

hydrateProfessionalsFromDatabase();

function toPlain(p) {
  const schedule = p.workSchedule || p.work_schedule || { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' };
  return {
    id: p.id,
    name: p.name,
    email: p.email || null,
    phone: p.phone || null,
    specialties: p.specialties || [],
    averageSpeed: p.averageSpeed ?? p.average_speed ?? 60,
    workSchedule: schedule,
    daysOff: p.daysOff || p.days_off || [],
    isActive: p.isActive !== false && p.is_active !== false,
    companyId: p.companyId || p.company_id || null,
    createdAt: p.createdAt || p.created_at,
    updatedAt: p.updatedAt || p.updated_at,
  };
}

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// Listar todos os profissionais (do banco via cache)
router.get('/', authenticateToken, async (req, res) => {
  try {
    await hydrateProfessionalsFromDatabase();
    const { includeInactive } = req.query;
    let list = professionals;
    if (!includeInactive) {
      list = list.filter((p) => p.isActive !== false && !p.deleted_at);
    }
    res.json({ professionals: list.map(toPlain) });
  } catch (err) {
    console.error('❌ Erro no banco (professionals list):', err.message);
    res.status(500).json({ error: 'Erro ao listar profissionais' });
  }
});

// Obter profissional específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    let p = professionals.find((x) => x.id === id);
    if (!p) {
      const row = await Professional.findByPk(id);
      if (!row) return res.status(404).json({ error: 'Profissional não encontrado' });
      p = row.get({ plain: true });
    }
    res.json(toPlain(p));
  } catch (err) {
    console.error('❌ Erro no banco (professional get):', err.message);
    res.status(500).json({ error: 'Erro ao buscar profissional' });
  }
});

// Criar novo profissional (persiste no banco)
router.post('/', [
  authenticateToken,
  requireRole('manager', 'master', 'super_admin', 'owner'),
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('specialties').optional().isArray(),
  validate,
], async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialties = [],
      averageSpeed = 60,
      workSchedule = { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' },
      daysOff = [],
      isActive = true,
      companyId,
    } = req.body;

    const payload = {
      name: name.trim(),
      email: (email && email.trim()) || null,
      phone: (phone && phone.trim()) || null,
      specialties: Array.isArray(specialties) ? specialties : [],
      averageSpeed: parseInt(averageSpeed, 10) || 60,
      workSchedule: workSchedule || {},
      daysOff: Array.isArray(daysOff) ? daysOff : [],
      isActive: !!isActive,
      companyId: companyId || null,
    };
    if (password && password.trim()) {
      payload.password_hash = await bcrypt.hash(password.trim(), 10);
    }

    const created = await Professional.create(payload);
    const plain = created.get({ plain: true });
    professionals.push(plain);
    state.professionalIdCounter = Math.max(state.professionalIdCounter, (plain.id || 0) + 1);

    if (process.env.NODE_ENV === 'development') {
      console.log('📦 Salvando no banco (professional):', plain.id);
    }
    res.status(201).json({
      message: 'Profissional cadastrado com sucesso',
      professional: toPlain(plain),
    });
  } catch (err) {
    console.error('❌ Erro no banco (professional create):', err.message);
    res.status(500).json({ error: err.message || 'Erro ao cadastrar profissional' });
  }
});

// Atualizar profissional
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await Professional.findByPk(id);
    if (!row) return res.status(404).json({ error: 'Profissional não encontrado' });

    const allowed = ['name', 'email', 'phone', 'specialties', 'averageSpeed', 'workSchedule', 'daysOff', 'isActive', 'companyId'];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) {
        if (key === 'workSchedule') updates.workSchedule = req.body.workSchedule;
        else if (key === 'daysOff') updates.daysOff = req.body.daysOff;
        else if (key === 'averageSpeed') updates.averageSpeed = parseInt(req.body.averageSpeed, 10) || 60;
        else updates[key] = req.body[key];
      }
    });
    if (req.body.password && req.body.password.trim()) {
      updates.password_hash = await bcrypt.hash(req.body.password.trim(), 10);
    }

    await row.update(updates);
    const idx = professionals.findIndex((p) => p.id === id);
    const plain = row.get({ plain: true });
    if (idx >= 0) professionals[idx] = plain;
    else professionals.push(plain);

    res.json({ message: 'Profissional atualizado com sucesso', professional: toPlain(plain) });
  } catch (err) {
    console.error('❌ Erro no banco (professional update):', err.message);
    res.status(500).json({ error: err.message || 'Erro ao atualizar profissional' });
  }
});

// Deletar profissional (soft delete: isActive = false)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await Professional.findByPk(id);
    if (!row) return res.status(404).json({ error: 'Profissional não encontrado' });

    await row.update({ isActive: false });
    const idx = professionals.findIndex((p) => p.id === id);
    if (idx >= 0) professionals[idx].isActive = false;

    res.json({ message: 'Profissional removido com sucesso' });
  } catch (err) {
    console.error('❌ Erro no banco (professional delete):', err.message);
    res.status(500).json({ error: 'Erro ao remover profissional' });
  }
});

// Disponibilidade do profissional em uma data
function timeToMinutes(time) {
  const [h, m] = (time || '00:00').split(':').map(Number);
  return h * 60 + (m || 0);
}
function minutesToTime(min) {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}
function isSlotOccupied(slotTime, appointments) {
  return appointments.some((apt) => {
    const aptStart = timeToMinutes(apt.time);
    const aptEnd = aptStart + (apt.duration || 60);
    const slotMin = timeToMinutes(slotTime);
    return slotMin >= aptStart - 5 && slotMin < aptEnd + 5;
  });
}

router.get('/:id/availability', authenticateToken, (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Data é obrigatória' });

  const id = parseInt(req.params.id, 10);
  const professional = professionals.find((p) => p.id === id);
  if (!professional) return res.status(404).json({ error: 'Profissional não encontrado' });

  let getAppointmentsByProfessionalAndDate;
  try {
    getAppointmentsByProfessionalAndDate = require('./appointments.routes').getAppointmentsByProfessionalAndDate;
  } catch {
    getAppointmentsByProfessionalAndDate = () => [];
  }
  const existingAppointments = getAppointmentsByProfessionalAndDate(id, date);
  const schedule = professional.workSchedule || professional.work_schedule || { start: '08:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00' };
  const startMinutes = timeToMinutes(schedule.start);
  const endMinutes = timeToMinutes(schedule.end);
  const lunchStart = timeToMinutes(schedule.lunchStart || '12:00');
  const lunchEnd = timeToMinutes(schedule.lunchEnd || '13:00');

  const availableSlots = [];
  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    if (minutes >= lunchStart && minutes < lunchEnd) continue;
    const slotTime = minutesToTime(minutes);
    availableSlots.push({
      time: slotTime,
      available: !isSlotOccupied(slotTime, existingAppointments),
    });
  }

  res.json({
    professional: professional.name,
    date,
    availableSlots,
    appointments: existingAppointments.length,
  });
});

function getProfessionalById(id) {
  return professionals.find((p) => p.id === id);
}

module.exports = router;
module.exports.getProfessionalById = getProfessionalById;
module.exports.professionals = professionals;
module.exports.professionalsState = state;

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { validateCnpj, stripCnpj, formatCnpj } = require('../utils/cnpj-validator');
const { generateUniqueInvitationCode } = require('../utils/codeGenerator');
const { invitationCodes, nextCodeId } = require('../data/invitation-codes.data');
const { Company, CompanySettings, CompanyEmployee, InvitationCode, ClientCompany, Customer } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'patatinha-secret-key-change-in-production';

// CPF helpers (para cadastros de Pessoa Física)
function stripCpf(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

function validateCpfDigits(cpf) {
  const s = stripCpf(cpf);
  if (s.length !== 11) return false;
  if (/^(\d)\1+$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(s.charAt(i), 10) * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) d1 = 0;
  if (parseInt(s.charAt(9), 10) !== d1) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(s.charAt(i), 10) * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) d2 = 0;
  if (parseInt(s.charAt(10), 10) !== d2) return false;
  return true;
}

// Middleware de autenticação da empresa (dono ou funcionário)
function authCompany(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'company') {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    req.companyId = decoded.companyId || decoded.id;
    req.companyRole = decoded.role || 'owner';
    req.isCompanyOwner = decoded.role === 'owner' || !decoded.companyId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// Middleware: apenas dono da empresa
function requireCompanyOwner(req, res, next) {
  if (!req.isCompanyOwner) {
    return res.status(403).json({ error: 'Apenas o gestor da empresa pode realizar esta ação' });
  }
  next();
}

// Funções da empresa (funcionários)
const COMPANY_ROLES = ['vendedor', 'atendente', 'tosador', 'gerente_loja'];

// Dados em memória usados como cache (populados a partir do banco)
const companies = [];
const companySettings = [];
const companyEmployees = [];
const companiesState = { companyIdCounter: 1, employeeIdCounter: 1 };

async function hydrateCompaniesFromDatabase() {
  try {
    const rows = await Company.findAll({
      include: [
        { model: CompanySettings, as: 'settings' },
        { model: CompanyEmployee, as: 'employees' },
      ],
      order: [['created_at', 'ASC']],
    });

    companies.length = 0;
    companySettings.length = 0;
    companyEmployees.length = 0;

    if (rows.length === 0) {
      // Primeiro run: criar empresa demo no banco
      const now = new Date();
      const trialEnd = new Date(now);
      trialEnd.setDate(trialEnd.getDate() + 15);

      const demoCompany = await Company.create({
        id: 'comp_1',
        person_type: 'pj',
        name: 'Patatinha Recife',
        legal_name: 'Patatinha Pet Shop Ltda',
        cnpj: '11.222.333/0001-81',
        email: 'contato@patatinha.com',
        password_hash: bcrypt.hashSync('demo123', 10),
        phone: '(81) 3333-4444',
        whatsapp: '(81) 99999-5555',
        address: 'Rua do Pet, 100',
        address_number: '100',
        complement: 'Sala 1',
        neighborhood: 'Boa Viagem',
        city: 'Recife',
        state: 'PE',
        zip_code: '51020010',
        logo_url: null,
        website: 'https://patatinha.com.br',
        instagram: '@patatinha.recife',
        trial_start: now,
        trial_end: trialEnd,
        subscription_status: 'trial',
        subscription_plan_id: null,
        owner_is_active: true,
        payment_customer_id: null,
        payment_method: null,
      });

      await CompanySettings.create({
        id: 'settings_comp_1',
        company_id: demoCompany.id,
        opening_hours: {
          monday: '08:00-18:00',
          tuesday: '08:00-18:00',
          wednesday: '08:00-18:00',
          thursday: '08:00-18:00',
          friday: '08:00-18:00',
          saturday: '09:00-13:00',
          sunday: 'Fechado',
        },
        services_offered: ['banho', 'tosa', 'banho_tosa', 'veterinario', 'vacina'],
        enabled_modules: {
          pdv: true,
          finance: true,
          inventory: true,
          reports: true,
        },
      });

      const now2 = new Date();
      await CompanyEmployee.bulkCreate([
        { id: 'emp_1', company_id: demoCompany.id, name: 'João Vendedor', cpf: '12345678901', email: 'vendedor@patatinha.com', password_hash: bcrypt.hashSync('vendedor123', 10), role: 'vendedor', is_active: true, created_at: now2 },
        { id: 'emp_2', company_id: demoCompany.id, name: 'Maria Atendente', cpf: '98765432109', email: 'atendente@patatinha.com', password_hash: bcrypt.hashSync('atendente123', 10), role: 'atendente', is_active: true, created_at: now2 },
      ]);

      rows.push(await Company.findOne({
        where: { id: demoCompany.id },
        include: [
          { model: CompanySettings, as: 'settings' },
          { model: CompanyEmployee, as: 'employees' },
        ],
      }));
    }

    for (const row of rows) {
      const plain = row.get({ plain: true });
      const { settings, employees, ...company } = plain;
      companies.push(company);
      if (settings) {
        companySettings.push(settings);
      }
      if (employees && employees.length) {
        companyEmployees.push(...employees);
      }
    }

    // Atualizar contadores para próximos IDs "emp_n" e "comp_n"
    const lastCompany = companies[companies.length - 1];
    const lastEmp = companyEmployees[companyEmployees.length - 1];
    const lastCompNum = lastCompany?.id?.startsWith('comp_')
      ? parseInt(lastCompany.id.split('_')[1], 10)
      : 1;
    const lastEmpNum = lastEmp?.id?.startsWith('emp_')
      ? parseInt(lastEmp.id.split('_')[1], 10)
      : 1;
    companiesState.companyIdCounter = Number.isNaN(lastCompNum) ? 1 : lastCompNum + 1;
    companiesState.employeeIdCounter = Number.isNaN(lastEmpNum) ? 1 : lastEmpNum + 1;
  } catch (err) {
    console.error('Erro ao carregar empresas do banco:', err.message);
  }
}

// Carregar empresas ao subir o módulo (não bloqueia o servidor)
hydrateCompaniesFromDatabase();

function generateId() {
  return 'comp_' + companiesState.companyIdCounter++;
}

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Storage para upload de logo (pasta uploads/companies)
const uploadDir = path.join(__dirname, '../../uploads/companies');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `logo_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/i;
    const ext = path.extname(file.originalname).slice(1);
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens (jpeg, jpg, png, gif, webp)'));
    }
  },
});

// Dados públicos da empresa (para app cliente vinculado)
// Lê do banco para retornar sempre serviços, dias e horários atualizados (sincronização petshop → cliente)
router.get('/:id/public', async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id, {
      attributes: ['id', 'name', 'logo_url', 'phone', 'whatsapp', 'address', 'address_number'],
    });
    if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });
    const settings = await CompanySettings.findOne({
      where: { company_id: req.params.id },
      attributes: ['services_offered', 'opening_hours'],
    });
    const plain = company.get({ plain: true });
    const addr = [plain.address, plain.address_number].filter(Boolean).join(', ');
    res.json({
      id: plain.id,
      name: plain.name,
      logo_url: plain.logo_url,
      phone: plain.phone,
      whatsapp: plain.whatsapp,
      address: addr || null,
      services_offered: settings?.services_offered ?? [],
      opening_hours: settings?.opening_hours ?? {},
    });
  } catch (err) {
    console.error('Erro ao buscar empresa pública:', err.message);
    res.status(500).json({ error: 'Erro ao carregar dados da empresa' });
  }
});

// Lista de profissionais da empresa (para cliente escolher no agendamento)
router.get('/:id/professionals', (req, res) => {
  const company = companies.find((c) => c.id === req.params.id);
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });
  const { professionals } = require('./professionals.routes');
  const active = (professionals || []).filter((p) => p.isActive && !p.deleted_at);
  res.json({ professionals: active.map((p) => ({ id: p.id, name: p.name })) });
});

// Disponibilidade de horários para agendamento (público - cliente vinculado usa companyId)
router.get('/:id/availability', (req, res) => {
  const company = companies.find((c) => c.id === req.params.id);
  if (!company) return res.status(404).json({ error: 'Empresa não encontrada' });
  const { date, service } = req.query;
  if (!date || !service) {
    return res.status(400).json({ error: 'Data e serviço são obrigatórios' });
  }
  const { professionals } = require('./professionals.routes');
  const { appointments } = require('./appointments.routes');
  const SERVICE_DURATIONS = { banho: 60, tosa: 90, banho_tosa: 120, veterinario: 30, hotel: 60, outros: 60 };
  const timeToMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const minutesToTime = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = dayNames[new Date(date + 'T12:00:00').getDay()];

  const active = (professionals || []).filter((p) => p.isActive);
  const availability = active
    .filter((p) => {
      const daysOff = p.daysOff || [];
      return !daysOff.includes(dayOfWeek);
    })
    .map((professional) => {
      const professionalAppointments = (appointments || []).filter(
        (a) => a.professionalId === professional.id && a.date === date && a.status !== 'cancelled'
      );
      const duration = SERVICE_DURATIONS[service] || 60;
      const workStart = (professional.workSchedule || {}).start || '08:00';
      const workEnd = (professional.workSchedule || {}).end || '18:00';
      const lunchStart = (professional.workSchedule || {}).lunchStart || '12:00';
      const lunchEnd = (professional.workSchedule || {}).lunchEnd || '13:00';
      const startMinutes = timeToMinutes(workStart);
      const endMinutes = timeToMinutes(workEnd);
      const lunchStartMinutes = timeToMinutes(lunchStart);
      const lunchEndMinutes = timeToMinutes(lunchEnd);
      const slots = [];
      for (let minutes = startMinutes; minutes <= endMinutes - duration; minutes += 30) {
        if (minutes >= lunchStartMinutes && minutes < lunchEndMinutes) continue;
        const slotTime = minutesToTime(minutes);
        const slotEndMinutes = minutes + duration;
        const hasConflict = professionalAppointments.some((apt) => {
          const aptStart = timeToMinutes(apt.time);
          const aptEnd = aptStart + (apt.duration || 60);
          return (minutes >= aptStart - 5 && minutes < aptEnd + 5) ||
            (slotEndMinutes > aptStart - 5 && slotEndMinutes <= aptEnd + 5);
        });
        if (!hasConflict) slots.push(slotTime);
      }
      return {
        professionalId: professional.id,
        professionalName: professional.name,
        availableSlots: slots,
        currentAppointments: professionalAppointments.length,
      };
    });

  res.json({ date, service, availability });
});

// Validar CNPJ em tempo real
router.get('/validate-cnpj/:cnpj', (req, res) => {
  const cnpj = stripCnpj(req.params.cnpj);
  const result = validateCnpj(cnpj);
  if (!result.valid) {
    return res.json({ valid: false, message: result.message });
  }
  const exists = companies.some((c) => stripCnpj(c.cnpj) === cnpj);
  if (exists) {
    return res.json({ valid: false, message: 'CNPJ já cadastrado' });
  }
  res.json({ valid: true, message: result.message, formatted: result.formatted });
});

// Login da empresa (dono ou funcionário)
router.post('/login', [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
], validate, async (req, res) => {
  const { email, password } = req.body;
  const emailLower = email.toLowerCase();

  // 1. Tentar login como dono da empresa
  const company = companies.find((c) => c.email.toLowerCase() === emailLower);
  if (company && company.password_hash) {
    if (company.owner_is_active === false) {
      return res.status(403).json({ error: 'Gestor inativo. Entre em contato com o suporte.' });
    }
    const valid = await bcrypt.compare(password, company.password_hash);
    if (valid) {
      const token = jwt.sign(
        { id: company.id, type: 'company', role: 'owner' },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      const { password_hash, payment_method, ...companySafe } = company;
      return res.json({ token, company: companySafe, role: 'owner' });
    }
  }

  // 2. Tentar login como funcionário da empresa
  const emp = companyEmployees.find((e) => e.email.toLowerCase() === emailLower && e.is_active);
  if (emp) {
    const valid = await bcrypt.compare(password, emp.password_hash);
    if (valid) {
      const token = jwt.sign(
        { id: emp.id, companyId: emp.company_id, type: 'company', role: emp.role },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      const companyData = companies.find((c) => c.id === emp.company_id);
      const { password_hash, ...empSafe } = emp;
      return res.json({ token, company: companyData, employee: empSafe, role: emp.role });
    }
  }

  return res.status(401).json({ error: 'E-mail ou senha inválidos' });
});

// Cadastro de empresa (público)
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Nome fantasia é obrigatório'),
  body('legal_name').trim().notEmpty().withMessage('Razão social é obrigatória'),
  body('person_type').optional().isIn(['pf', 'pj']).withMessage('Tipo de pessoa inválido'),
  body('cnpj').optional().trim(),
  body('cpf').optional().trim(),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').trim().isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('phone').trim().notEmpty().withMessage('Telefone é obrigatório'),
  body('address').trim().notEmpty().withMessage('Endereço é obrigatório'),
  body('address_number').trim().notEmpty().withMessage('Número é obrigatório'),
  body('neighborhood').trim().notEmpty().withMessage('Bairro é obrigatório'),
  body('city').trim().notEmpty().withMessage('Cidade é obrigatória'),
  body('state').trim().isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  body('zip_code').trim().notEmpty().withMessage('CEP é obrigatório'),
], validate, async (req, res) => {
  const personType = (req.body.person_type || 'pj').toLowerCase();
  const cnpjClean = stripCnpj(req.body.cnpj || '');
  const cpfClean = stripCpf(req.body.cpf || '');

  if (personType === 'pj') {
    if (!cnpjClean) {
      return res.status(400).json({ error: 'CNPJ é obrigatório para Pessoa Jurídica' });
    }
    const cnpjCheck = validateCnpj(cnpjClean);
    if (!cnpjCheck.valid) {
      return res.status(400).json({ error: cnpjCheck.message });
    }
    if (companies.some((c) => stripCnpj(c.cnpj) === cnpjClean)) {
      return res.status(400).json({ error: 'CNPJ já cadastrado' });
    }
  } else if (personType === 'pf') {
    if (!cpfClean) {
      return res.status(400).json({ error: 'CPF é obrigatório para Pessoa Física' });
    }
    if (!validateCpfDigits(cpfClean)) {
      return res.status(400).json({ error: 'CPF inválido' });
    }
    if (companies.some((c) => c.person_type === 'pf' && stripCpf(c.cpf) === cpfClean)) {
      return res.status(400).json({ error: 'CPF já cadastrado' });
    }
  }

  if (companies.some((c) => c.email.toLowerCase() === req.body.email.trim().toLowerCase())) {
    return res.status(400).json({ error: 'E-mail já cadastrado' });
  }

  const password_hash = await bcrypt.hash(req.body.password.trim(), 10);
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 15);

  const companyId = generateId();
  const company = {
    id: companyId,
    person_type: personType,
    cpf: personType === 'pf' ? cpfClean : null,
    name: req.body.name.trim(),
    password_hash,
    legal_name: req.body.legal_name.trim(),
    cnpj: personType === 'pj' ? formatCnpj(cnpjClean) : null,
    email: req.body.email.trim(),
    phone: req.body.phone.trim(),
    whatsapp: req.body.whatsapp?.trim() || null,
    address: req.body.address.trim(),
    address_number: req.body.address_number.trim(),
    complement: req.body.complement?.trim() || null,
    neighborhood: req.body.neighborhood.trim(),
    city: req.body.city.trim(),
    state: req.body.state.trim().toUpperCase(),
    zip_code: req.body.zip_code.trim().replace(/\D/g, ''),
    logo_url: req.body.logo_url || null,
    website: req.body.website?.trim() || null,
    instagram: req.body.instagram?.trim() || null,
    owner_is_active: true,
    trial_start: now,
    trial_end: trialEnd,
    subscription_status: 'trial',
    subscription_plan_id: null,
    payment_customer_id: null,
    payment_method: null,
    created_at: now,
    updated_at: now,
  };

  // Persistir no banco
  await Company.create(company);

  const settings = {
    id: `settings_${companyId}`,
    company_id: companyId,
    opening_hours: req.body.opening_hours || {},
    services_offered: req.body.services_offered || ['banho', 'tosa', 'banho_tosa', 'veterinario', 'vacina'],
    enabled_modules: {
      pdv: true,
      finance: true,
      inventory: true,
      reports: true,
    },
    employees: [],
    created_at: now,
    updated_at: now,
  };

  await CompanySettings.create({
    id: settings.id,
    company_id: settings.company_id,
    opening_hours: settings.opening_hours,
    services_offered: settings.services_offered,
    enabled_modules: settings.enabled_modules,
  });

  // Atualizar cache em memória
  companies.push(company);
  companySettings.push(settings);

  const token = jwt.sign(
    { id: companyId, type: 'company', role: 'owner' },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  const { password_hash: _ph, payment_method, ...companySafe } = company;
  res.status(201).json({
    message: 'Empresa cadastrada com sucesso. Período de teste: 15 dias.',
    token,
    company: companySafe,
    trial_end: trialEnd,
  });
});

// --- Funcionários da empresa (apenas dono pode criar/excluir) ---
router.get('/:id/employees', authCompany, (req, res) => {
  if (req.params.id !== req.companyId) return res.status(403).json({ error: 'Acesso negado' });
  const list = companyEmployees.filter((e) => e.company_id === req.companyId && e.is_active);
  const safe = list.map(({ password_hash, ...e }) => e);
  res.json(safe);
});

router.post('/:id/employees', authCompany, requireCompanyOwner, [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('cpf').trim().notEmpty().withMessage('CPF é obrigatório'),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').trim().isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role').isIn(COMPANY_ROLES).withMessage('Função inválida'),
], validate, async (req, res) => {
  if (req.params.id !== req.companyId) return res.status(403).json({ error: 'Acesso negado' });
  const { name, cpf, email, password, role } = req.body;
  const exists = companyEmployees.some((e) => e.email.toLowerCase() === email.toLowerCase() && e.company_id === req.companyId && e.is_active);
  if (exists) return res.status(400).json({ error: 'E-mail já cadastrado nesta empresa' });
  const password_hash = await bcrypt.hash(password.trim(), 10);
  const empId = 'emp_' + companiesState.employeeIdCounter++;
  const emp = {
    id: empId,
    company_id: req.companyId,
    name: name.trim(),
    cpf: cpf.replace(/\D/g, ''),
    email: email.trim().toLowerCase(),
    password_hash,
    role,
    is_active: true,
    created_at: new Date(),
  };

  // Persistir no banco
  await CompanyEmployee.create(emp);

  // Atualizar cache
  companyEmployees.push(emp);

  const { password_hash: _ph, ...safe } = emp;
  res.status(201).json({ message: 'Funcionário cadastrado', employee: safe });
});

router.delete('/:id/employees/:empId', authCompany, requireCompanyOwner, (req, res) => {
  if (req.params.id !== req.companyId) return res.status(403).json({ error: 'Acesso negado' });
  const idx = companyEmployees.findIndex((e) => e.id === req.params.empId && e.company_id === req.companyId);
  if (idx === -1) return res.status(404).json({ error: 'Funcionário não encontrado' });
  companyEmployees[idx].is_active = false;

  // Atualizar no banco (soft delete)
  CompanyEmployee.update(
    { is_active: false },
    { where: { id: companyEmployees[idx].id } },
  ).catch((err) => {
    console.error('Erro ao desativar funcionário no banco:', err.message);
  });

  res.json({ message: 'Funcionário excluído' });
});

// --- Códigos de convite ---
router.post('/:id/invitation-codes', authCompany, requireCompanyOwner, async (req, res) => {
  if (req.params.id !== req.companyId) return res.status(403).json({ error: 'Acesso negado' });
  try {
    const code = generateUniqueInvitationCode(invitationCodes, 8);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const inv = {
      id: nextCodeId(),
      company_id: req.companyId,
      code,
      client_id: null,
      status: 'available',
      expires_at: expiresAt,
      used_at: null,
      created_at: new Date(),
    };

    // Persistir no banco
    await InvitationCode.create(inv);

    // Atualizar cache em memória
    invitationCodes.push(inv);

    res.status(201).json({ message: 'Código gerado', invitation: inv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/invitation-codes', authCompany, async (req, res) => {
  if (req.params.id !== req.companyId) return res.status(403).json({ error: 'Acesso negado' });
  const status = req.query.status;
  const fullList = invitationCodes.filter((c) => c.company_id === req.companyId);
  let list = fullList;
  if (status) list = list.filter((c) => c.status === status);
  list = list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Enriquecer com nome/e-mail do cliente quando houver vínculo (Customer ou users)
  const { users: authUsers } = require('./auth.routes');
  const enriched = await Promise.all(list.map(async (inv) => {
    if (inv.client_id == null) return inv;
    const cid = typeof inv.client_id === 'string' ? parseInt(inv.client_id, 10) : inv.client_id;
    try {
      const customer = await Customer.findOne({ where: { userId: cid } });
      if (customer) {
        const plain = customer.get({ plain: true });
        return { ...inv, client_name: plain.name, client_email: plain.email };
      }
      const u = authUsers.find((x) => x.id === cid);
      if (u) return { ...inv, client_name: u.name || 'Cliente', client_email: u.email || null };
      return inv;
    } catch {
      return inv;
    }
  }));

  const stats = {
    total: fullList.length,
    available: fullList.filter((c) => c.status === 'available').length,
    used: fullList.filter((c) => c.status === 'used').length,
    expired: fullList.filter((c) => c.status === 'expired').length,
  };
  res.json({ codes: enriched, stats });
});

router.post('/:id/invitation-codes/:code/resend', authCompany, requireCompanyOwner, (req, res) => {
  if (req.params.id !== req.companyId) return res.status(403).json({ error: 'Acesso negado' });
  const code = req.params.code.toUpperCase();
  const inv = invitationCodes.find((c) => c.company_id === req.companyId && c.code.toUpperCase() === code);
  if (!inv) return res.status(404).json({ error: 'Código não encontrado' });
  if (inv.status !== 'available') {
    return res.status(400).json({ error: 'Apenas códigos disponíveis podem ser reenviados' });
  }
  const company = companies.find((c) => c.id === req.companyId);
  let phone = (company?.whatsapp || company?.phone || '').replace(/\D/g, '');
  if (!phone) phone = '5581999995555';
  else if (!phone.startsWith('55')) phone = '55' + phone;
  const msg = encodeURIComponent(`Seu código de acesso ao app: ${inv.code}\nDigite no app para se vincular à nossa pet shop!`);
  res.json({
    message: 'Link para compartilhar gerado',
    whatsapp_url: `https://wa.me/${phone}?text=${msg}`,
    code: inv.code,
  });
});

router.delete('/:id/invitation-codes/:code', authCompany, requireCompanyOwner, (req, res) => {
  if (req.params.id !== req.companyId) return res.status(403).json({ error: 'Acesso negado' });
  const code = req.params.code.toUpperCase();
  const idx = invitationCodes.findIndex((c) => c.company_id === req.companyId && c.code.toUpperCase() === code);
  if (idx === -1) return res.status(404).json({ error: 'Código não encontrado' });
  if (invitationCodes[idx].status !== 'available') {
    return res.status(400).json({ error: 'Apenas códigos disponíveis podem ser excluídos' });
  }
  invitationCodes.splice(idx, 1);
  res.json({ message: 'Código excluído' });
});

// Obter empresa por ID (requer autenticação)
router.get('/:id', authCompany, (req, res) => {
  const idToFetch = req.params.id === 'me' ? req.companyId : req.params.id;
  if (idToFetch !== req.companyId) {
    return res.status(403).json({ error: 'Acesso negado a esta empresa' });
  }
  const company = companies.find((c) => c.id === idToFetch);
  if (!company) {
    return res.status(404).json({ error: 'Empresa não encontrada' });
  }
  const settings = companySettings.find((s) => s.company_id === company.id);
  const { password_hash: _ph, payment_method, ...companySafe } = company;
  res.json({ ...companySafe, settings: settings || {} });
});

// Atualizar configurações da empresa (horários e serviços disponíveis para clientes)
// Persiste no banco para que o cliente (GET /public) receba sempre dados atualizados
router.put('/:id/settings', authCompany, requireCompanyOwner, async (req, res) => {
  if (req.params.id !== req.companyId) return res.status(403).json({ error: 'Acesso negado' });
  const idx = companySettings.findIndex((s) => s.company_id === req.companyId);
  if (idx === -1) return res.status(404).json({ error: 'Configurações não encontradas' });
  const updates = {};
  if (req.body.opening_hours != null) {
    companySettings[idx].opening_hours = req.body.opening_hours;
    updates.opening_hours = req.body.opening_hours;
  }
  if (req.body.services_offered != null) {
    companySettings[idx].services_offered = req.body.services_offered;
    updates.services_offered = req.body.services_offered;
  }
  companySettings[idx].updated_at = new Date();
  try {
    const settingsId = companySettings[idx].id;
    if (settingsId && Object.keys(updates).length > 0) {
      await CompanySettings.update(updates, { where: { id: settingsId } });
    }
  } catch (err) {
    console.error('Erro ao persistir configurações no banco:', err.message);
  }
  res.json({ message: 'Configurações atualizadas', settings: companySettings[idx] });
});

// Atualizar empresa (apenas dono)
router.put('/:id', authCompany, requireCompanyOwner, [
  body('name').optional().trim().notEmpty(),
  body('legal_name').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
], validate, (req, res) => {
  if (req.params.id !== req.companyId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const idx = companies.findIndex((c) => c.id === req.companyId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Empresa não encontrada' });
  }
  const allowed = ['name', 'legal_name', 'email', 'phone', 'whatsapp', 'address', 'address_number', 'complement', 'neighborhood', 'city', 'state', 'zip_code', 'website', 'instagram'];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) {
      companies[idx][key] = req.body[key];
    }
  });
  companies[idx].updated_at = new Date();
  const { password_hash: _ph, payment_method, ...companySafe } = companies[idx];
  res.json({ message: 'Empresa atualizada', company: companySafe });
});

// Upload de logo (apenas dono)
router.post('/:id/logo', authCompany, requireCompanyOwner, upload.single('logo'), (req, res) => {
  if (req.params.id !== req.companyId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  const idx = companies.findIndex((c) => c.id === req.companyId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Empresa não encontrada' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  const logoPath = `/uploads/companies/${req.file.filename}`;
  companies[idx].logo_url = logoPath;
  companies[idx].updated_at = new Date();
  res.json({ message: 'Logo atualizado', logo_url: logoPath });
});

module.exports = router;
module.exports.companies = companies;
module.exports.companySettings = companySettings;
module.exports.companyEmployees = companyEmployees;
module.exports.companiesState = companiesState;

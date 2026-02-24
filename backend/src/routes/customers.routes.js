const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { users } = require('./auth.routes');
const { logAudit } = require('../services/audit.service');

// TODO: Substituir por conexão com banco de dados
// Estrutura de dados em memória para desenvolvimento
const customers = [];
const customersState = { customerIdCounter: 1 };

// Cliente fictício ligado ao login cliente@teste.com
// Útil para cenários de demonstração (empresa + cliente real)
const demoCustomer = {
  id: customersState.customerIdCounter++,
  name: 'Cliente Teste Patatinha',
  phone: '(81) 98888-0000',
  email: 'cliente@teste.com',
  address: 'Av. Boa Viagem, 123 - Boa Viagem, Recife - PE',
  notes: 'Cliente de demonstração para testes da plataforma.',
  photo: null,
  userId: 5, // userId do cliente@teste.com (seed-users) para ver agendamentos na área do cliente
  is_active: true,
  deleted_at: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};
customers.push(demoCustomer);

// Middleware de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar todos os clientes (com busca e filtros)
router.get('/', authenticateToken, (req, res) => {
  const { search, phone, includeInactive } = req.query;
  let filteredCustomers = [...customers];

  // Por padrão ocultar inativos (soft delete); relatórios podem usar includeInactive=true
  if (!includeInactive) {
    filteredCustomers = filteredCustomers.filter(c => c.is_active !== false);
  }

  // Busca por nome ou telefone
  if (search) {
    const searchLower = search.toLowerCase();
    filteredCustomers = filteredCustomers.filter(
      c => c.name.toLowerCase().includes(searchLower) ||
           c.phone?.includes(search) ||
           c.email?.toLowerCase().includes(searchLower)
    );
  }

  // Filtro por telefone específico
  if (phone) {
    filteredCustomers = filteredCustomers.filter(c => c.phone === phone);
  }

  // Incluir contagem de pets para cada cliente
  const customersWithPetsCount = filteredCustomers.map(customer => {
    const petsCount = require('./pets.routes').getPetsByCustomerId(customer.id).length;
    return { ...customer, petsCount };
  });

  res.json({ customers: customersWithPetsCount });
});

// Obter cliente específico com todos os dados
router.get('/:id', authenticateToken, (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  
  if (!customer) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  // Buscar pets do cliente
  const pets = require('./pets.routes').getPetsByCustomerId(customer.id);
  
  res.json({
    ...customer,
    pets,
  });
});

// Criar novo cliente (e opcionalmente usuário vinculado com senha padrão 123456)
router.post('/', [
  authenticateToken,
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('phone').trim().notEmpty().withMessage('Telefone é obrigatório'),
  body('email').optional().isEmail().withMessage('E-mail inválido'),
  validate
], (req, res) => {
  const { name, phone, email, address, notes } = req.body;

  // Verificar se já existe cliente com mesmo telefone
  const existingCustomer = customers.find(c => c.phone === phone);
  if (existingCustomer) {
    return res.status(400).json({ error: 'Já existe um cliente com este telefone' });
  }

  // Se tiver e-mail, garantir que exista (ou reutilizar) um usuário de login com senha padrão 123456
  let userId = null;
  if (email) {
    const emailLower = email.trim().toLowerCase();
    let existingUser = users.find(u => u.email && u.email.toLowerCase() === emailLower);

    if (!existingUser) {
      const hashedPassword = bcrypt.hashSync('123456', 10);
      const newUser = {
        id: users.length + 1,
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'customer',
        createdAt: new Date(),
      };
      users.push(newUser);
      userId = newUser.id;
    } else {
      userId = existingUser.id;
    }
  }

  const newCustomer = {
    id: customersState.customerIdCounter++,
    name,
    phone,
    email: email || null,
    address: address || null,
    notes: notes || null,
    userId,
    photo: null,
    is_active: true,
    deleted_at: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  customers.push(newCustomer);
  res.status(201).json({
    message: 'Cliente cadastrado com sucesso',
    customer: newCustomer,
  });
});

// Atualizar cliente
router.put('/:id', [
  authenticateToken,
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  validate
], (req, res) => {
  const customerIndex = customers.findIndex(c => c.id === parseInt(req.params.id));

  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  // Verificar se telefone já está em uso por outro cliente
  if (req.body.phone) {
    const existingCustomer = customers.find(
      c => c.phone === req.body.phone && c.id !== parseInt(req.params.id)
    );
    if (existingCustomer) {
      return res.status(400).json({ error: 'Este telefone já está cadastrado para outro cliente' });
    }
  }

  customers[customerIndex] = {
    ...customers[customerIndex],
    ...req.body,
    updatedAt: new Date(),
  };

  res.json({
    message: 'Cliente atualizado com sucesso',
    customer: customers[customerIndex],
  });
});

// Desativar cliente (soft delete) – apenas Gestor ou Super Admin; motivo obrigatório
router.delete('/:id', [
  authenticateToken,
  requireRole('master', 'manager', 'super_admin'),
  body('reason').trim().notEmpty().withMessage('Motivo da desativação é obrigatório'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const customerIndex = customers.findIndex(c => c.id === parseInt(req.params.id));

  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  const customer = customers[customerIndex];
  if (customer.is_active === false) {
    return res.status(400).json({ error: 'Cliente já está desativado' });
  }

  const reason = req.body.reason.trim();

  const oldSnapshot = { ...customer };
  customers[customerIndex].is_active = false;
  customers[customerIndex].deleted_at = new Date();
  customers[customerIndex].updatedAt = new Date();

  logAudit({
    userId: req.user.userId || req.user.id,
    userName: req.user.name || req.user.email || 'Usuário',
    userRole: req.user.role || 'unknown',
    action: 'deactivate',
    entity: 'customer',
    entityId: customer.id,
    oldValue: oldSnapshot,
    newValue: { ...customers[customerIndex] },
    reason,
  });

  res.json({
    message: 'Cliente desativado com sucesso. O histórico de serviços e agendamentos foi preservado.',
    customer: customers[customerIndex],
  });
});

// Exportar função auxiliar para buscar clientes
function getCustomerById(id) {
  return customers.find(c => c.id === id);
}

module.exports = router;
module.exports.getCustomerById = getCustomerById;
module.exports.customers = customers;
module.exports.customersState = customersState;

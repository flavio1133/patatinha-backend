const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');

// TODO: Substituir por conexão com banco de dados
// Estrutura de dados em memória para desenvolvimento
const customers = [];
const customersState = { customerIdCounter: 1 };

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
  const { search, phone } = req.query;
  let filteredCustomers = [...customers];

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

// Criar novo cliente
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

  const newCustomer = {
    id: customersState.customerIdCounter++,
    name,
    phone,
    email: email || null,
    address: address || null,
    notes: notes || null,
    photo: null,
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

// Deletar cliente
router.delete('/:id', authenticateToken, (req, res) => {
  const customerIndex = customers.findIndex(c => c.id === parseInt(req.params.id));

  if (customerIndex === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  // Verificar se cliente tem pets cadastrados
  const pets = require('./pets.routes').getPetsByCustomerId(parseInt(req.params.id));
  if (pets.length > 0) {
    return res.status(400).json({ 
      error: 'Não é possível deletar cliente com pets cadastrados',
      petsCount: pets.length 
    });
  }

  customers.splice(customerIndex, 1);
  res.json({ message: 'Cliente removido com sucesso' });
});

// Exportar função auxiliar para buscar clientes
function getCustomerById(id) {
  return customers.find(c => c.id === id);
}

module.exports = router;
module.exports.getCustomerById = getCustomerById;
module.exports.customers = customers;
module.exports.customersState = customersState;

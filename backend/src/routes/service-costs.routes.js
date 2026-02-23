const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');

// TODO: Implementar conexão com banco de dados
const serviceRecipes = []; // Receitas de produtos por serviço
let recipeIdCounter = 1;

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar receitas de serviços
router.get('/recipes', authenticateToken, (req, res) => {
  const { serviceType } = req.query;
  let filteredRecipes = [...serviceRecipes];

  if (serviceType) {
    filteredRecipes = filteredRecipes.filter(r => r.serviceType === serviceType);
  }

  res.json({ recipes: filteredRecipes });
});

// Criar/atualizar receita de serviço
router.post('/recipes', [
  authenticateToken,
  body('serviceType').isIn(['banho', 'tosa', 'banho_tosa', 'veterinario']),
  body('name').trim().notEmpty().withMessage('Nome da receita é obrigatório'),
  body('items').isArray({ min: 1 }).withMessage('Receita deve ter pelo menos um produto'),
  validate
], (req, res) => {
  const {
    serviceType,
    name,
    description,
    items, // [{ productId, quantity, unit }] - ex: { productId: 1, quantity: 40, unit: 'ml' }
  } = req.body;

  const newRecipe = {
    id: recipeIdCounter++,
    serviceType,
    name,
    description: description || null,
    items,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  serviceRecipes.push(newRecipe);
  res.status(201).json({
    message: 'Receita cadastrada com sucesso',
    recipe: newRecipe,
  });
});

// Calcular custo de um serviço
router.post('/calculate', [
  authenticateToken,
  body('serviceType').isIn(['banho', 'tosa', 'banho_tosa', 'veterinario']),
  body('recipeId').optional().isInt(),
  validate
], (req, res) => {
  const { serviceType, recipeId, customItems, professionalId, professionalHourlyCost } = req.body;

  const inventory = require('./inventory.routes');
  const professionals = require('./professionals.routes');

  let items = [];
  
  // Buscar receita padrão ou usar items customizados
  if (recipeId) {
    const recipe = serviceRecipes.find(r => r.id === recipeId);
    if (recipe) {
      items = recipe.items;
    }
  } else if (customItems) {
    items = customItems;
  } else {
    // Buscar receita padrão do tipo de serviço
    const defaultRecipe = serviceRecipes.find(
      r => r.serviceType === serviceType && r.name.toLowerCase().includes('padrão')
    );
    if (defaultRecipe) {
      items = defaultRecipe.items;
    }
  }

  // Calcular custo dos insumos
  let materialCost = 0;
  const costBreakdown = [];

  for (const item of items) {
    const product = inventory.products.find(p => p.id === item.productId);
    if (!product || !product.isConsumable) continue;

    // Calcular custo proporcional
    let itemCost = 0;
    if (product.unit === 'ml' || product.unit === 'litros') {
      // Produto líquido
      const volumeUsed = item.quantity; // ml ou litros
      const productVolume = product.volume || 1; // volume total do produto
      const productCost = product.cost || 0;
      itemCost = (productCost / productVolume) * volumeUsed;
    } else {
      // Produto por unidade
      itemCost = (product.cost || 0) * item.quantity;
    }

    materialCost += itemCost;
    costBreakdown.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unit: item.unit,
      cost: itemCost,
    });
  }

  // Calcular custo do profissional
  let laborCost = 0;
  if (professionalId && professionalHourlyCost) {
    const professional = professionals.getProfessionalById(professionalId);
    if (professional) {
      const serviceDuration = professional.averageSpeed / 60; // converter minutos para horas
      laborCost = professionalHourlyCost * serviceDuration;
    }
  }

  const totalCost = materialCost + laborCost;

  res.json({
    serviceType,
    materialCost,
    laborCost,
    totalCost,
    costBreakdown,
    profitMargin: null, // Será calculado quando souber o preço cobrado
  });
});

// Registrar uso de insumos em um serviço
router.post('/register-usage', [
  authenticateToken,
  body('appointmentId').isInt().withMessage('ID do agendamento é obrigatório'),
  body('items').isArray().withMessage('Items são obrigatórios'),
  validate
], (req, res) => {
  const { appointmentId, items } = req.body;

  const inventory = require('./inventory.routes');
  const usageRecords = [];

  for (const item of items) {
    const product = inventory.products.find(p => p.id === item.productId);
    if (!product) continue;

    // Dar baixa no estoque
    let quantity = item.quantity;
    if (product.unit === 'ml' || product.unit === 'litros') {
      // Converter para unidade base (ml)
      if (product.unit === 'litros') {
        quantity = quantity * 1000; // litros para ml
      }
      // Assumindo que o estoque está em ml também
      // TODO: Normalizar unidades
    }

    if (product.sellByWeight) {
      // Produto por peso
      const quantityInGrams = quantity * 1000;
      if (product.stockWeight >= quantityInGrams) {
        product.stockWeight -= quantityInGrams;
      }
    } else {
      // Produto por unidade
      if (product.stock >= quantity) {
        product.stock -= quantity;
      }
    }

    usageRecords.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unit: item.unit,
      appointmentId,
    });
  }

  res.json({
    message: 'Uso de insumos registrado',
    records: usageRecords,
  });
});

module.exports = router;

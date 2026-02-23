const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const { isProductAvailable, checkLowStock } = require('../services/business-rules.service');

// TODO: Implementar conexão com banco de dados
const products = [];
let productIdCounter = 1;

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar produtos (com filtros)
router.get('/', authenticateToken, (req, res) => {
  const { search, category, lowStock } = req.query;
  let filteredProducts = [...products];

  // Busca
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      p => p.name.toLowerCase().includes(searchLower) ||
           p.brand?.toLowerCase().includes(searchLower) ||
           p.sku?.toLowerCase().includes(searchLower)
    );
  }

  // Filtro por categoria
  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category === category);
  }

  // Filtro por estoque baixo
  if (lowStock === 'true') {
    filteredProducts = filteredProducts.filter(p => {
      if (p.sellByWeight) {
        return p.stockWeight <= p.minStockWeight;
      }
      return p.stock <= p.minStock;
    });
  }

  res.json({ products: filteredProducts });
});

// Obter produto específico
router.get('/:id', authenticateToken, (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  res.json(product);
});

// Criar novo produto
router.post('/', [
  authenticateToken,
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('category').isIn(['racao', 'shampoo', 'condicionador', 'perfume', 'antisseptico', 'acessorios', 'medicamentos', 'outros']),
  validate
], (req, res) => {
  const {
    name,
    brand,
    sku,
    category,
    description,
    // Preço
    price, // Preço unitário ou por quilo
    // Estoque
    stock, // Quantidade em unidades (se não for por peso)
    minStock, // Estoque mínimo em unidades
    // Venda fracionada
    sellByWeight = false, // true para ração por quilo
    stockWeight, // Estoque em gramas/quilos
    minStockWeight, // Estoque mínimo em gramas/quilos
    pricePerKg, // Preço por quilo (se sellByWeight = true)
    // Insumos (para cálculo de custo)
    isConsumable = false, // true para produtos de consumo (shampoo, etc)
    volume, // Volume do produto (ex: 5 litros)
    cost, // Custo de aquisição
    yieldPerService, // Rendimento por serviço (ex: 50ml por banho)
    unit, // Unidade de medida (ml, litros, gramas, kg)
  } = req.body;

  const newProduct = {
    id: productIdCounter++,
    name,
    brand: brand || null,
    sku: sku || null,
    category,
    description: description || null,
    price: parseFloat(price) || 0,
    stock: stock || 0,
    minStock: minStock || 0,
    sellByWeight,
    stockWeight: stockWeight ? parseFloat(stockWeight) : null,
    minStockWeight: minStockWeight ? parseFloat(minStockWeight) : null,
    pricePerKg: pricePerKg ? parseFloat(pricePerKg) : null,
    isConsumable,
    volume: volume ? parseFloat(volume) : null,
    cost: cost ? parseFloat(cost) : null,
    yieldPerService: yieldPerService ? parseFloat(yieldPerService) : null,
    unit: unit || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  products.push(newProduct);
  res.status(201).json({
    message: 'Produto cadastrado com sucesso',
    product: newProduct,
  });
});

// Atualizar produto
router.put('/:id', authenticateToken, (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  products[productIndex] = {
    ...products[productIndex],
    ...req.body,
    updatedAt: new Date(),
  };

  res.json({
    message: 'Produto atualizado com sucesso',
    product: products[productIndex],
  });
});

// Deletar produto
router.delete('/:id', authenticateToken, (req, res) => {
  const productIndex = products.findIndex(p => p.id === parseInt(req.params.id));

  if (productIndex === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  products.splice(productIndex, 1);
  res.json({ message: 'Produto removido com sucesso' });
});

// Entrada de estoque
router.post('/:id/stock-in', [
  authenticateToken,
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser maior que zero'),
  validate
], (req, res) => {
  const { quantity, cost, notes } = req.body;
  const product = products.find(p => p.id === parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  if (product.sellByWeight) {
    // Entrada por peso (gramas)
    const quantityInGrams = parseFloat(quantity) * 1000; // converter kg para gramas
    product.stockWeight = (product.stockWeight || 0) + quantityInGrams;
  } else {
    // Entrada por unidade
    product.stock = (product.stock || 0) + parseInt(quantity);
  }

  // Atualizar custo médio se fornecido
  if (cost) {
    const totalCost = (product.cost || 0) * (product.sellByWeight ? product.stockWeight : product.stock);
    const newCost = parseFloat(cost);
    const newTotalCost = totalCost + (newCost * quantity);
    const newTotalStock = product.sellByWeight ? product.stockWeight : product.stock;
    product.cost = newTotalStock > 0 ? newTotalCost / newTotalStock : newCost;
  }

  product.updatedAt = new Date();

  res.json({
    message: 'Entrada de estoque registrada',
    product,
  });
});

// Saída de estoque (venda ou uso)
router.post('/:id/stock-out', [
  authenticateToken,
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser maior que zero'),
  validate
], (req, res) => {
  const { quantity, reason, notes } = req.body; // reason: 'sale', 'service', 'loss', 'adjustment'
  const product = products.find(p => p.id === parseInt(req.params.id));

  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  let availableStock;
  if (product.sellByWeight) {
    availableStock = product.stockWeight || 0;
    const quantityInGrams = parseFloat(quantity) * 1000; // converter kg para gramas
    
    if (quantityInGrams > availableStock) {
      return res.status(400).json({
        error: 'Estoque insuficiente',
        available: availableStock / 1000, // em kg
        requested: quantity,
      });
    }

    product.stockWeight = availableStock - quantityInGrams;
  } else {
    availableStock = product.stock || 0;
    const qty = parseInt(quantity);
    
    if (qty > availableStock) {
      return res.status(400).json({
        error: 'Estoque insuficiente',
        available: availableStock,
        requested: qty,
      });
    }

    product.stock = availableStock - qty;
  }

  product.updatedAt = new Date();

  res.json({
    message: 'Saída de estoque registrada',
    product,
    reason: reason || 'sale',
  });
});

// Listar produtos com estoque baixo (RN019)
router.get('/alerts/low-stock', authenticateToken, (req, res) => {
  const lowStockProducts = products.map(p => {
    const stockCheck = checkLowStock(p);
    return {
      ...p,
      stockStatus: stockCheck.status,
      isLow: stockCheck.isLow,
      isCritical: stockCheck.isCritical,
    };
  }).filter(p => p.isLow || p.isCritical);

  res.json({
    count: lowStockProducts.length,
    products: lowStockProducts,
  });
});

// Função auxiliar para status do estoque
function getStockStatus(product) {
  let current, minimum;
  
  if (product.sellByWeight) {
    current = product.stockWeight || 0;
    minimum = product.minStockWeight || 0;
  } else {
    current = product.stock || 0;
    minimum = product.minStock || 0;
  }

  if (current <= minimum * 0.5) {
    return { status: 'critical', level: 'critical' }; // 🔴 Crítico
  } else if (current <= minimum) {
    return { status: 'low', level: 'low' }; // 🟡 Baixo
  } else {
    return { status: 'normal', level: 'normal' }; // 🟢 Normal
  }
}

module.exports = router;
module.exports.products = products;
module.exports.getStockStatus = getStockStatus;

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  isProductAvailable,
  calculateFractionalPrice,
} = require('../services/business-rules.service');
const { Sale } = require('../db');

// Cache em memória
const sales = [];

async function hydrateSalesFromDatabase() {
  try {
    const rows = await Sale.findAll({ order: [['id', 'ASC']] });
    sales.length = 0;
    rows.forEach((row) => {
      const plain = row.get({ plain: true });
      sales.push({
        ...plain,
        createdAt: plain.createdAt || plain.created_at,
      });
    });
  } catch (err) {
    console.error('Erro ao carregar vendas do banco:', err.message);
  }
}

hydrateSalesFromDatabase();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar vendas (com filtros)
router.get('/', authenticateToken, require('../middleware/subscription.middleware').checkSubscription, (req, res) => {
  const { startDate, endDate, customerId, paymentMethod } = req.query;
  let filteredSales = [...sales];

  // Filtro por data
  if (startDate) {
    filteredSales = filteredSales.filter(s => s.date >= startDate);
  }
  if (endDate) {
    filteredSales = filteredSales.filter(s => s.date <= endDate);
  }

  // Filtro por cliente
  if (customerId) {
    filteredSales = filteredSales.filter(s => s.customerId === parseInt(customerId));
  }

  // Filtro por forma de pagamento
  if (paymentMethod) {
    filteredSales = filteredSales.filter(s => s.paymentMethod === paymentMethod);
  }

  // Ordenar por data (mais recentes primeiro)
  filteredSales.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ sales: filteredSales });
});

// Obter venda específica
router.get('/:id', authenticateToken, require('../middleware/subscription.middleware').checkSubscription, (req, res) => {
  const sale = sales.find(s => s.id === parseInt(req.params.id));

  if (!sale) {
    return res.status(404).json({ error: 'Venda não encontrada' });
  }

  res.json(sale);
});

// Criar nova venda (PDV)
router.post('/', [
  authenticateToken,
  body('items').isArray({ min: 1 }).withMessage('Venda deve ter pelo menos um item'),
  body('items.*.productId').isInt().withMessage('ID do produto é obrigatório'),
  body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantidade deve ser maior que zero'),
  body('paymentMethod').isIn(['cash', 'credit_card', 'debit_card', 'pix', 'store_credit']),
  validate
], async (req, res) => {
  const {
    customerId,
    items, // [{ productId, quantity, price }]
    paymentMethod,
    cashAmount, // Se pagamento em dinheiro
    change, // Troco
    notes,
    appointmentId, // Se venda vinculada a um agendamento
  } = req.body;

  // Buscar produtos e calcular totais
  const inventory = require('./inventory.routes');
  let total = 0;
  const saleItems = [];

  for (const item of items) {
    const product = inventory.products.find(p => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Produto ${item.productId} não encontrado` });
    }

    // Calcular preço (se venda fracionada, usar pricePerKg)
    let itemPrice;
    let quantity = parseFloat(item.quantity);

    if (product.sellByWeight) {
      // RN021/RN022: Venda fracionada - calcular preço proporcional
      const quantityGrams = quantity * 1000; // converter kg para gramas
      const priceCalc = calculateFractionalPrice(product.pricePerKg || product.price, quantityGrams);
      itemPrice = priceCalc.totalPrice;
      quantity = quantityGrams; // usar gramas para baixa de estoque
    } else {
      // Venda por unidade
      itemPrice = product.price * quantity;
    }

    // RN024: Verificar se produto está disponível
    const quantityToCheck = product.sellByWeight ? quantity * 1000 : quantity; // converter kg para gramas
    const availability = isProductAvailable(product, quantityToCheck);
    
    if (!availability.available) {
      return res.status(400).json({
        error: `Produto ${product.name} ${availability.reason}`,
        available: availability.availableQuantity,
        requested: item.quantity,
        productId: product.id,
      });
    }

    saleItems.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity, // quantidade original
      unitPrice: product.sellByWeight ? product.pricePerKg : product.price,
      totalPrice: itemPrice,
      sellByWeight: product.sellByWeight,
    });

    total += itemPrice;

    // Dar baixa no estoque
    if (product.sellByWeight) {
      product.stockWeight = availableStock - quantity;
    } else {
      product.stock = availableStock - quantity;
    }
  }

  const now = new Date();
  const newSaleData = {
    customerId: customerId || null,
    appointmentId: appointmentId || null,
    items: saleItems,
    subtotal: total,
    discount: 0,
    total: total,
    paymentMethod,
    cashAmount: cashAmount ? parseFloat(cashAmount) : null,
    change: change ? parseFloat(change) : null,
    notes: notes || null,
    date: now.toISOString().split('T')[0],
    time: now.toTimeString().split(' ')[0].substring(0, 5),
  };

  const created = await Sale.create(newSaleData);
  const newSale = created.get({ plain: true });

  sales.push({
    ...newSale,
    createdAt: now,
  });

  res.status(201).json({
    message: 'Venda realizada com sucesso',
    sale: newSale,
  });
});

// Relatório de vendas
router.get('/reports/summary', authenticateToken, (req, res) => {
  const { startDate, endDate } = req.query;
  
  let filteredSales = sales;
  if (startDate) {
    filteredSales = filteredSales.filter(s => s.date >= startDate);
  }
  if (endDate) {
    filteredSales = filteredSales.filter(s => s.date <= endDate);
  }

  const summary = {
    totalSales: filteredSales.length,
    totalRevenue: filteredSales.reduce((sum, s) => sum + s.total, 0),
    byPaymentMethod: {},
    byCategory: {},
    topProducts: {},
  };

  // Por forma de pagamento
  filteredSales.forEach(sale => {
    summary.byPaymentMethod[sale.paymentMethod] = 
      (summary.byPaymentMethod[sale.paymentMethod] || 0) + sale.total;
  });

  // Por categoria e produtos mais vendidos
  const inventory = require('./inventory.routes');
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = inventory.products.find(p => p.id === item.productId);
      if (product) {
        // Por categoria
        summary.byCategory[product.category] = 
          (summary.byCategory[product.category] || 0) + item.totalPrice;
        
        // Top produtos
        if (!summary.topProducts[product.id]) {
          summary.topProducts[product.id] = {
            name: product.name,
            quantity: 0,
            revenue: 0,
          };
        }
        summary.topProducts[product.id].quantity += item.quantity;
        summary.topProducts[product.id].revenue += item.totalPrice;
      }
    });
  });

  // Converter topProducts para array e ordenar
  summary.topProducts = Object.values(summary.topProducts)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  res.json(summary);
});

// Fechamento de caixa
router.post('/cash-closing', [
  authenticateToken,
  body('date').notEmpty().withMessage('Data é obrigatória'),
  validate
], (req, res) => {
  const { date, cashInRegister, withdrawals, deposits, notes } = req.body;

  const daySales = sales.filter(s => s.date === date);
  const cashSales = daySales.filter(s => s.paymentMethod === 'cash');

  const summary = {
    date,
    totalSales: daySales.length,
    totalRevenue: daySales.reduce((sum, s) => sum + s.total, 0),
    cashRevenue: cashSales.reduce((sum, s) => sum + s.total, 0),
    expectedCash: cashSales.reduce((sum, s) => sum + s.total, 0) - (withdrawals || 0) + (deposits || 0),
    actualCash: parseFloat(cashInRegister) || 0,
    difference: 0,
    byPaymentMethod: {},
    withdrawals: withdrawals || 0,
    deposits: deposits || 0,
    notes: notes || null,
    closedAt: new Date(),
  };

  // Calcular diferença
  summary.difference = summary.actualCash - summary.expectedCash;

  // Por forma de pagamento
  daySales.forEach(sale => {
    summary.byPaymentMethod[sale.paymentMethod] = 
      (summary.byPaymentMethod[sale.paymentMethod] || 0) + sale.total;
  });

  res.json({
    message: 'Fechamento de caixa realizado',
    summary,
  });
});

module.exports = router;
module.exports.sales = sales;

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth.middleware');

// TODO: Implementar conexão com banco de dados
const transactions = [];
let transactionIdCounter = 1;

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Listar transações (com filtros)
router.get('/', authenticateToken, (req, res) => {
  const { startDate, endDate, type, category } = req.query;
  let filteredTransactions = [...transactions];

  // Filtro por data
  if (startDate) {
    filteredTransactions = filteredTransactions.filter(t => t.date >= startDate);
  }
  if (endDate) {
    filteredTransactions = filteredTransactions.filter(t => t.date <= endDate);
  }

  // Filtro por tipo (income/expense)
  if (type) {
    filteredTransactions = filteredTransactions.filter(t => t.type === type);
  }

  // Filtro por categoria
  if (category) {
    filteredTransactions = filteredTransactions.filter(t => t.category === category);
  }

  // Ordenar por data (mais recentes primeiro)
  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ transactions: filteredTransactions });
});

// Obter transação específica
router.get('/:id', authenticateToken, (req, res) => {
  const transaction = transactions.find(t => t.id === parseInt(req.params.id));

  if (!transaction) {
    return res.status(404).json({ error: 'Transação não encontrada' });
  }

  res.json(transaction);
});

// Criar nova transação
router.post('/', [
  authenticateToken,
  body('type').isIn(['income', 'expense']).withMessage('Tipo deve ser income ou expense'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que zero'),
  body('category').notEmpty().withMessage('Categoria é obrigatória'),
  body('date').notEmpty().withMessage('Data é obrigatória'),
  validate
], (req, res) => {
  const {
    type, // 'income' ou 'expense'
    amount,
    category,
    description,
    date,
    paymentMethod, // cash, bank_transfer, pix, etc.
    reconciled = false, // Conciliação bancária
    tags,
    relatedSaleId, // Se vinculado a uma venda
    relatedAppointmentId, // Se vinculado a um agendamento
  } = req.body;

  const newTransaction = {
    id: transactionIdCounter++,
    type,
    amount: parseFloat(amount),
    category,
    description: description || null,
    date,
    paymentMethod: paymentMethod || 'cash',
    reconciled,
    tags: tags || [],
    relatedSaleId: relatedSaleId || null,
    relatedAppointmentId: relatedAppointmentId || null,
    createdAt: new Date(),
  };

  transactions.push(newTransaction);
  res.status(201).json({
    message: 'Transação registrada com sucesso',
    transaction: newTransaction,
  });
});

// Atualizar transação
router.put('/:id', authenticateToken, (req, res) => {
  const transactionIndex = transactions.findIndex(t => t.id === parseInt(req.params.id));

  if (transactionIndex === -1) {
    return res.status(404).json({ error: 'Transação não encontrada' });
  }

  transactions[transactionIndex] = {
    ...transactions[transactionIndex],
    ...req.body,
    updatedAt: new Date(),
  };

  res.json({
    message: 'Transação atualizada com sucesso',
    transaction: transactions[transactionIndex],
  });
});

// Deletar transação
router.delete('/:id', authenticateToken, (req, res) => {
  const transactionIndex = transactions.findIndex(t => t.id === parseInt(req.params.id));

  if (transactionIndex === -1) {
    return res.status(404).json({ error: 'Transação não encontrada' });
  }

  transactions.splice(transactionIndex, 1);
  res.json({ message: 'Transação removida com sucesso' });
});

// Dashboard financeiro (resumo do dia)
router.get('/dashboard/daily', authenticateToken, (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const dayTransactions = transactions.filter(t => t.date === targetDate);
  const income = dayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = dayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  // Por categoria
  const incomeByCategory = {};
  const expenseByCategory = {};

  dayTransactions.forEach(t => {
    if (t.type === 'income') {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    } else {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    }
  });

  res.json({
    date: targetDate,
    income,
    expense,
    balance,
    transactionsCount: dayTransactions.length,
    incomeByCategory,
    expenseByCategory,
  });
});

// Resumo mensal
router.get('/dashboard/monthly', authenticateToken, (req, res) => {
  const { year, month } = req.query;
  const targetYear = parseInt(year) || new Date().getFullYear();
  const targetMonth = parseInt(month) || new Date().getMonth() + 1;

  const monthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getFullYear() === targetYear && tDate.getMonth() + 1 === targetMonth;
  });

  const income = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  // Por categoria
  const incomeByCategory = {};
  const expenseByCategory = {};

  monthTransactions.forEach(t => {
    if (t.type === 'income') {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    } else {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    }
  });

  res.json({
    year: targetYear,
    month: targetMonth,
    income,
    expense,
    balance,
    transactionsCount: monthTransactions.length,
    incomeByCategory,
    expenseByCategory,
  });
});

// Previsão de fluxo de caixa (30 dias)
router.get('/forecast', authenticateToken, (req, res) => {
  const { days = 30 } = req.query;
  const today = new Date();
  const forecast = [];

  // Buscar agendamentos confirmados (receita futura)
  const appointments = require('./appointments.routes').appointments || [];
  const confirmedAppointments = appointments.filter(
    a => a.status === 'confirmed' && a.date >= today.toISOString().split('T')[0]
  );

  // Buscar contas a pagar cadastradas
  const scheduledExpenses = transactions.filter(
    t => t.type === 'expense' && t.date >= today.toISOString().split('T')[0]
  );

  // Calcular média histórica de vendas
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const historicalSales = transactions.filter(
    t => t.type === 'income' && new Date(t.date) >= last30Days
  );
  const avgDailyIncome = historicalSales.length > 0
    ? historicalSales.reduce((sum, t) => sum + t.amount, 0) / 30
    : 0;

  // Calcular saldo atual
  const currentBalance = transactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  // Gerar previsão dia a dia
  let runningBalance = currentBalance;
  for (let i = 0; i < parseInt(days); i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);
    const dateStr = forecastDate.toISOString().split('T')[0];

    // Receitas do dia (agendamentos confirmados)
    const dayAppointments = confirmedAppointments.filter(a => a.date === dateStr);
    const appointmentRevenue = dayAppointments.reduce((sum, apt) => {
      // TODO: Buscar preço do serviço
      return sum + 80; // Valor estimado
    }, 0);

    // Receita média projetada
    const projectedIncome = appointmentRevenue + (avgDailyIncome * 0.7); // 70% da média

    // Despesas do dia
    const dayExpenses = scheduledExpenses.filter(t => t.date === dateStr);
    const dayExpense = dayExpenses.reduce((sum, t) => sum + t.amount, 0);

    runningBalance = runningBalance + projectedIncome - dayExpense;

    forecast.push({
      date: dateStr,
      projectedIncome,
      projectedExpense: dayExpense,
      projectedBalance: runningBalance,
      confirmedAppointments: dayAppointments.length,
    });
  }

  res.json({
    currentBalance,
    forecastDays: parseInt(days),
    forecast,
    warnings: forecast.filter(f => f.projectedBalance < 0),
  });
});

// Conciliação bancária
router.post('/reconcile', authenticateToken, (req, res) => {
  const { transactionIds, bankStatement } = req.body;

  // Marcar transações como conciliadas
  transactionIds.forEach(id => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      transaction.reconciled = true;
      transaction.reconciledAt = new Date();
    }
  });

  // Sugerir correspondências com extrato bancário
  const suggestions = [];
  if (bankStatement && bankStatement.length > 0) {
    bankStatement.forEach(statement => {
      const matchingTransaction = transactions.find(t => 
        !t.reconciled &&
        Math.abs(t.amount - statement.amount) < 0.01 &&
        Math.abs(new Date(t.date).getTime() - new Date(statement.date).getTime()) < 86400000 // 1 dia
      );

      if (matchingTransaction) {
        suggestions.push({
          statement,
          transaction: matchingTransaction,
          confidence: 'high',
        });
      }
    });
  }

  res.json({
    message: 'Conciliação realizada',
    reconciled: transactionIds.length,
    suggestions,
  });
});

module.exports = router;
module.exports.transactions = transactions;

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Rotas administrativas - apenas para gestores
// Todas as rotas aqui requerem role 'master' ou 'manager'

// Dashboard administrativo
router.get('/dashboard', authenticateToken, requireRole('master', 'manager'), (req, res) => {
  // Buscar dados de todas as rotas
  const appointments = require('./appointments.routes').appointments || [];
  const sales = require('./sales.routes').sales || [];
  const subscriptions = require('./subscriptions.routes').subscriptions || [];
  const transactions = require('./cashflow.routes').transactions || [];

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === today && a.status !== 'cancelled');
  const todaySales = sales.filter(s => s.date === today);
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  // Calcular receita do dia
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  
  // Calcular receita recorrente mensal
  const mrr = activeSubscriptions.reduce((sum, s) => sum + s.monthlyPrice, 0);

  res.json({
    date: today,
    appointments: {
      total: todayAppointments.length,
      confirmed: todayAppointments.filter(a => a.status === 'confirmed').length,
      inProgress: todayAppointments.filter(a => a.status === 'in_progress').length,
      completed: todayAppointments.filter(a => a.status === 'completed').length,
    },
    sales: {
      total: todaySales.length,
      revenue: todayRevenue,
    },
    subscriptions: {
      active: activeSubscriptions.length,
      mrr: mrr,
    },
    alerts: {
      lowStock: 0, // TODO: Buscar produtos com estoque baixo
      expiringVaccinations: 0, // TODO: Buscar vacinas expirando
      paymentFailed: subscriptions.filter(s => s.status === 'payment_failed').length,
    },
  });
});

// Relatórios consolidados
router.get('/reports/consolidated', authenticateToken, requireRole('master', 'manager'), (req, res) => {
  const { startDate, endDate } = req.query;
  
  const sales = require('./sales.routes').sales || [];
  const appointments = require('./appointments.routes').appointments || [];
  const subscriptions = require('./subscriptions.routes').subscriptions || [];
  const transactions = require('./cashflow.routes').transactions || [];

  let filteredSales = sales;
  let filteredAppointments = appointments;
  let filteredTransactions = transactions;

  if (startDate) {
    filteredSales = filteredSales.filter(s => s.date >= startDate);
    filteredAppointments = filteredAppointments.filter(a => a.date >= startDate);
    filteredTransactions = filteredTransactions.filter(t => t.date >= startDate);
  }
  if (endDate) {
    filteredSales = filteredSales.filter(s => s.date <= endDate);
    filteredAppointments = filteredAppointments.filter(a => a.date <= endDate);
    filteredTransactions = filteredTransactions.filter(t => t.date <= endDate);
  }

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  res.json({
    period: {
      startDate: startDate || null,
      endDate: endDate || null,
    },
    revenue: {
      total: totalRevenue,
      fromSales: totalRevenue,
      fromSubscriptions: subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + s.monthlyPrice, 0),
    },
    expenses: {
      total: totalExpenses,
      byCategory: {},
    },
    profit: {
      net: netProfit,
      margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
    },
    operations: {
      appointments: filteredAppointments.length,
      sales: filteredSales.length,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
    },
  });
});

module.exports = router;

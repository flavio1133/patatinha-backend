const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// Retorna intervalo de datas em YYYY-MM-DD (data local) conforme período
function toLocalDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getPeriodRange(period) {
  const now = new Date();
  const today = toLocalDateStr(now);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === 'semana') {
    start.setDate(start.getDate() - 6);
  } else if (period === 'mes') {
    start.setDate(1);
  }

  return {
    start: toLocalDateStr(start),
    end: toLocalDateStr(end),
    today,
  };
}

// Dashboard administrativo – estrutura completa para o frontend
router.get('/dashboard', authenticateToken, requireRole('master', 'manager'), (req, res) => {
  const period = (req.query.period || 'hoje').toLowerCase();
  const { start, end, today } = getPeriodRange(period);

  const appointments = require('./appointments.routes').appointments || [];
  const sales = require('./sales.routes').sales || [];
  const subscriptions = require('./subscriptions.routes').subscriptions || [];
  const transactions = require('./cashflow.routes').transactions || [];
  const customers = require('./customers.routes').customers || [];
  const pets = require('./pets.routes').pets || [];
  const products = require('./inventory.routes').products || [];

  const todayAppointments = appointments.filter(a => a.date === today && a.status !== 'cancelled');
  const todaySales = sales.filter(s => s.date === today);
  const periodAppointments = appointments.filter(a => a.date >= start && a.date <= end && a.status !== 'cancelled');
  const periodSales = sales.filter(s => s.date >= start && s.date <= end);
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  const todayRevenue = todaySales.reduce((sum, s) => sum + (s.total || 0), 0);
  const periodRevenue = periodSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const completedToday = todayAppointments.filter(a => a.status === 'completed').length;

  // Estoque crítico (produtos com estoque <= mínimo)
  const lowStockCount = products.filter(p => {
    if (p.sellByWeight && p.minStockWeight != null) return (p.stockWeight || 0) <= p.minStockWeight;
    return (p.stock || 0) <= (p.minStock || 0);
  }).length;

  // Novos clientes (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newCustomers = customers.filter(c => c.createdAt && new Date(c.createdAt) >= thirtyDaysAgo).length;

  // Gráfico de faturamento – últimos 7 dias
  const revenueChart = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const valor = sales.filter(s => s.date === dateStr).reduce((sum, s) => sum + (s.total || 0), 0);
    revenueChart.push({ dia: dateStr.slice(8, 10) + '/' + dateStr.slice(5, 7), valor });
  }

  // Serviços mais realizados (período)
  const serviceCounts = {};
  periodAppointments.forEach(a => {
    const svc = a.service || 'Outros';
    serviceCounts[svc] = (serviceCounts[svc] || 0) + 1;
  });
  const servicesChart = Object.entries(serviceCounts)
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 6);

  // Horários de pico (agendamentos por hora no período)
  const hourCounts = {};
  periodAppointments.forEach(a => {
    const hour = (a.time || '09:00').slice(0, 2);
    const label = hour + 'h';
    hourCounts[label] = (hourCounts[label] || 0) + 1;
  });
  const peakHours = Object.entries(hourCounts)
    .map(([hora, qtd]) => ({ hora, qtd }))
    .sort((a, b) => a.hora.localeCompare(b.hora));

  // Próximos agendamentos (hoje e amanhã, até 5)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const upcoming = appointments
    .filter(a => (a.date === today || a.date === tomorrowStr) && a.status !== 'cancelled' && a.status !== 'completed')
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5);
  const upcomingAppointments = upcoming.map(a => {
    const pet = pets.find(p => p.id === a.petId);
    const customer = customers.find(c => c.id === a.customerId);
    return {
      id: a.id,
      time: a.time || '—',
      petName: pet ? pet.name : '—',
      service: a.service || '—',
      customerName: customer ? customer.name : '—',
      status: a.status,
    };
  });

  // Atividade recente (últimos concluídos + vendas)
  const recentCompleted = appointments
    .filter(a => a.status === 'completed' && a.date >= start && a.date <= end)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 5)
    .map(a => {
      const pet = pets.find(p => p.id === a.petId);
      return { type: 'checkin', msg: (pet ? pet.name : 'Pet') + ' - ' + (a.service || ''), time: (a.time || '').slice(0, 5) };
    });
  const recentSales = periodSales
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)
    .map(s => ({ type: 'sale', msg: 'Venda R$ ' + Number(s.total || 0).toFixed(2), time: (s.date || '').slice(0, 10) }));
  const recentActivity = [...recentCompleted, ...recentSales]
    .sort((a, b) => (b.time || '').localeCompare(a.time || ''))
    .slice(0, 8);

  // Contas a pagar hoje (cashflow)
  const billsToday = transactions.filter(t => t.type === 'expense' && t.date === today).length;
  // Clientes inativos 30+ dias (sem agendamento)
  const lastAppointmentByCustomer = {};
  appointments.filter(a => a.status !== 'cancelled').forEach(a => {
    if (!a.customerId) return;
    const d = a.date;
    if (!lastAppointmentByCustomer[a.customerId] || lastAppointmentByCustomer[a.customerId] < d) {
      lastAppointmentByCustomer[a.customerId] = d;
    }
  });
  const inactive30 = customers.filter(c => {
    const last = lastAppointmentByCustomer[c.id];
    if (!last) return true;
    const d = new Date(last);
    d.setDate(d.getDate() + 30);
    return d < new Date();
  }).length;

  res.json({
    date: today,
    period: { start, end, period },
    appointments: {
      total: period === 'hoje' ? todayAppointments.length : periodAppointments.length,
      attended: completedToday,
      confirmed: todayAppointments.filter(a => a.status === 'confirmed').length,
      inProgress: todayAppointments.filter(a => a.status === 'in_progress').length,
      completed: completedToday,
    },
    sales: {
      total: period === 'hoje' ? todaySales.length : periodSales.length,
      revenue: period === 'hoje' ? todayRevenue : periodRevenue,
      meta: period === 'hoje' ? 2000 : null,
    },
    customers: {
      total: customers.length,
      active: customers.length,
      new: newCustomers,
    },
    subscriptions: {
      active: activeSubscriptions.length,
      mrr: activeSubscriptions.reduce((sum, s) => sum + (s.monthlyPrice || 0), 0),
    },
    stock: { critical: lowStockCount },
    alerts: {
      lowStock: lowStockCount,
      vaccines: 0,
      billsToday,
      inactive30,
      paymentFailed: subscriptions.filter(s => s.status === 'payment_failed').length,
    },
    revenueChart,
    servicesChart: servicesChart.length ? servicesChart : [{ nome: 'Nenhum', quantidade: 0 }],
    peakHours: peakHours.length ? peakHours : [{ hora: '09h', qtd: 0 }],
    upcomingAppointments,
    recentActivity,
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

  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
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
        .reduce((sum, s) => sum + (s.monthlyPrice || 0), 0),
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

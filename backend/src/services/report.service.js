/**
 * Serviço de relatórios - usa dados em memória das rotas
 */
const { findCached, setCache } = require('../data/reports.data');

function getSalesRouter() {
  const r = require('../routes/sales.routes');
  return r.sales || [];
}

function getAppointmentsRouter() {
  const r = require('../routes/appointments.routes');
  return r.appointments || [];
}

function getCustomersRouter() {
  const r = require('../routes/customers.routes');
  return r.customers || [];
}

function getPetsRouter() {
  const r = require('../routes/pets.routes');
  return r.pets || [];
}

function getTransactionsRouter() {
  const r = require('../routes/cashflow.routes');
  return r.transactions || [];
}

function getProductsRouter() {
  const r = require('../routes/inventory.routes');
  return r.products || [];
}

function getProfessionalsRouter() {
  const r = require('../routes/professionals.routes');
  return r.professionals || [];
}

function getCommissionsRouter() {
  try {
    const r = require('../routes/commissions.routes');
    return r.commissionRecords || [];
  } catch {
    return [];
  }
}

class ReportService {
  getSalesReport(companyId, startDate, endDate, groupBy = 'day') {
    const sales = getSalesRouter();
    let filtered = sales.filter((s) => s.date >= startDate && s.date <= endDate);

    if (groupBy === 'day') {
      const byDate = {};
      filtered.forEach((s) => {
        const d = s.date;
        if (!byDate[d]) {
          byDate[d] = {
            date: d,
            total_sales: 0,
            revenue: 0,
            unique_clients: new Set(),
            by_payment: {},
          };
        }
        byDate[d].total_sales += 1;
        byDate[d].revenue += s.total || 0;
        if (s.customerId) byDate[d].unique_clients.add(s.customerId);
        const pm = s.paymentMethod || 'outros';
        byDate[d].by_payment[pm] = (byDate[d].by_payment[pm] || 0) + (s.total || 0);
      });
      return Object.values(byDate)
        .map((o) => ({
          date: o.date,
          total_sales: o.total_sales,
          revenue: o.revenue,
          average_ticket: o.total_sales ? o.revenue / o.total_sales : 0,
          unique_clients: o.unique_clients.size,
        }))
        .sort((a, b) => b.date.localeCompare(a.date));
    }

    if (groupBy === 'month') {
      const byMonth = {};
      filtered.forEach((s) => {
        const m = (s.date || '').substring(0, 7);
        if (!byMonth[m]) {
          byMonth[m] = { month: m, total_sales: 0, revenue: 0 };
        }
        byMonth[m].total_sales += 1;
        byMonth[m].revenue += s.total || 0;
      });
      return Object.values(byMonth)
        .map((o) => ({
          month: o.month,
          total_sales: o.total_sales,
          revenue: o.revenue,
          average_ticket: o.total_sales ? o.revenue / o.total_sales : 0,
        }))
        .sort((a, b) => b.month.localeCompare(a.month));
    }

    return filtered.map((s) => ({
      date: s.date,
      total_sales: 1,
      revenue: s.total,
      average_ticket: s.total,
      payment_method: s.paymentMethod,
    }));
  }

  getSalesByPaymentMethod(companyId, startDate, endDate) {
    const sales = getSalesRouter();
    const filtered = sales.filter((s) => s.date >= startDate && s.date <= endDate);
    const byPayment = {};
    filtered.forEach((s) => {
      const pm = s.paymentMethod || 'outros';
      if (!byPayment[pm]) byPayment[pm] = { payment_method: pm, total_sales: 0, revenue: 0 };
      byPayment[pm].total_sales += 1;
      byPayment[pm].revenue += s.total || 0;
    });
    return Object.values(byPayment).map((o) => ({
      ...o,
      average_ticket: o.total_sales ? o.revenue / o.total_sales : 0,
    }));
  }

  getServicesReport(companyId, startDate, endDate) {
    const appointments = getAppointmentsRouter();
    const professionals = getProfessionalsRouter();
    const getProName = (id) => professionals.find((p) => p.id === id)?.name || '-';

    const filtered = appointments.filter(
      (a) =>
        a.date >= startDate &&
        a.date <= endDate &&
        (a.status === 'completed' || a.status === 'checked_in' || a.status === 'confirmed')
    );

    const byService = {};
    filtered.forEach((a) => {
      const svc = a.service || 'outros';
      if (!byService[svc]) {
        byService[svc] = {
          service_name: svc,
          total_appointments: 0,
          revenue: 0,
          unique_pets: new Set(),
          professionals: new Set(),
        };
      }
      byService[svc].total_appointments += 1;
      byService[svc].revenue += a.price || 0;
      if (a.petId) byService[svc].unique_pets.add(a.petId);
      if (a.professionalId) byService[svc].professionals.add(getProName(a.professionalId));
    });

    return Object.values(byService).map((o) => ({
      service_name: o.service_name,
      category: o.service_name,
      total_appointments: o.total_appointments,
      revenue: o.revenue,
      average_price: o.total_appointments ? o.revenue / o.total_appointments : 0,
      unique_pets: o.unique_pets.size,
      employees: Array.from(o.professionals).join(', '),
    }));
  }

  getServicesByEmployee(companyId, startDate, endDate) {
    const appointments = getAppointmentsRouter();
    const professionals = getProfessionalsRouter();

    const filtered = appointments.filter(
      (a) =>
        a.date >= startDate &&
        a.date <= endDate &&
        (a.status === 'completed' || a.status === 'checked_in')
    );

    const byEmp = {};
    filtered.forEach((a) => {
      const pid = a.professionalId || 0;
      const p = professionals.find((pr) => pr.id === pid);
      const name = p?.name || 'Não definido';
      if (!byEmp[name]) {
        byEmp[name] = {
          employee_name: name,
          total_services: 0,
          revenue: 0,
          unique_pets: new Set(),
        };
      }
      byEmp[name].total_services += 1;
      byEmp[name].revenue += a.price || 0;
      if (a.petId) byEmp[name].unique_pets.add(a.petId);
    });

    return Object.values(byEmp).map((o) => ({
      ...o,
      average_price: o.total_services ? o.revenue / o.total_services : 0,
      unique_pets: o.unique_pets.size,
    }));
  }

  getClientsReport(companyId, startDate, endDate) {
    const customers = getCustomersRouter();
    const pets = getPetsRouter();
    const appointments = getAppointmentsRouter();

    const completed = appointments.filter(
      (a) =>
        a.status === 'completed' &&
        (!startDate || a.date >= startDate) &&
        (!endDate || a.date <= endDate)
    );

    return customers.map((c) => {
      const clientPets = pets.filter((p) => p.customerId === c.id);
      const petIds = new Set(clientPets.map((p) => p.id));
      const apts = completed.filter((a) => petIds.has(a.petId));
      const totalSpent = apts.reduce((s, a) => s + (a.price || 0), 0);
      const lastVisit = apts.length
        ? apts.map((a) => a.date).sort().reverse()[0]
        : null;
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      let status = 'inactive';
      if (lastVisit) {
        const lv = new Date(lastVisit);
        if (lv >= thirtyDaysAgo) status = 'active';
        else if (lv >= ninetyDaysAgo) status = 'at_risk';
      }
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        total_pets: clientPets.length,
        total_appointments: apts.length,
        total_spent: totalSpent,
        last_visit: lastVisit,
        average_ticket: apts.length ? totalSpent / apts.length : 0,
        status,
      };
    });
  }

  getFinancialReport(companyId, startDate, endDate) {
    const sales = getSalesRouter();
    const transactions = getTransactionsRouter();
    const commissions = getCommissionsRouter();

    const filteredSales = sales.filter(
      (s) => s.date >= startDate && s.date <= endDate
    );
    const filteredTx = transactions.filter(
      (t) => t.date >= startDate && t.date <= endDate
    );
    const filteredComm = commissions.filter((c) => {
      const dt = c.calculatedAt || c.created_at || c.date || c.paidAt;
      const d = dt ? new Date(dt).toISOString().split('T')[0] : '';
      return d && d >= startDate && d <= endDate;
    });

    const byDate = {};
    filteredSales.forEach((s) => {
      const d = s.date;
      if (!byDate[d]) byDate[d] = { date: d, revenue: 0, transactions: 0, expenses: 0, commissions: 0 };
      byDate[d].revenue += s.total || 0;
      byDate[d].transactions += 1;
    });
    filteredTx.filter((t) => t.type === 'expense').forEach((t) => {
      const d = t.date;
      if (!byDate[d]) byDate[d] = { date: d, revenue: 0, transactions: 0, expenses: 0, commissions: 0 };
      byDate[d].expenses += t.amount || 0;
    });
    filteredComm.forEach((c) => {
      const dt = c.calculatedAt || c.created_at || c.date || c.paidAt;
      const d = dt ? new Date(dt).toISOString().split('T')[0] : '';
      if (d >= startDate && d <= endDate) {
        if (!byDate[d]) byDate[d] = { date: d, revenue: 0, transactions: 0, expenses: 0, commissions: 0 };
        byDate[d].commissions += c.commission || c.commission_value || c.value || 0;
      }
    });

    return Object.values(byDate)
      .map((o) => ({
        ...o,
        profit: (o.revenue || 0) - (o.expenses || 0) - (o.commissions || 0),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  getProductsReport(companyId, startDate, endDate) {
    const products = getProductsRouter();
    const sales = getSalesRouter();
    const filteredSales = sales.filter(
      (s) => s.date >= startDate && s.date <= endDate
    );

    const soldByProduct = {};
    filteredSales.forEach((s) => {
      (s.items || []).forEach((item) => {
        const pid = item.productId;
        if (!soldByProduct[pid]) {
          soldByProduct[pid] = { times_sold: 0, total_quantity_sold: 0, total_revenue: 0 };
        }
        soldByProduct[pid].times_sold += 1;
        soldByProduct[pid].total_quantity_sold += item.quantity || 0;
        soldByProduct[pid].total_revenue += item.totalPrice || 0;
      });
    });

    return products.map((p) => {
      const sold = soldByProduct[p.id] || {};
      const cost = p.cost || p.costPrice || 0;
      const selling = p.price || p.selling_price || 0;
      const stock = p.stock ?? p.current_stock ?? 0;
      const minStock = p.minStock ?? p.min_stock ?? 0;
      let stock_status = 'high';
      if (stock <= minStock) stock_status = 'low';
      else if (stock <= minStock * 2) stock_status = 'medium';

      return {
        id: p.id,
        name: p.name,
        category: p.category,
        current_stock: stock,
        min_stock: minStock,
        cost_price: cost,
        selling_price: selling,
        times_sold: sold.times_sold || 0,
        total_quantity_sold: sold.total_quantity_sold || 0,
        total_revenue: sold.total_revenue || 0,
        stock_status,
        markup_percentage: cost ? ((selling - cost) / cost) * 100 : 0,
      };
    });
  }

  getCachedReport(companyId, reportType, startDate, endDate) {
    return findCached(companyId, reportType, startDate, endDate);
  }

  cacheReport(companyId, reportType, startDate, endDate, data) {
    setCache(companyId, reportType, startDate, endDate, data);
  }
}

module.exports = new ReportService();

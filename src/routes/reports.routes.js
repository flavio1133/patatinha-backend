const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const reportService = require('../services/report.service');

const companyId = null;

function getDefaultDates() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  };
}

router.use(authenticateToken);
router.use(requireRole('master', 'manager'));

router.get('/sales', (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const { startDate: defStart, endDate: defEnd } = getDefaultDates();
    const s = startDate || defStart;
    const e = endDate || defEnd;

    const cached = reportService.getCachedReport(companyId, 'sales', s, e);
    if (cached) return res.json(cached);

    const data = reportService.getSalesReport(companyId, s, e, groupBy);
    reportService.cacheReport(companyId, 'sales', s, e, data);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sales/payment-methods', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { startDate: defStart, endDate: defEnd } = getDefaultDates();
    const s = startDate || defStart;
    const e = endDate || defEnd;
    const data = reportService.getSalesByPaymentMethod(companyId, s, e);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/services', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { startDate: defStart, endDate: defEnd } = getDefaultDates();
    const s = startDate || defStart;
    const e = endDate || defEnd;
    const data = reportService.getServicesReport(companyId, s, e);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/services/by-employee', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { startDate: defStart, endDate: defEnd } = getDefaultDates();
    const s = startDate || defStart;
    const e = endDate || defEnd;
    const data = reportService.getServicesByEmployee(companyId, s, e);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/clients', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { startDate: defStart, endDate: defEnd } = getDefaultDates();
    const s = startDate || defStart;
    const e = endDate || defEnd;
    const data = reportService.getClientsReport(companyId, s, e);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/financial', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { startDate: defStart, endDate: defEnd } = getDefaultDates();
    const s = startDate || defStart;
    const e = endDate || defEnd;
    const data = reportService.getFinancialReport(companyId, s, e);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { startDate: defStart, endDate: defEnd } = getDefaultDates();
    const s = startDate || defStart;
    const e = endDate || defEnd;
    const data = reportService.getProductsReport(companyId, s, e);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

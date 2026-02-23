import axios from 'axios';

// Detectar se está rodando no navegador (web) ou mobile
const isWeb = typeof window !== 'undefined';

// URL da API - usar proxy no web, URL direta no mobile
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (isWeb ? '/api' : 'http://localhost:3000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para web - envia cookies/credentials
  timeout: 30000, // 30 segundos de timeout
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const url = (config.url || '').toString();
    const isPublic =
      url.includes('/login') ||
      url.includes('/register') ||
      url.includes('/validate-cnpj') ||
      url.includes('/validate-invitation-code') ||
      url.includes('/link-client-to-company') ||
      (url.includes('/companies/') && (url.includes('/availability') || url.endsWith('/public')));

    if (isPublic) {
      return config;
    }

    const companyToken = localStorage.getItem('company_token');
    const authToken = localStorage.getItem('auth_token');

    // Na gestão com login da empresa: priorizar company_token para todas as rotas da API
    if (companyToken) {
      config.headers.Authorization = `Bearer ${companyToken}`;
      return config;
    }
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação e melhorar mensagens
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    if (error.response?.status === 401) {
      const path = window.location.pathname;
      const isCompany = path.startsWith('/company');
      const isGestao = path.startsWith('/gestao');
      const hasCompanyToken = !!localStorage.getItem('company_token');
      if (isCompany || (isGestao && hasCompanyToken)) {
        localStorage.removeItem('company_token');
        localStorage.removeItem('company_id');
        localStorage.removeItem('company_role');
        if (!path.includes('/login')) window.location.href = '/company/login';
      } else {
        localStorage.removeItem('auth_token');
        if (!path.includes('/login')) {
          window.location.href = isGestao ? '/gestao/login' : '/cliente/login';
        }
      }
    }

    if (!error.response) {
      console.error('Erro de conexão - servidor pode estar offline ou problema de CORS');
    }

    return Promise.reject(error);
  }
);

export default api;

export const companiesAPI = {
  login: (email, password) =>
    api.post('/companies/login', { email, password }),
  validateCnpj: (cnpj) =>
    api.get(`/companies/validate-cnpj/${cnpj}`),
  register: (data) =>
    api.post('/companies/register', data),
  getById: (id) =>
    api.get(`/companies/${id}`),
  update: (id, data) =>
    api.put(`/companies/${id}`, data),
  uploadLogo: (id, file) => {
    const form = new FormData();
    form.append('logo', file);
    return api.post(`/companies/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getEmployees: (companyId) =>
    api.get(`/companies/${companyId}/employees`),
  createEmployee: (companyId, data) =>
    api.post(`/companies/${companyId}/employees`, data),
  deleteEmployee: (companyId, empId) =>
    api.delete(`/companies/${companyId}/employees/${empId}`),
  getInvitationCodes: (companyId, status) =>
    api.get(`/companies/${companyId}/invitation-codes`, { params: status ? { status } : {} }),
  generateInvitationCode: (companyId) =>
    api.post(`/companies/${companyId}/invitation-codes`),
  deleteInvitationCode: (companyId, code) =>
    api.delete(`/companies/${companyId}/invitation-codes/${code}`),
  resendInvitationCode: (companyId, code) =>
    api.post(`/companies/${companyId}/invitation-codes/${code}/resend`),
  getPublic: (companyId) =>
    api.get(`/companies/${companyId}/public`),
  getAvailability: (companyId, date, service) =>
    api.get(`/companies/${companyId}/availability`, { params: { date, service } }),
  updateSettings: (companyId, data) =>
    api.put(`/companies/${companyId}/settings`, data),
};

export const invitationCodesAPI = {
  validate: (code) =>
    api.post('/validate-invitation-code', { code }),
  linkToCompany: (invitationId) =>
    api.post('/link-client-to-company', { invitationId }),
};

export const subscriptionPlansAPI = {
  getAll: (active = true) =>
    api.get('/subscription-plans', { params: active !== false ? { active: 'true' } : {} }),
  getById: (id) =>
    api.get(`/subscription-plans/${id}`),
};

export const companySubscriptionAPI = {
  getCurrent: () =>
    api.get('/company-subscription/current'),
  getHistory: () =>
    api.get('/company-subscription/history'),
  getNextPayment: () =>
    api.get('/company-subscription/next-payment'),
  checkout: (planId, paymentMethod) =>
    api.post('/company-subscription/checkout', { plan_id: planId, payment_method: paymentMethod }),
  cancel: () =>
    api.post('/company-subscription/cancel'),
  reactivate: () =>
    api.post('/company-subscription/reactivate'),
};

export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  register: (data) =>
    api.post('/auth/register', data),
  getProfile: () =>
    api.get('/auth/me'),
  updateProfile: (data) =>
    api.put('/auth/me', data),
};

export const customersAPI = {
  getAll: (search) =>
    api.get('/customers', { params: { search } }),
  getById: (id) =>
    api.get(`/customers/${id}`),
  create: (data) =>
    api.post('/customers', data),
  update: (id, data) =>
    api.put(`/customers/${id}`, data),
};

export const appointmentsAPI = {
  getAll: (params) =>
    api.get('/appointments', { params }),
  getById: (id) =>
    api.get(`/appointments/${id}`),
  create: (data) =>
    api.post('/appointments', data),
  update: (id, data) =>
    api.put(`/appointments/${id}`, data),
  cancel: (id) =>
    api.delete(`/appointments/${id}`),
  getAvailability: (date, service) =>
    api.get('/appointments/availability', { params: { date, service } }),
  checkIn: (id) =>
    api.post(`/appointments/${id}/check-in`),
  checkOut: (id, data) =>
    api.post(`/appointments/${id}/check-out`, data),
  getWeeklySchedule: (startDate) =>
    api.get('/appointments/schedule/week', { params: { startDate } }),
};

export const inventoryAPI = {
  getAll: (params) =>
    api.get('/inventory', { params }),
  getById: (id) =>
    api.get(`/inventory/${id}`),
  create: (data) =>
    api.post('/inventory', data),
  update: (id, data) =>
    api.put(`/inventory/${id}`, data),
  stockIn: (id, data) =>
    api.post(`/inventory/${id}/stock-in`, data),
  stockOut: (id, data) =>
    api.post(`/inventory/${id}/stock-out`, data),
  getLowStockAlerts: () =>
    api.get('/inventory/alerts/low-stock'),
};

export const salesAPI = {
  getAll: (params) =>
    api.get('/sales', { params }),
  create: (data) =>
    api.post('/sales', data),
  getReport: (params) =>
    api.get('/sales/reports/summary', { params }),
  cashClosing: (data) =>
    api.post('/sales/cash-closing', data),
};

export const financeAPI = {
  getTransactions: (params) =>
    api.get('/cashflow', { params }),
  createTransaction: (data) =>
    api.post('/cashflow', data),
  getDailyDashboard: (date) =>
    api.get('/cashflow/dashboard/daily', { params: { date } }),
  getMonthlyDashboard: (year, month) =>
    api.get('/cashflow/dashboard/monthly', { params: { year, month } }),
  getForecast: (days) =>
    api.get('/cashflow/forecast', { params: { days } }),
};

export const adminAPI = {
  getDashboard: () =>
    api.get('/admin/dashboard'),
  getConsolidatedReport: (params) =>
    api.get('/admin/reports/consolidated', { params }),
};

export const reportsAPI = {
  getSales: (params) =>
    api.get('/reports/sales', { params }),
  getSalesByPayment: (params) =>
    api.get('/reports/sales/payment-methods', { params }),
  getServices: (params) =>
    api.get('/reports/services', { params }),
  getServicesByEmployee: (params) =>
    api.get('/reports/services/by-employee', { params }),
  getClients: (params) =>
    api.get('/reports/clients', { params }),
  getFinancial: (params) =>
    api.get('/reports/financial', { params }),
  getProducts: (params) =>
    api.get('/reports/products', { params }),
};

export const petsAPI = {
  getAll: (customerId) =>
    api.get('/pets', { params: customerId ? { customerId } : {} }),
  getById: (id) =>
    api.get(`/pets/${id}`),
  getHistory: (id) =>
    api.get(`/pets/${id}/history`),
  create: (data) =>
    api.post('/pets', data),
  update: (id, data) =>
    api.put(`/pets/${id}`, data),
  delete: (id) =>
    api.delete(`/pets/${id}`),
};

export const photosAPI = {
  getByPet: (petId) =>
    api.get(`/photos/pet/${petId}`),
  getBeforeAfter: (id) =>
    api.get(`/photos/before-after/${id}`),
  create: (data) =>
    api.post('/photos', data),
  createBeforeAfter: (data) =>
    api.post('/photos/before-after', data),
  delete: (id) =>
    api.delete(`/photos/${id}`),
};

export const professionalsAPI = {
  getAll: () =>
    api.get('/professionals'),
  getById: (id) =>
    api.get(`/professionals/${id}`),
};

export const notificationsAPI = {
  getAll: (params) =>
    api.get('/notifications', { params }),
  markAsRead: (id) =>
    api.put(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.put('/notifications/read-all'),
  delete: (id) =>
    api.delete(`/notifications/${id}`),
  registerToken: (token, platform, deviceId) =>
    api.post('/notifications/tokens', { token, platform, device_id: deviceId }),
};

export const clientsAPI = {
  getNextAppointment: () =>
    appointmentsAPI.getAll().then((res) => {
      const appointments = res.data?.appointments || [];
      const today = new Date().toISOString().split('T')[0];
      const next = appointments
        .filter((a) => a.status !== 'cancelled' && a.date >= today)
        .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))[0];
      return { data: next || null };
    }),
  getPets: () =>
    petsAPI.getAll().then((res) => ({ data: res.data?.pets || [] })),
  getLastAppointments: (limit = 10) =>
    appointmentsAPI.getAll().then((res) => {
      const appointments = res.data?.appointments || [];
      const sorted = [...appointments].sort((a, b) =>
        (b.date + (b.time || '')).localeCompare(a.date + (a.time || ''))
      );
      return { data: sorted.slice(0, limit) };
    }),
  getRecentPhotos: () =>
    petsAPI.getAll().then(async (res) => {
      const pets = res.data?.pets || [];
      const allPhotos = [];
      for (const pet of pets.slice(0, 5)) {
        try {
          const r = await photosAPI.getByPet(pet.id);
          const photos = (r.data?.photos || []).map((p) => ({ ...p, petName: pet.name }));
          allPhotos.push(...photos);
        } catch {
          // ignore
        }
      }
      allPhotos.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      return { data: allPhotos.slice(0, 12) };
    }),
};

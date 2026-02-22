const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Importar Firebase e App Check (com a nova lógica condicional)
const { verifyAppCheck } = require('./services/firebase');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
// Configuração CORS completa para web e mobile
const allowedOrigins = [
  'http://localhost:3005',
  'http://localhost:3006',
  'http://localhost:3007',
  'http://localhost:3008',
  'http://localhost:3009',
  'http://localhost:3010',
  'http://localhost:3000',
  'http://127.0.0.1:3005',
  'http://127.0.0.1:3006',
  'http://127.0.0.1:3007',
  'http://127.0.0.1:3008',
  'http://127.0.0.1:3009',
  'http://127.0.0.1:3000',
  'https://patatinha-petshop.web.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('🚫 CORS bloqueado para:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Firebase-AppCheck'],
  exposedHeaders: ['Authorization'],
}));

// Tratar preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔒 Middleware do App Check (AGORA CONTROLADO POR VARIÁVEL DE AMBIENTE)
app.use('/api', verifyAppCheck);

// Servir uploads estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas públicas (antes de auth)
app.use('/api/companies', require('./routes/companies.routes'));
app.use('/api/subscription-plans', require('./routes/subscription-plans.routes'));
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api', require('./routes/invitation-codes.routes'));

// Rotas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/customers', require('./routes/customers.routes'));
app.use('/api/pets', require('./routes/pets.routes'));
app.use('/api/medical-records', require('./routes/medical-records.routes'));
app.use('/api/vaccinations', require('./routes/vaccinations.routes'));
app.use('/api/photos', require('./routes/photos.routes'));
app.use('/api/professionals', require('./routes/professionals.routes'));
app.use('/api/appointments', require('./routes/appointments.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/sales', require('./routes/sales.routes'));
app.use('/api/service-costs', require('./routes/service-costs.routes'));
app.use('/api/cashflow', require('./routes/cashflow.routes'));
app.use('/api/commissions', require('./routes/commissions.routes'));
app.use('/api/subscriptions', require('./routes/subscriptions.routes'));
app.use('/api/company-subscription', require('./routes/company-subscription.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

// Seed de dados para desenvolvimento (profissionais, pets, agendamentos)
if (process.env.NODE_ENV !== 'production') {
  try {
    const { runSeed } = require('./scripts/seed-data');
    runSeed();
  } catch (err) {
    console.error('Erro no seed:', err.message);
  }
}

// Rota de teste (pública, mas passa pelo App Check)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Patatinha API está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(500).json({
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Exportar app para testes
module.exports = app;

// Iniciar servidor apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);

    // Jobs de expiração de códigos (executa na inicialização e a cada 24h)
    try {
      const { runAll: runInvitationJobs } = require('./jobs/invitationCodeJobs');
      runInvitationJobs();
      setInterval(runInvitationJobs, 24 * 60 * 60 * 1000);
    } catch (err) {
      console.warn('Jobs de códigos não carregados:', err.message);
    }
  });
}
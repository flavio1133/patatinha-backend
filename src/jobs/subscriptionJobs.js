/**
 * Jobs para verificação de assinaturas
 * Para agendar: npm install node-cron e descomente o código no final
 */

function getCompanies() {
  const { companies } = require('../routes/companies.routes');
  return companies;
}

function getNotificationService() {
  try {
    return require('../services/notification.service');
  } catch {
    return null;
  }
}

// Verificar trials prestes a expirar (3 dias)
function checkExpiringTrials() {
  const companies = getCompanies();
  const now = new Date();
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);

  companies
    .filter((c) => c.subscription_status === 'trial' && c.trial_end) 
    .forEach((c) => {
      const end = new Date(c.trial_end);
      if (end >= now && end <= in3Days) {
        const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        console.log(`[Job] Trial expira em ${days} dias: ${c.name} (${c.email})`);
        const notif = getNotificationService();
        if (notif) {
          try {
            notif.sendEmail(c.email, 'Trial expirando', `Seu período de teste termina em ${days} dias.`);
          } catch (e) {
            console.error('Erro ao enviar notificação:', e.message);
          }
        }
      }
    });
}

// Bloquear trials expirados
function blockExpiredTrials() {
  const companies = getCompanies();
  const now = new Date();

  companies.forEach((c) => {
    if (c.subscription_status === 'trial' && c.trial_end) {
      const end = new Date(c.trial_end);
      if (end <= now) {
        c.subscription_status = 'expired';
        c.updated_at = new Date();
        console.log(`[Job] Trial expirado: ${c.name} (${c.email})`);
      }
    }
  });
}

// Verificar assinaturas inadimplentes
function checkPastDueSubscriptions() {
  const companies = getCompanies();
  const pastDue = companies.filter((c) => c.subscription_status === 'past_due');
  pastDue.forEach((c) => {
    console.log(`[Job] Inadimplente: ${c.name}`);
    const notif = getNotificationService();
    if (notif) {
      try {
        notif.sendEmail(c.email, 'Pagamento pendente', 'Sua assinatura está inadimplente. Atualize o método de pagamento.');
      } catch (e) {}
    }
  });
}

// Executar jobs manualmente (para testes)
function runAll() {
  checkExpiringTrials();
  blockExpiredTrials();
  checkPastDueSubscriptions();
}

module.exports = {
  checkExpiringTrials,
  blockExpiredTrials,
  checkPastDueSubscriptions,
  runAll,
};

// Agendar com node-cron (descomente após: npm install node-cron)
/*
const cron = require('node-cron');
cron.schedule('0 8 * * *', () => {
  checkExpiringTrials();
  blockExpiredTrials();
});
cron.schedule('0 10 * * 1', checkPastDueSubscriptions);
*/

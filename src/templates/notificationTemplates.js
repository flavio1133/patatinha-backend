const notificationTemplates = {
  appointment_reminder: {
    title: 'Lembrete de agendamento 🐾',
    body: 'Olá! {{pet_name}} tem agendamento amanhã às {{time}}. Confirme sua presença!',
    variables: ['pet_name', 'time', 'date'],
  },
  pet_ready: {
    title: '{{pet_name}} está pronto! 🐶',
    body: 'Seu pet está lindo e esperando por você! Passe aqui para buscá-lo.',
    variables: ['pet_name'],
  },
  check_in: {
    title: '{{pet_name}} chegou! ✅',
    body: 'Seu pet acabou de chegar para o banho. Previsão de término: {{time}}.',
    variables: ['pet_name', 'time'],
  },
  vaccine_alert: {
    title: 'Vacina próxima do vencimento 💉',
    body: 'A vacina {{vaccine_name}} do {{pet_name}} vence em {{days}} dias. Agende já!',
    variables: ['pet_name', 'vaccine_name', 'days'],
  },
  promotion: {
    title: 'Oferta especial! 🎉',
    body: '{{discount}}% de desconto em {{service}}. Válido até {{date}}.',
    variables: ['discount', 'service', 'date'],
  },
  low_stock_alert: {
    title: '⚠️ Estoque baixo',
    body: '{{product}} está com apenas {{quantity}} unidades. Mínimo recomendado: {{min}}.',
    variables: ['product', 'quantity', 'min'],
  },
  new_appointment: {
    title: 'Novo agendamento! 📅',
    body: '{{client}} agendou {{service}} para {{pet}} às {{time}}.',
    variables: ['client', 'pet', 'service', 'time'],
  },
  payment_received: {
    title: '💰 Pagamento recebido',
    body: 'Pagamento de R$ {{amount}} confirmado. Obrigado!',
    variables: ['amount'],
  },
  subscription_expiring: {
    title: '⚠️ Assinatura próxima do vencimento',
    body: 'Sua assinatura vence em {{days}} dias. Renove para não perder o acesso.',
    variables: ['days'],
  },
};

function applyTemplate(template, vars = {}) {
  let title = template.title;
  let body = template.body;
  Object.entries(vars).forEach(([k, v]) => {
    const re = new RegExp(`{{${k}}}`, 'g');
    title = title.replace(re, String(v ?? ''));
    body = body.replace(re, String(v ?? ''));
  });
  return { title, body };
}

module.exports = { notificationTemplates, applyTemplate };

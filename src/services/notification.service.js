// Serviço de notificações (SMS, WhatsApp, Push)
// Usa pushService (OneSignal) e whatsappService (Meta API) quando configurados

const pushService = require('./pushService');
const whatsappService = require('./whatsappService');

class NotificationService {
  // Enviar SMS (simulado - integrar Twilio/Zenvia conforme necessário)
  static async sendSMS(phone, message) {
    console.log(`[SMS] Para ${phone}: ${message}`);
    return { success: true, message: 'SMS enviado (simulado)' };
  }

  // Enviar WhatsApp - usa WhatsApp Business API quando configurado
  static async sendWhatsApp(phone, message, mediaUrl = null) {
    try {
      const result = await whatsappService.sendMessage(phone, message);
      if (mediaUrl) {
        console.log(`[WhatsApp] Mídia ignorada em mensagem texto: ${mediaUrl}`);
      }
      return { success: result?.success !== false, ...result };
    } catch (err) {
      console.error('[Notification] WhatsApp:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Enviar Push - usa OneSignal quando configurado
  static async sendPush(userId, title, body, data = {}) {
    try {
      const result = await pushService.sendToUser(userId, {
        title,
        body,
        data,
        priority: 'normal',
      });
      return { success: result?.success !== false, ...result };
    } catch (err) {
      console.error('[Notification] Push:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Notificação de confirmação de agendamento
  static async sendAppointmentConfirmation(appointment, customer) {
    const message = `Olá, ${customer.name}! Seu agendamento para ${appointment.service} do ${appointment.petName} foi confirmado para ${appointment.date} às ${appointment.time}. Te esperamos! 🐾`;
    
    if (customer.phone) {
      await this.sendWhatsApp(customer.phone, message);
    }
    
    return { success: true };
  }

  // Notificação de check-in
  static async sendCheckInNotification(appointment, customer) {
    const estimatedTime = appointment.estimatedCompletionTime 
      ? new Date(appointment.estimatedCompletionTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      : 'em breve';
    
    const message = `Olá, ${customer.name}! Seu pet ${appointment.petName} chegou! 🐶 Previsão de término: ${estimatedTime}. Avisaremos quando estiver pronto!`;
    
    if (customer.phone) {
      await this.sendWhatsApp(customer.phone, message);
      await this.sendPush(customer.userId, 'Pet chegou!', `O ${appointment.petName} deu entrada.`);
    }
    
    return { success: true };
  }

  // Notificação de check-out
  static async sendCheckOutNotification(appointment, customer, photoUrl = null) {
    let message = `Olá, ${customer.name}! O ${appointment.service} do ${appointment.petName} ficou lindo! 🐕 Já pode passar aqui para buscá-lo. Temos estacionamento fácil. Até já! 🐾`;
    
    if (customer.phone) {
      if (photoUrl) {
        await this.sendWhatsApp(customer.phone, message, photoUrl);
      } else {
        await this.sendWhatsApp(customer.phone, message);
      }
      
      await this.sendSMS(customer.phone, `${appointment.petName} está pronto para busca! 🐕 Pet Shop Patatinha`);
      await this.sendPush(customer.userId, 'Pet pronto!', `O ${appointment.petName} está pronto para busca.`);
    }
    
    return { success: true };
  }

  // Notificação de lembrete de busca
  static async sendPickupReminder(appointment, customer) {
    const message = `Olá, ${customer.name}! Apenas lembrando que o ${appointment.petName} está aguardando você. Já está lindo e cheiroso! 😊`;
    
    if (customer.phone) {
      await this.sendWhatsApp(customer.phone, message);
    }
    
    return { success: true };
  }

  // Notificação de confirmação 24h antes
  static async sendAppointmentReminder(appointment, customer) {
    const message = `Olá, ${customer.name}! Lembrando que você tem agendamento para ${appointment.service} do ${appointment.petName} amanhã às ${appointment.time}. Confirma? (Sim/Não)`;
    
    if (customer.phone) {
      await this.sendWhatsApp(customer.phone, message);
    }
    
    return { success: true };
  }
}

module.exports = NotificationService;
